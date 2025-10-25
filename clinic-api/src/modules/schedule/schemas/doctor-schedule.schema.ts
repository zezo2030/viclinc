import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { ApiProperty } from '@nestjs/swagger';

export type DoctorScheduleDocument = DoctorSchedule & Document;

export class TimeSlot {
  @ApiProperty({ description: 'Start time in HH:MM format', example: '09:00' })
  startTime: string; // "09:00"

  @ApiProperty({ description: 'End time in HH:MM format', example: '17:00' })
  endTime: string;   // "17:00"
}

export class WeeklyTemplate {
  @ApiProperty({ description: 'Day of week (0-6, 0=Sunday)', example: 1 })
  dayOfWeek: number; // 0-6 (0=الأحد)

  @ApiProperty({ description: 'Time slots for this day', type: [TimeSlot] })
  slots: TimeSlot[];

  @ApiProperty({ description: 'Whether this day is available', example: true })
  isAvailable: boolean;
}

export class ServiceBuffer {
  @ApiProperty({ description: 'Service ID', example: '64f1a2b3c4d5e6f7g8h9i0j1' })
  serviceId: Types.ObjectId;

  @ApiProperty({ description: 'Buffer time before service in minutes', example: 5 })
  bufferBefore: number; // دقائق

  @ApiProperty({ description: 'Buffer time after service in minutes', example: 10 })
  bufferAfter: number;  // دقائق
}

export class ScheduleException {
  @ApiProperty({ description: 'Exception date', example: '2024-01-15' })
  date: Date;

  @ApiProperty({ description: 'Time slots for this exception', type: [TimeSlot] })
  slots: TimeSlot[];

  @ApiProperty({ description: 'Whether this exception is available', example: false })
  isAvailable: boolean;

  @ApiProperty({ description: 'Reason for the exception', example: 'Personal leave' })
  reason: string;
}

export class Holiday {
  @ApiProperty({ description: 'Holiday start date', example: '2024-12-25' })
  startDate: Date;

  @ApiProperty({ description: 'Holiday end date', example: '2024-12-26' })
  endDate: Date;

  @ApiProperty({ description: 'Holiday reason', example: 'Christmas Day' })
  reason: string;
}

@Schema({ timestamps: true, collection: 'doctorSchedules' })
export class DoctorSchedule {
  @ApiProperty({ description: 'Doctor profile ID', example: '64f1a2b3c4d5e6f7g8h9i0j1' })
  @Prop({ required: true, unique: true, type: Types.ObjectId, ref: 'DoctorProfile' })
  doctorId: Types.ObjectId;

  @ApiProperty({ description: 'Weekly schedule template', type: [WeeklyTemplate] })
  @Prop({ required: true, type: [Object] })
  weeklyTemplate: WeeklyTemplate[];

  @ApiProperty({ description: 'Default buffer time before appointments in minutes', example: 5, minimum: 0 })
  @Prop({ required: true, min: 0, default: 0 })
  defaultBufferBefore: number; // دقائق

  @ApiProperty({ description: 'Default buffer time after appointments in minutes', example: 10, minimum: 0 })
  @Prop({ required: true, min: 0, default: 0 })
  defaultBufferAfter: number; // دقائق

  @ApiProperty({ description: 'Service-specific buffer times', type: [ServiceBuffer] })
  @Prop({ type: [Object], default: [] })
  serviceBuffers: ServiceBuffer[];

  @ApiProperty({ description: 'Schedule exceptions', type: [ScheduleException] })
  @Prop({ type: [Object], default: [] })
  exceptions: ScheduleException[];

  @ApiProperty({ description: 'Holidays', type: [Holiday] })
  @Prop({ type: [Object], default: [] })
  holidays: Holiday[];
}

export const DoctorScheduleSchema = SchemaFactory.createForClass(DoctorSchedule);

// فهارس
DoctorScheduleSchema.index({ doctorId: 1 }, { unique: true });
DoctorScheduleSchema.index({ 'exceptions.date': 1 });
DoctorScheduleSchema.index({ 'holidays.startDate': 1, 'holidays.endDate': 1 });
