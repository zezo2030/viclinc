import { Injectable, NotFoundException, BadRequestException, ConflictException, ForbiddenException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Appointment, AppointmentDocument, AppointmentStatus, AppointmentType, PaymentStatus } from '../schemas/appointment.schema';
import { CreateAppointmentDto } from '../dto/create-appointment.dto';
import { CancelAppointmentDto } from '../dto/cancel-appointment.dto';
import { RescheduleAppointmentDto } from '../dto/reschedule-appointment.dto';
import { AppointmentQueryDto } from '../dto/appointment-query.dto';
import { ConfirmAppointmentDto } from '../dto/confirm-appointment.dto';
import { RejectAppointmentDto } from '../dto/reject-appointment.dto';
import { RedisService } from '../../shared/redis/redis.service';
import { AvailabilityService } from './availability.service';
import { DoctorService, DoctorServiceDocument } from '../../doctors/schemas/doctor-service.schema';
import { Service, ServiceDocument } from '../../services/schemas/service.schema';
import { DoctorProfile, DoctorProfileDocument } from '../../doctors/schemas/doctor-profile.schema';
import { NotificationsService } from '../../notifications/notifications.service';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';

dayjs.extend(utc);
dayjs.extend(timezone);

export interface AppointmentResponse {
  id: string;
  doctorId: string;
  patientId: string;
  serviceId: string;
  startAt: string;
  endAt: string;
  status: AppointmentStatus;
  type: AppointmentType;
  price: number;
  duration: number;
  holdExpiresAt?: string;
  cancellationReason?: string;
  cancelledAt?: string;
  metadata?: Record<string, any>;
  paymentStatus?: PaymentStatus;
  paymentId?: string;
  requiresPayment?: boolean;
  createdAt: string;
  updatedAt: string;
  // Populated fields (optional)
  doctor?: {
    id: string;
    name: string;
    licenseNumber?: string;
  };
  service?: {
    id: string;
    name: string;
  };
}

export interface PaginatedAppointments {
  appointments: AppointmentResponse[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

@Injectable()
export class AppointmentService {
  private readonly HOLD_TTL_MINUTES = 15; // 15 دقيقة للحجز المؤقت
  private readonly CANCELLATION_DEADLINE_HOURS = 24; // 24 ساعة للإلغاء

  constructor(
    @InjectModel(Appointment.name)
    private readonly appointmentModel: Model<AppointmentDocument>,
    @InjectModel(DoctorService.name)
    private readonly doctorServiceModel: Model<DoctorServiceDocument>,
    @InjectModel(Service.name)
    private readonly serviceModel: Model<ServiceDocument>,
    @InjectModel(DoctorProfile.name)
    private readonly doctorProfileModel: Model<DoctorProfileDocument>,
    private readonly redisService: RedisService,
    private readonly availabilityService: AvailabilityService,
    private readonly notificationsService: NotificationsService,
  ) {}

  /**
   * إنشاء حجز جديد
   */
  async createAppointment(
    createDto: CreateAppointmentDto,
    patientId: string,
    idempotencyKey?: string,
  ): Promise<AppointmentResponse> {
    // التحقق من Idempotency Key
    if (idempotencyKey) {
      const existingKey = await this.redisService.getIdempotencyKey(`idempotency:${idempotencyKey}`);
      if (existingKey) {
        const existingAppointment = await this.appointmentModel.findById(existingKey);
        if (existingAppointment) {
          return this.mapToResponse(existingAppointment);
        }
      }
    }

    const doctorId = new Types.ObjectId(createDto.doctorId);
    const serviceId = new Types.ObjectId(createDto.serviceId);
    const startAt = dayjs(createDto.startAt).utc().toDate();

    // التحقق من وجود الطبيب والخدمة
    await this.validateDoctorAndService(doctorId, serviceId);

    // التحقق من توفر الفتحة
    await this.validateAvailability(doctorId, serviceId, startAt);

    // حساب المدة والسعر
    const { duration, price } = await this.calculateDurationAndPrice(doctorId, serviceId);

    const endAt = dayjs(startAt).add(duration, 'minute').toDate();
    // إزالة holdExpiresAt لمنع الحذف التلقائي من MongoDB TTL index
    // const holdExpiresAt = dayjs().add(this.HOLD_TTL_MINUTES, 'minute').toDate();

    // قفل Redis لمنع التداخل
    const lockKey = `appointment:lock:${doctorId}:${startAt.getTime()}`;
    const lockAcquired = await this.redisService.acquireLock(lockKey, 30);

    if (!lockAcquired) {
      throw new ConflictException('This time slot is currently being booked by another user');
    }

    try {
      // التحقق من عدم التداخل مرة أخرى
      await this.checkForConflicts(doctorId, startAt, endAt);

      // تحديد ما إذا كان الموعد يتطلب دفعاً
      const requiresPayment = createDto.type === AppointmentType.VIDEO || createDto.type === AppointmentType.CHAT;

      // إنشاء الحجز
      const appointment = new this.appointmentModel({
        doctorId,
        patientId: new Types.ObjectId(patientId),
        serviceId,
        startAt,
        endAt,
        status: AppointmentStatus.PENDING_CONFIRM,
        type: createDto.type,
        // holdExpiresAt: undefined, // تم إزالة holdExpiresAt لمنع الحذف التلقائي
        idempotencyKey,
        price,
        duration,
        metadata: createDto.metadata,
        requiresPayment,
        paymentStatus: requiresPayment ? PaymentStatus.PENDING : PaymentStatus.NONE,
      });

      const savedAppointment = await appointment.save();

      // إرسال إشعار للطبيب بوجود حجز جديد
      try {
        await this.appointmentModel.populate(savedAppointment, [
          { path: 'patientId', select: 'name' },
          { path: 'serviceId', select: 'name' },
        ]);

        const patientName = (savedAppointment.patientId as any)?.name || 'مريض';
        const serviceName = (savedAppointment.serviceId as any)?.name || '';
        const appointmentDate = dayjs(savedAppointment.startAt).format('YYYY-MM-DD');
        const appointmentTime = dayjs(savedAppointment.startAt).format('HH:mm');

        const title = 'حجز موعد جديد';
        const body = `${patientName} حجز موعد${serviceName ? ` لخدمة ${serviceName}` : ''} في ${appointmentDate} الساعة ${appointmentTime}`;

        await this.notificationsService.sendNotificationToUser(
          savedAppointment.doctorId.toString(),
          title,
          body,
          {
            type: 'new_appointment',
            appointmentId: String(
              (savedAppointment as AppointmentDocument)._id || (savedAppointment as any).id,
            ),
          },
        );
      } catch (error) {
        console.error('Failed to send notification for new appointment:', error);
      }

      // حفظ Idempotency Key
      if (idempotencyKey) {
        await this.redisService.setIdempotencyKey(
          `idempotency:${idempotencyKey}`,
          (savedAppointment as any)._id.toString(),
          900 // 15 دقيقة
        );
      }

      return this.mapToResponse(savedAppointment);
    } finally {
      // تحرير القفل
      await this.redisService.releaseLock(lockKey);
    }
  }

  /**
   * إلغاء حجز
   */
  async cancelAppointment(
    appointmentId: string,
    patientId: string,
    cancelDto: CancelAppointmentDto,
  ): Promise<AppointmentResponse> {
    const appointment = await this.appointmentModel.findById(appointmentId);
    
    if (!appointment) {
      throw new NotFoundException('Appointment not found');
    }

    // التحقق من الملكية
    if (appointment.patientId.toString() !== patientId) {
      throw new ForbiddenException('You can only cancel your own appointments');
    }

    // التحقق من الحالة
    if (appointment.status !== AppointmentStatus.PENDING_CONFIRM && 
        appointment.status !== AppointmentStatus.CONFIRMED) {
      throw new BadRequestException('Cannot cancel appointment with current status');
    }

    // التحقق من المهلة الزمنية
    const now = dayjs();
    const appointmentStart = dayjs(appointment.startAt);
    const hoursUntilAppointment = appointmentStart.diff(now, 'hour');

    if (hoursUntilAppointment <= this.CANCELLATION_DEADLINE_HOURS) {
      throw new BadRequestException(
        `Cannot cancel appointment less than ${this.CANCELLATION_DEADLINE_HOURS} hours before start time`
      );
    }

    // تحديث الحجز
    appointment.status = AppointmentStatus.CANCELLED;
    appointment.cancellationReason = cancelDto.reason;
    appointment.cancelledAt = new Date();
    appointment.cancelledBy = new Types.ObjectId(patientId);

    const updatedAppointment = await appointment.save();
    
    // Send notification to doctor about cancellation
    try {
      await this.appointmentModel.populate(updatedAppointment, [
        { path: 'patientId', select: 'name' },
        { path: 'doctorId', select: 'name' },
        { path: 'serviceId', select: 'name' },
      ]);
      
      const patientName = (updatedAppointment.patientId as any)?.name || 'المريض';
      const doctorName = (updatedAppointment.doctorId as any)?.name || 'الطبيب';
      const serviceName = (updatedAppointment.serviceId as any)?.name || '';
      const appointmentDate = dayjs(updatedAppointment.startAt).format('YYYY-MM-DD');
      const appointmentTime = dayjs(updatedAppointment.startAt).format('HH:mm');
      
      // Notify doctor
      const doctorTitle = 'تم إلغاء موعد';
      const doctorBody = `تم إلغاء موعد مع ${patientName} في ${appointmentDate} الساعة ${appointmentTime}`;
      
      await this.notificationsService.sendNotificationToUser(
        updatedAppointment.doctorId.toString(),
        doctorTitle,
        doctorBody,
        {
          type: 'appointment_cancelled',
          appointmentId: String((updatedAppointment as AppointmentDocument)._id || (updatedAppointment as any).id),
        },
      );

      // Notify patient about cancellation
      // Handle patientId - it might be ObjectId or populated object
      const patientId = updatedAppointment.patientId instanceof Types.ObjectId
        ? updatedAppointment.patientId.toString()
        : (updatedAppointment.patientId as any)?._id
        ? (updatedAppointment.patientId as any)._id.toString()
        : String(updatedAppointment.patientId);
      
      const patientTitle = 'تم إلغاء موعدك';
      const patientBody = `تم إلغاء موعدك مع ${doctorName}${serviceName ? ` - ${serviceName}` : ''} في ${appointmentDate} الساعة ${appointmentTime}${cancelDto.reason ? `. السبب: ${cancelDto.reason}` : ''}`;
      
      await this.notificationsService.sendNotificationToUser(
        patientId,
        patientTitle,
        patientBody,
        {
          type: 'appointment_cancelled',
          appointmentId: String((updatedAppointment as AppointmentDocument)._id || (updatedAppointment as any).id),
        },
      );
    } catch (error) {
      console.error('Failed to send notification for appointment cancellation:', error);
    }
    
    return this.mapToResponse(updatedAppointment);
  }

  /**
   * إعادة جدولة حجز
   */
  async rescheduleAppointment(
    appointmentId: string,
    patientId: string,
    rescheduleDto: RescheduleAppointmentDto,
  ): Promise<AppointmentResponse> {
    const appointment = await this.appointmentModel.findById(appointmentId);
    
    if (!appointment) {
      throw new NotFoundException('Appointment not found');
    }

    // التحقق من الملكية
    if (appointment.patientId.toString() !== patientId) {
      throw new ForbiddenException('You can only reschedule your own appointments');
    }

    // التحقق من الحالة
    if (appointment.status !== AppointmentStatus.PENDING_CONFIRM && 
        appointment.status !== AppointmentStatus.CONFIRMED) {
      throw new BadRequestException('Cannot reschedule appointment with current status');
    }

    // التحقق من المهلة الزمنية
    const now = dayjs();
    const appointmentStart = dayjs(appointment.startAt);
    const hoursUntilAppointment = appointmentStart.diff(now, 'hour');

    if (hoursUntilAppointment <= this.CANCELLATION_DEADLINE_HOURS) {
      throw new BadRequestException(
        `Cannot reschedule appointment less than ${this.CANCELLATION_DEADLINE_HOURS} hours before start time`
      );
    }

    const newStartAt = dayjs(rescheduleDto.newStartAt).utc().toDate();
    const newEndAt = dayjs(newStartAt).add(appointment.duration, 'minute').toDate();

    // التحقق من توفر الفتحة الجديدة
    await this.validateAvailability(appointment.doctorId, appointment.serviceId, newStartAt);

    // قفل Redis للوقت الجديد
    const lockKey = `appointment:lock:${appointment.doctorId}:${newStartAt.getTime()}`;
    const lockAcquired = await this.redisService.acquireLock(lockKey, 30);

    if (!lockAcquired) {
      throw new ConflictException('The new time slot is currently being booked by another user');
    }

    try {
      // التحقق من عدم التداخل للوقت الجديد
      await this.checkForConflicts(appointment.doctorId, newStartAt, newEndAt, appointmentId);

      // تحديث الحجز
      appointment.startAt = newStartAt;
      appointment.endAt = newEndAt;
      // إزالة holdExpiresAt لمنع الحذف التلقائي من MongoDB TTL index
      appointment.holdExpiresAt = undefined;
      appointment.status = AppointmentStatus.PENDING_CONFIRM;

      if (rescheduleDto.metadata) {
        appointment.metadata = { ...appointment.metadata, ...rescheduleDto.metadata };
      }

      const updatedAppointment = await appointment.save();
      return this.mapToResponse(updatedAppointment);
    } finally {
      await this.redisService.releaseLock(lockKey);
    }
  }

  /**
   * الحصول على حجوزات المريض
   */
  async getPatientAppointments(
    patientId: string,
    query: AppointmentQueryDto,
  ): Promise<PaginatedAppointments> {
    try {
      const filter: any = { patientId: new Types.ObjectId(patientId) };

      if (query.status) {
        filter.status = query.status;
      }

      if (query.startDate || query.endDate) {
        filter.startAt = {};
        if (query.startDate) {
          filter.startAt.$gte = new Date(query.startDate);
        }
        if (query.endDate) {
          filter.startAt.$lte = new Date(query.endDate);
        }
      }

      const page = query.page || 1;
      const limit = query.limit || 10;
      const skip = (page - 1) * limit;

      const [appointments, total] = await Promise.all([
        this.appointmentModel
          .find(filter)
          .populate('doctorId', 'name licenseNumber')
          .populate('serviceId', 'name')
          .sort({ startAt: -1 })
          .skip(skip)
          .limit(limit)
          .exec(),
        this.appointmentModel.countDocuments(filter),
      ]);

      return {
        appointments: appointments.map(appointment => this.mapToResponse(appointment)),
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      };
    } catch (error) {
      console.error('Error in getPatientAppointments:', error);
      throw error;
    }
  }

  /**
   * الحصول على حجوزات الطبيب
   */
  async getDoctorAppointments(
    doctorId: string,
    query: AppointmentQueryDto,
  ): Promise<PaginatedAppointments> {
    const filter: any = { doctorId: new Types.ObjectId(doctorId) };

    if (query.status) {
      filter.status = query.status;
    }

    if (query.startDate || query.endDate) {
      filter.startAt = {};
      if (query.startDate) {
        filter.startAt.$gte = new Date(query.startDate);
      }
      if (query.endDate) {
        filter.startAt.$lte = new Date(query.endDate);
      }
    }

    const page = query.page || 1;
    const limit = query.limit || 10;
    const skip = (page - 1) * limit;

    const [appointments, total] = await Promise.all([
      this.appointmentModel
        .find(filter)
        .populate('patientId', 'email phone')
        .populate('serviceId', 'name')
        .sort({ startAt: -1 })
        .skip(skip)
        .limit(limit)
        .exec(),
      this.appointmentModel.countDocuments(filter),
    ]);

    return {
      appointments: appointments.map(appointment => this.mapToResponse(appointment)),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * التحقق من وجود الطبيب والخدمة
   */
  private async validateDoctorAndService(doctorId: Types.ObjectId, serviceId: Types.ObjectId): Promise<void> {
    const [doctor, service] = await Promise.all([
      this.doctorProfileModel.findById(doctorId),
      this.serviceModel.findById(serviceId),
    ]);

    if (!doctor) {
      throw new NotFoundException('Doctor not found');
    }

    if (!service) {
      throw new NotFoundException('Service not found');
    }

    if (doctor.status !== 'APPROVED') {
      throw new BadRequestException('Doctor is not approved');
    }

    // التحقق من أن الطبيب يقدم هذه الخدمة
    const doctorService = await this.doctorServiceModel.findOne({
      doctorId,
      serviceId,
      isActive: true,
    });

    if (!doctorService) {
      throw new BadRequestException('Doctor does not provide this service');
    }
  }

  /**
   * التحقق من توفر الفتحة
   */
  private async validateAvailability(
    doctorId: Types.ObjectId,
    serviceId: Types.ObjectId,
    startAt: Date,
  ): Promise<void> {
    // استخدام UTC لضمان التطابق
    const startAtUtc = dayjs(startAt).utc();
    const weekStart = startAtUtc.startOf('week');
    
    const availability = await this.availabilityService.getDoctorAvailability(
      doctorId.toString(),
      serviceId.toString(),
      weekStart.toISOString(),
    );

    // استخدام UTC للمقارنة
    const requestedStartTime = startAtUtc;
    const isAvailable = availability.availableSlots.some(slot => {
      // مقارنة التاريخ والوقت معاً (مع التسامح في الدقائق)
      const slotTime = dayjs(slot.startTime).utc();
      
      // المقارنة بدقة الدقيقة (التجاهل للثواني والمللي ثانية)
      return slotTime.isSame(requestedStartTime, 'minute');
    });

    if (!isAvailable) {
      // إضافة معلومات إضافية للخطأ لمساعدة في التصحيح
      const availableTimes = availability.availableSlots
        .map(slot => dayjs(slot.startTime).utc().format('YYYY-MM-DD HH:mm'))
        .slice(0, 10); // أول 10 فتحات فقط
      
      throw new BadRequestException(
        `The requested time slot is not available. Requested: ${requestedStartTime.format('YYYY-MM-DD HH:mm')} UTC. Available slots: ${availableTimes.join(', ')}`
      );
    }
  }

  /**
   * حساب المدة والسعر
   */
  private async calculateDurationAndPrice(
    doctorId: Types.ObjectId,
    serviceId: Types.ObjectId,
  ): Promise<{ duration: number; price: number }> {
    const doctorService = await this.doctorServiceModel.findOne({
      doctorId,
      serviceId,
      isActive: true,
    });

    const service = await this.serviceModel.findById(serviceId);

    const duration = doctorService?.customDuration || service?.defaultDurationMin || 30;
    const price = doctorService?.customPrice || service?.defaultPrice || 0;

    return { duration, price };
  }

  /**
   * التحقق من عدم التداخل
   */
  private async checkForConflicts(
    doctorId: Types.ObjectId,
    startAt: Date,
    endAt: Date,
    excludeAppointmentId?: string,
  ): Promise<void> {
    const filter: any = {
      doctorId,
      status: { $in: [AppointmentStatus.PENDING_CONFIRM, AppointmentStatus.CONFIRMED] },
      $or: [
        {
          startAt: { $lt: endAt },
          endAt: { $gt: startAt },
        },
      ],
    };

    if (excludeAppointmentId) {
      filter._id = { $ne: new Types.ObjectId(excludeAppointmentId) };
    }

    const conflictingAppointment = await this.appointmentModel.findOne(filter);

    if (conflictingAppointment) {
      throw new ConflictException('Time slot conflicts with existing appointment');
    }
  }

  /**
   * تحويل Appointment إلى Response
   */
  /**
   * تحديث حالة الدفع للموعد
   */
  async markAsPaid(appointmentId: string, paymentId: string): Promise<AppointmentResponse> {
    const appointment = await this.appointmentModel.findById(appointmentId);
    
    if (!appointment) {
      throw new NotFoundException('الموعد غير موجود');
    }

    if (!appointment.requiresPayment) {
      throw new BadRequestException('هذا الموعد لا يتطلب دفعاً');
    }

    if (appointment.paymentStatus === PaymentStatus.COMPLETED) {
      throw new BadRequestException('تم دفع هذا الموعد مسبقاً');
    }

    appointment.paymentStatus = PaymentStatus.COMPLETED;
    appointment.paymentId = new Types.ObjectId(paymentId);
    
    // حذف holdExpiresAt لمنع الحذف التلقائي من MongoDB TTL index
    appointment.holdExpiresAt = undefined;
    
    await appointment.save();

    return this.mapToResponse(appointment);
  }

  /**
   * التحقق من إمكانية تأكيد الموعد (يجب دفع المواعيد المطلوبة أولاً)
   */
  async canConfirmAppointment(appointmentId: string): Promise<boolean> {
    const appointment = await this.appointmentModel.findById(appointmentId);
    
    if (!appointment) {
      return false;
    }

    // إذا كان الموعد لا يتطلب دفعاً، يمكن تأكيده مباشرة
    if (!appointment.requiresPayment) {
      return true;
    }

    // إذا كان الموعد يتطلب دفعاً، يجب أن يكون الدفع مكتملاً
    return appointment.paymentStatus === PaymentStatus.COMPLETED;
  }

  /**
   * تأكيد موعد من قبل الطبيب
   */
  async confirmAppointment(
    appointmentId: string,
    doctorId: string,
    confirmDto: ConfirmAppointmentDto,
  ): Promise<AppointmentResponse> {
    const appointment = await this.appointmentModel.findById(appointmentId);
    
    if (!appointment) {
      throw new NotFoundException('الموعد غير موجود');
    }

    // التحقق من أن الطبيب هو صاحب الموعد
    if (appointment.doctorId.toString() !== doctorId) {
      throw new ForbiddenException('يمكنك فقط تأكيد مواعيدك الخاصة');
    }

    // التحقق من الحالة
    if (appointment.status !== AppointmentStatus.PENDING_CONFIRM) {
      throw new BadRequestException('لا يمكن تأكيد موعد بهذه الحالة');
    }

    // التحقق من الدفع إذا كان مطلوباً
    if (appointment.requiresPayment && appointment.paymentStatus !== PaymentStatus.COMPLETED) {
      // السماح بتأكيد المواعيد الحضورية حتى لو كان الدفع قيد الانتظار (يُحصّل لاحقاً في العيادة)
      if (appointment.type === AppointmentType.IN_PERSON) {
        appointment.metadata = {
          ...appointment.metadata,
          confirmedWithPendingPayment: true,
        };
      } else {
        throw new BadRequestException('يجب إكمال الدفع قبل تأكيد الموعد');
      }
    }

    // Note: We skip availability validation for existing appointments since:
    // 1. The appointment was already validated when it was created
    // 2. Availability schedules may have changed since booking
    // 3. The appointment time was already reserved
    // We only check for conflicts with other appointments below

    // التحقق من عدم التداخل
    await this.checkForConflicts(appointment.doctorId, appointment.startAt, appointment.endAt, appointmentId);

    // تحديث الحالة
    appointment.status = AppointmentStatus.CONFIRMED;
    
    // حذف holdExpiresAt لمنع الحذف التلقائي من MongoDB TTL index
    appointment.holdExpiresAt = undefined;
    
    // إضافة الملاحظات إذا تم توفيرها
    if (confirmDto.notes) {
      appointment.metadata = {
        ...appointment.metadata,
        doctorNotes: confirmDto.notes,
        confirmedAt: new Date(),
      };
    } else {
      appointment.metadata = {
        ...appointment.metadata,
        confirmedAt: new Date(),
      };
    }

    const updatedAppointment = await appointment.save();

    // Send notification to patient about confirmation
    try {
      await this.appointmentModel.populate(updatedAppointment, [
        { path: 'doctorId', select: 'name' },
        { path: 'serviceId', select: 'name' },
      ]);
      
      const doctorName = (updatedAppointment.doctorId as any)?.name || 'الطبيب';
      const serviceName = (updatedAppointment.serviceId as any)?.name || '';
      const appointmentDate = dayjs(updatedAppointment.startAt).format('YYYY-MM-DD');
      const appointmentTime = dayjs(updatedAppointment.startAt).format('HH:mm');
      
      const title = 'تم تأكيد موعدك';
      const body = `تم تأكيد موعدك مع ${doctorName}${serviceName ? ` - ${serviceName}` : ''} في ${appointmentDate} الساعة ${appointmentTime}`;
      
      // Handle patientId - it might be ObjectId or populated object
      const patientId = updatedAppointment.patientId instanceof Types.ObjectId
        ? updatedAppointment.patientId.toString()
        : (updatedAppointment.patientId as any)?._id
        ? (updatedAppointment.patientId as any)._id.toString()
        : String(updatedAppointment.patientId);
      
      await this.notificationsService.sendNotificationToUser(
        patientId,
        title,
        body,
        {
          type: 'appointment_confirmed',
          appointmentId: String((updatedAppointment as AppointmentDocument)._id || (updatedAppointment as any).id),
        },
      );
    } catch (error) {
      console.error('Failed to send notification for appointment confirmation:', error);
    }

    return this.mapToResponse(updatedAppointment);
  }

  /**
   * رفض موعد من قبل الطبيب
   */
  async rejectAppointment(
    appointmentId: string,
    doctorId: string,
    rejectDto: RejectAppointmentDto,
  ): Promise<AppointmentResponse> {
    const appointment = await this.appointmentModel.findById(appointmentId);
    
    if (!appointment) {
      throw new NotFoundException('الموعد غير موجود');
    }

    // التحقق من أن الطبيب هو صاحب الموعد
    if (appointment.doctorId.toString() !== doctorId) {
      throw new ForbiddenException('يمكنك فقط رفض مواعيدك الخاصة');
    }

    // التحقق من الحالة
    if (appointment.status !== AppointmentStatus.PENDING_CONFIRM && 
        appointment.status !== AppointmentStatus.CONFIRMED) {
      throw new BadRequestException('لا يمكن رفض موعد بهذه الحالة');
    }

    // تحديث الحالة
    appointment.status = AppointmentStatus.REJECTED;
    appointment.cancellationReason = rejectDto.reason;
    appointment.cancelledAt = new Date();
    appointment.cancelledBy = new Types.ObjectId(doctorId);

    // إضافة سبب الرفض في metadata
    appointment.metadata = {
      ...appointment.metadata,
      rejectionReason: rejectDto.reason,
      rejectedAt: new Date(),
    };

    const updatedAppointment = await appointment.save();
    
    // Send notification to patient about rejection
    try {
      await this.appointmentModel.populate(updatedAppointment, [
        { path: 'doctorId', select: 'name' },
      ]);
      
      const doctorName = (updatedAppointment.doctorId as any)?.name || 'الطبيب';
      const appointmentDate = dayjs(updatedAppointment.startAt).format('YYYY-MM-DD');
      const appointmentTime = dayjs(updatedAppointment.startAt).format('HH:mm');
      
      // Handle patientId - it might be ObjectId or populated object
      const patientId = updatedAppointment.patientId instanceof Types.ObjectId
        ? updatedAppointment.patientId.toString()
        : (updatedAppointment.patientId as any)?._id
        ? (updatedAppointment.patientId as any)._id.toString()
        : String(updatedAppointment.patientId);
      
      const title = 'تم رفض موعدك';
      const body = `تم رفض موعدك مع ${doctorName} في ${appointmentDate} الساعة ${appointmentTime}${rejectDto.reason ? `. السبب: ${rejectDto.reason}` : ''}`;
      
      await this.notificationsService.sendNotificationToUser(
        patientId,
        title,
        body,
        {
          type: 'appointment_rejected',
          appointmentId: String((updatedAppointment as AppointmentDocument)._id || (updatedAppointment as any).id),
        },
      );
    } catch (error) {
      console.error('Failed to send notification for appointment rejection:', error);
    }
    
    return this.mapToResponse(updatedAppointment);
  }

  private mapToResponse(appointment: AppointmentDocument | any): AppointmentResponse {
    // Handle populated fields - they can be ObjectIds or populated objects
    const getObjectIdString = (field: any): string => {
      if (!field) return '';
      if (typeof field === 'string') return field;
      if (field._id) return field._id.toString();
      if (field.toString) return field.toString();
      return String(field);
    };

    // Check if doctorId is populated (has name property)
    const doctorId = appointment.doctorId;
    const doctor = doctorId && typeof doctorId === 'object' && doctorId.name
      ? {
          id: getObjectIdString(doctorId),
          name: doctorId.name || '',
          licenseNumber: doctorId.licenseNumber,
        }
      : undefined;

    // Check if serviceId is populated (has name property)
    const serviceId = appointment.serviceId;
    const service = serviceId && typeof serviceId === 'object' && serviceId.name
      ? {
          id: getObjectIdString(serviceId),
          name: serviceId.name || '',
        }
      : undefined;

    return {
      id: (appointment as any)._id.toString(),
      doctorId: getObjectIdString(appointment.doctorId),
      patientId: getObjectIdString(appointment.patientId),
      serviceId: getObjectIdString(appointment.serviceId),
      startAt: appointment.startAt.toISOString(),
      endAt: appointment.endAt.toISOString(),
      status: appointment.status,
      type: appointment.type,
      price: appointment.price,
      duration: appointment.duration,
      holdExpiresAt: appointment.holdExpiresAt?.toISOString(),
      cancellationReason: appointment.cancellationReason,
      cancelledAt: appointment.cancelledAt?.toISOString(),
      metadata: appointment.metadata,
      paymentStatus: appointment.paymentStatus,
      paymentId: appointment.paymentId ? getObjectIdString(appointment.paymentId) : undefined,
      requiresPayment: appointment.requiresPayment,
      createdAt: (appointment as any).createdAt.toISOString(),
      updatedAt: (appointment as any).updatedAt.toISOString(),
      doctor,
      service,
    };
  }
}
