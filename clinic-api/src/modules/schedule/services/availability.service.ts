import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { DoctorSchedule, DoctorScheduleDocument } from '../schemas/doctor-schedule.schema';
import { DoctorProfile, DoctorProfileDocument } from '../../doctors/schemas/doctor-profile.schema';
import { DoctorService, DoctorServiceDocument } from '../../doctors/schemas/doctor-service.schema';
import { Service, ServiceDocument } from '../../services/schemas/service.schema';
import { Appointment, AppointmentDocument, AppointmentStatus } from '../schemas/appointment.schema';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import isBetween from 'dayjs/plugin/isBetween';
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore';

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(isBetween);
dayjs.extend(isSameOrBefore);

export interface AvailableSlot {
  startTime: string; // ISO string
  endTime: string;   // ISO string
  duration: number;   // دقائق
}

export interface AvailabilityResponse {
  doctorId: string;
  serviceId: string;
  weekStart: string;
  availableSlots: AvailableSlot[];
}

@Injectable()
export class AvailabilityService {
  constructor(
    @InjectModel(DoctorSchedule.name) 
    private readonly doctorScheduleModel: Model<DoctorScheduleDocument>,
    @InjectModel(DoctorProfile.name) 
    private readonly doctorProfileModel: Model<DoctorProfileDocument>,
    @InjectModel(DoctorService.name) 
    private readonly doctorServiceModel: Model<DoctorServiceDocument>,
    @InjectModel(Service.name) 
    private readonly serviceModel: Model<ServiceDocument>,
    @InjectModel(Appointment.name)
    private readonly appointmentModel: Model<AppointmentDocument>,
  ) {}

  async getDoctorAvailability(
    doctorId: string, 
    serviceId: string, 
    weekStart?: string
  ): Promise<AvailabilityResponse> {
    // التحقق من صحة ObjectId
    if (!Types.ObjectId.isValid(doctorId)) {
      throw new BadRequestException(`Invalid doctorId format: ${doctorId}`);
    }
    if (!Types.ObjectId.isValid(serviceId)) {
      throw new BadRequestException(`Invalid serviceId format: ${serviceId}`);
    }

    // التحقق من وجود الطبيب
    const doctor = await this.doctorProfileModel.findById(doctorId);
    if (!doctor) {
      throw new NotFoundException(`Doctor not found with ID: ${doctorId}`);
    }

    // التحقق من وجود الخدمة
    const service = await this.serviceModel.findById(serviceId);
    if (!service) {
      throw new NotFoundException(`Service not found with ID: ${serviceId}`);
    }

    // التحقق من أن الطبيب يقدم هذه الخدمة
    const doctorService = await this.doctorServiceModel.findOne({
      doctorId: new Types.ObjectId(doctorId),
      serviceId: new Types.ObjectId(serviceId),
      isActive: true,
    });

    if (!doctorService) {
      throw new BadRequestException(`Doctor ${doctorId} does not provide service ${serviceId}`);
    }

    // الحصول على جدول الطبيب
    const schedule = await this.doctorScheduleModel.findOne({ 
      doctorId: new Types.ObjectId(doctorId) 
    });

    if (!schedule) {
      throw new NotFoundException(`Doctor schedule not found for doctor ID: ${doctorId}`);
    }

    // تحديد تاريخ بداية الأسبوع (استخدام UTC)
    const startDate = weekStart ? dayjs(weekStart).utc().startOf('week') : dayjs().utc().startOf('week');
    
    // حساب الفتحات المتاحة
    const availableSlots = await this.calculateAvailableSlots(
      schedule, 
      service, 
      doctorService, 
      startDate
    );

    return {
      doctorId,
      serviceId,
      weekStart: startDate.toISOString(),
      availableSlots,
    };
  }

  private async calculateAvailableSlots(
    schedule: DoctorScheduleDocument,
    service: ServiceDocument,
    doctorService: DoctorServiceDocument,
    weekStart: dayjs.Dayjs
  ): Promise<AvailableSlot[]> {
    const availableSlots: AvailableSlot[] = [];
    const serviceDuration = doctorService.customDuration || service.defaultDurationMin || 30;
    
    // الحصول على buffers
    const buffers = this.getServiceBuffers(schedule, (service._id as Types.ObjectId).toString());
    
    // جلب المواعيد الحالية خلال نطاق الأسبوع لاستبعادها من الفتحات المتاحة
    const rangeStart = weekStart.utc().startOf('day');
    const rangeEnd = weekStart.add(7, 'day').utc().endOf('day');
    const existingAppointments = await this.appointmentModel.find({
      doctorId: schedule.doctorId,
      status: { $in: [AppointmentStatus.PENDING_CONFIRM, AppointmentStatus.CONFIRMED] },
      startAt: { $lt: rangeEnd.toDate() },
      endAt: { $gt: rangeStart.toDate() },
    }).lean();
    
    const slotConflictsWithExisting = (slotStartIso: string, slotEndIso: string): boolean => {
      const s = dayjs(slotStartIso).utc();
      const e = dayjs(slotEndIso).utc();
      return existingAppointments.some(appt => {
        const aStart = dayjs(appt.startAt).utc();
        const aEnd = dayjs(appt.endAt).utc();
        return s.isBefore(aEnd) && e.isAfter(aStart);
      });
    };
    
    // تكرار على 7 أيام
    for (let dayOffset = 0; dayOffset < 7; dayOffset++) {
      const currentDate = weekStart.add(dayOffset, 'day');
      const dayOfWeek = currentDate.day();
      
      // التحقق من العطلات
      if (this.isHoliday(schedule, currentDate)) {
        continue;
      }

      // الحصول على فترات اليوم
      const daySlots = this.getDaySlots(schedule, currentDate, dayOfWeek);
      
      for (const slot of daySlots) {
        if (!slot.isAvailable) continue;

        // تقسيم الفترة حسب مدة الخدمة
        const serviceSlots = this.splitSlotByDuration(
          slot, 
          serviceDuration, 
          buffers.bufferBefore, 
          buffers.bufferAfter,
          currentDate // إضافة التاريخ
        );
        
        // استبعاد الفتحات التي تتعارض مع مواعيد محجوزة مسبقاً
        const filtered = serviceSlots.filter(s => !slotConflictsWithExisting(s.startTime, s.endTime));
        availableSlots.push(...filtered);
      }
    }

    return availableSlots;
  }

  private getServiceBuffers(schedule: DoctorScheduleDocument, serviceId: string) {
    const serviceBuffer = schedule.serviceBuffers.find(
      sb => sb.serviceId.toString() === serviceId
    );

    return {
      bufferBefore: serviceBuffer?.bufferBefore || schedule.defaultBufferBefore,
      bufferAfter: serviceBuffer?.bufferAfter || schedule.defaultBufferAfter,
    };
  }

  private isHoliday(schedule: DoctorScheduleDocument, date: dayjs.Dayjs): boolean {
    const dateUtc = date.utc();
    return schedule.holidays.some(holiday => {
      const startDate = dayjs(holiday.startDate).utc();
      const endDate = dayjs(holiday.endDate).utc();
      return dateUtc.isBetween(startDate, endDate, 'day', '[]');
    });
  }

  private getDaySlots(
    schedule: DoctorScheduleDocument, 
    date: dayjs.Dayjs, 
    dayOfWeek: number
  ) {
    // البحث عن استثناء لهذا اليوم (استخدام UTC للمقارنة)
    const exception = schedule.exceptions.find(ex => {
      const exDate = dayjs(ex.date).utc();
      return exDate.isSame(date.utc(), 'day');
    });

    if (exception) {
      return exception.slots.map(slot => ({
        startTime: slot.startTime,
        endTime: slot.endTime,
        isAvailable: exception.isAvailable,
      }));
    }

    // استخدام القالب الأسبوعي
    // dayjs day() يعيد 0 للأحد، 1 للإثنين، إلخ
    const weeklyTemplate = schedule.weeklyTemplate.find(
      template => template.dayOfWeek === dayOfWeek
    );

    if (!weeklyTemplate) {
      return [];
    }

    return weeklyTemplate.slots.map(slot => ({
      startTime: slot.startTime,
      endTime: slot.endTime,
      isAvailable: weeklyTemplate.isAvailable,
    }));
  }

  private splitSlotByDuration(
    slot: { startTime: string; endTime: string },
    duration: number,
    bufferBefore: number,
    bufferAfter: number,
    date: dayjs.Dayjs
  ): AvailableSlot[] {
    const slots: AvailableSlot[] = [];
    // استخدام التاريخ الفعلي مع UTC لضمان التطابق
    // إنشاء datetime كـ UTC مباشرة (افتراض أن الأوقات في الجدول هي UTC)
    const dateStr = date.format('YYYY-MM-DD');
    const slotStart = dayjs.utc(`${dateStr}T${slot.startTime}:00`);
    const slotEnd = dayjs.utc(`${dateStr}T${slot.endTime}:00`);
    
    let currentTime = slotStart.add(bufferBefore, 'minute');
    const totalDuration = duration + bufferBefore + bufferAfter;
    
    while (currentTime.add(totalDuration, 'minute').isSameOrBefore(slotEnd)) {
      const startTime = currentTime;
      const endTime = currentTime.add(duration, 'minute');
      
      slots.push({
        startTime: startTime.toISOString(), // استخدام ISO string بدلاً من HH:mm
        endTime: endTime.toISOString(),     // استخدام ISO string بدلاً من HH:mm
        duration,
      });
      
      currentTime = currentTime.add(duration + bufferAfter, 'minute');
    }

    return slots;
  }
}
