import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { DoctorSchedule, DoctorScheduleDocument } from '../schemas/doctor-schedule.schema';
import { DoctorProfile, DoctorProfileDocument } from '../../doctors/schemas/doctor-profile.schema';
import { DoctorService, DoctorServiceDocument } from '../../doctors/schemas/doctor-service.schema';
import { Service, ServiceDocument } from '../../services/schemas/service.schema';
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
  ) {}

  async getDoctorAvailability(
    doctorId: string, 
    serviceId: string, 
    weekStart?: string
  ): Promise<AvailabilityResponse> {
    // التحقق من وجود الطبيب
    const doctor = await this.doctorProfileModel.findById(doctorId);
    if (!doctor) {
      throw new NotFoundException('Doctor not found');
    }

    // التحقق من وجود الخدمة
    const service = await this.serviceModel.findById(serviceId);
    if (!service) {
      throw new NotFoundException('Service not found');
    }

    // التحقق من أن الطبيب يقدم هذه الخدمة
    const doctorService = await this.doctorServiceModel.findOne({
      doctorId: new Types.ObjectId(doctorId),
      serviceId: new Types.ObjectId(serviceId),
      isActive: true,
    });

    if (!doctorService) {
      throw new BadRequestException('Doctor does not provide this service');
    }

    // الحصول على جدول الطبيب
    const schedule = await this.doctorScheduleModel.findOne({ 
      doctorId: new Types.ObjectId(doctorId) 
    });

    if (!schedule) {
      throw new NotFoundException('Doctor schedule not found');
    }

    // تحديد تاريخ بداية الأسبوع
    const startDate = weekStart ? dayjs(weekStart).startOf('week') : dayjs().startOf('week');
    
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
          buffers.bufferAfter
        );

        availableSlots.push(...serviceSlots);
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
    return schedule.holidays.some(holiday => {
      const startDate = dayjs(holiday.startDate);
      const endDate = dayjs(holiday.endDate);
      return date.isBetween(startDate, endDate, 'day', '[]');
    });
  }

  private getDaySlots(
    schedule: DoctorScheduleDocument, 
    date: dayjs.Dayjs, 
    dayOfWeek: number
  ) {
    // البحث عن استثناء لهذا اليوم
    const exception = schedule.exceptions.find(ex => 
      dayjs(ex.date).isSame(date, 'day')
    );

    if (exception) {
      return exception.slots.map(slot => ({
        startTime: slot.startTime,
        endTime: slot.endTime,
        isAvailable: exception.isAvailable,
      }));
    }

    // استخدام القالب الأسبوعي
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
    bufferAfter: number
  ): AvailableSlot[] {
    const slots: AvailableSlot[] = [];
    const slotStart = dayjs(`2000-01-01 ${slot.startTime}`);
    const slotEnd = dayjs(`2000-01-01 ${slot.endTime}`);
    
    let currentTime = slotStart.add(bufferBefore, 'minute');
    const totalDuration = duration + bufferBefore + bufferAfter;
    
    while (currentTime.add(totalDuration, 'minute').isSameOrBefore(slotEnd)) {
      const startTime = currentTime;
      const endTime = currentTime.add(duration, 'minute');
      
      slots.push({
        startTime: startTime.format('HH:mm'),
        endTime: endTime.format('HH:mm'),
        duration,
      });
      
      currentTime = currentTime.add(duration + bufferAfter, 'minute');
    }

    return slots;
  }
}
