import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { DoctorSchedule, DoctorScheduleDocument } from '../schemas/doctor-schedule.schema';
import { CreateScheduleDto } from '../dto/create-schedule.dto';
import { UpdateScheduleDto } from '../dto/update-schedule.dto';
import { AddExceptionDto } from '../dto/add-exception.dto';
import { AddHolidayDto } from '../dto/add-holiday.dto';

@Injectable()
export class DoctorScheduleService {
  constructor(
    @InjectModel(DoctorSchedule.name) 
    private readonly doctorScheduleModel: Model<DoctorScheduleDocument>,
  ) {}

  async createOrUpdateSchedule(doctorId: string, createScheduleDto: CreateScheduleDto) {
    const { weeklyTemplate, defaultBufferBefore = 0, defaultBufferAfter = 0, serviceBuffers = [] } = createScheduleDto;

    // التحقق من صحة الأوقات
    this.validateTimeSlots(weeklyTemplate);

    const scheduleData = {
      doctorId: new Types.ObjectId(doctorId),
      weeklyTemplate,
      defaultBufferBefore,
      defaultBufferAfter,
      serviceBuffers: serviceBuffers.map(sb => ({
        serviceId: new Types.ObjectId(sb.serviceId),
        bufferBefore: sb.bufferBefore,
        bufferAfter: sb.bufferAfter,
      })),
    };

    const existingSchedule = await this.doctorScheduleModel.findOne({ doctorId: new Types.ObjectId(doctorId) });
    
    if (existingSchedule) {
      Object.assign(existingSchedule, scheduleData);
      return existingSchedule.save();
    } else {
      return this.doctorScheduleModel.create(scheduleData);
    }
  }

  async getSchedule(doctorId: string) {
    const schedule = await this.doctorScheduleModel.findOne({ doctorId: new Types.ObjectId(doctorId) });
    
    if (!schedule) {
      throw new NotFoundException('Schedule not found');
    }
    
    return schedule;
  }

  async updateSchedule(doctorId: string, updateScheduleDto: UpdateScheduleDto) {
    const schedule = await this.getSchedule(doctorId);
    
    if (updateScheduleDto.weeklyTemplate) {
      this.validateTimeSlots(updateScheduleDto.weeklyTemplate);
    }

    Object.assign(schedule, updateScheduleDto);
    return schedule.save();
  }

  async addException(doctorId: string, addExceptionDto: AddExceptionDto) {
    const schedule = await this.getSchedule(doctorId);
    
    const exceptionDate = new Date(addExceptionDto.date);
    
    // التحقق من عدم وجود استثناء لنفس التاريخ
    const existingException = schedule.exceptions.find(
      ex => ex.date.toDateString() === exceptionDate.toDateString()
    );
    
    if (existingException) {
      throw new BadRequestException('Exception already exists for this date');
    }

    const exception = {
      date: exceptionDate,
      slots: addExceptionDto.slots || [],
      isAvailable: addExceptionDto.isAvailable,
      reason: addExceptionDto.reason || '',
    };

    schedule.exceptions.push(exception);
    return schedule.save();
  }

  async removeException(doctorId: string, date: string) {
    const schedule = await this.getSchedule(doctorId);
    const exceptionDate = new Date(date);
    
    const exceptionIndex = schedule.exceptions.findIndex(
      ex => ex.date.toDateString() === exceptionDate.toDateString()
    );
    
    if (exceptionIndex === -1) {
      throw new NotFoundException('Exception not found for this date');
    }

    schedule.exceptions.splice(exceptionIndex, 1);
    return schedule.save();
  }

  async addHoliday(doctorId: string, addHolidayDto: AddHolidayDto) {
    const schedule = await this.getSchedule(doctorId);
    
    const startDate = new Date(addHolidayDto.startDate);
    const endDate = new Date(addHolidayDto.endDate);
    
    if (startDate >= endDate) {
      throw new BadRequestException('Start date must be before end date');
    }

    const holiday = {
      startDate,
      endDate,
      reason: addHolidayDto.reason || '',
    };

    schedule.holidays.push(holiday);
    return schedule.save();
  }

  async removeHoliday(doctorId: string, holidayId: string) {
    const schedule = await this.getSchedule(doctorId);
    
    const holidayIndex = schedule.holidays.findIndex(
      (h, index) => index.toString() === holidayId
    );
    
    if (holidayIndex === -1) {
      throw new NotFoundException('Holiday not found');
    }

    schedule.holidays.splice(holidayIndex, 1);
    return schedule.save();
  }

  private validateTimeSlots(weeklyTemplate: any[]) {
    for (const day of weeklyTemplate) {
      if (day.dayOfWeek < 0 || day.dayOfWeek > 6) {
        throw new BadRequestException('Invalid day of week');
      }

      for (const slot of day.slots) {
        if (slot.startTime >= slot.endTime) {
          throw new BadRequestException('Start time must be before end time');
        }
      }

      // التحقق من عدم تداخل الفترات
      const sortedSlots = day.slots.sort((a: any, b: any) => a.startTime.localeCompare(b.startTime));
      for (let i = 1; i < sortedSlots.length; i++) {
        if (sortedSlots[i - 1].endTime > sortedSlots[i].startTime) {
          throw new BadRequestException('Overlapping time slots');
        }
      }
    }
  }
}
