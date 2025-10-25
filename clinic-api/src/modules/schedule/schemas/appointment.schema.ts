import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { ApiProperty } from '@nestjs/swagger';

export type AppointmentDocument = Appointment & Document;

export enum AppointmentStatus {
  PENDING_CONFIRM = 'PENDING_CONFIRM',
  CONFIRMED = 'CONFIRMED',
  CANCELLED = 'CANCELLED',
  COMPLETED = 'COMPLETED',
  NO_SHOW = 'NO_SHOW',
  REJECTED = 'REJECTED',
}

export enum AppointmentType {
  IN_PERSON = 'IN_PERSON',
  VIDEO = 'VIDEO',
  CHAT = 'CHAT',
}

export enum PaymentStatus {
  NONE = 'NONE',
  PENDING = 'PENDING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
}

@Schema({ timestamps: true, collection: 'appointments' })
export class Appointment {
  @ApiProperty({ description: 'Doctor profile ID', example: '64f1a2b3c4d5e6f7g8h9i0j1' })
  @Prop({ required: true, type: Types.ObjectId, ref: 'DoctorProfile' })
  doctorId: Types.ObjectId;

  @ApiProperty({ description: 'Patient user ID', example: '64f1a2b3c4d5e6f7g8h9i0j2' })
  @Prop({ required: true, type: Types.ObjectId, ref: 'User' })
  patientId: Types.ObjectId;

  @ApiProperty({ description: 'Service ID', example: '64f1a2b3c4d5e6f7g8h9i0j3' })
  @Prop({ required: true, type: Types.ObjectId, ref: 'Service' })
  serviceId: Types.ObjectId;

  @ApiProperty({ description: 'Appointment start time (UTC)', example: '2024-01-15T10:00:00.000Z' })
  @Prop({ required: true })
  startAt: Date;

  @ApiProperty({ description: 'Appointment end time (UTC)', example: '2024-01-15T10:30:00.000Z' })
  @Prop({ required: true })
  endAt: Date;

  @ApiProperty({ description: 'Appointment status', enum: AppointmentStatus, example: AppointmentStatus.PENDING_CONFIRM })
  @Prop({ required: true, enum: AppointmentStatus, default: AppointmentStatus.PENDING_CONFIRM })
  status: AppointmentStatus;

  @ApiProperty({ description: 'Appointment type', enum: AppointmentType, example: AppointmentType.IN_PERSON })
  @Prop({ required: true, enum: AppointmentType })
  type: AppointmentType;

  @ApiProperty({ description: 'Hold expiration time for temporary bookings', example: '2024-01-15T10:15:00.000Z', required: false })
  @Prop()
  holdExpiresAt?: Date;

  @ApiProperty({ description: 'Idempotency key to prevent duplicate bookings', example: 'unique-key-123', required: false })
  @Prop({ unique: true, sparse: true })
  idempotencyKey?: string;

  @ApiProperty({ description: 'Appointment price', example: 150, minimum: 0 })
  @Prop({ required: true, min: 0 })
  price: number;

  @ApiProperty({ description: 'Appointment duration in minutes', example: 30, minimum: 1 })
  @Prop({ required: true, min: 1 })
  duration: number;

  @ApiProperty({ description: 'Cancellation reason', example: 'Patient request', required: false })
  @Prop()
  cancellationReason?: string;

  @ApiProperty({ description: 'Cancellation timestamp', example: '2024-01-15T09:00:00.000Z', required: false })
  @Prop()
  cancelledAt?: Date;

  @ApiProperty({ description: 'User ID who cancelled the appointment', example: '64f1a2b3c4d5e6f7g8h9i0j2', required: false })
  @Prop({ type: Types.ObjectId, ref: 'User' })
  cancelledBy?: Types.ObjectId;

  @ApiProperty({ description: 'Additional metadata', example: { notes: 'Patient prefers morning' }, required: false })
  @Prop({ type: Object })
  metadata?: Record<string, any>;

  @ApiProperty({ description: 'Payment status for the appointment', enum: PaymentStatus, example: PaymentStatus.NONE, required: false })
  @Prop({ enum: PaymentStatus, default: PaymentStatus.NONE })
  paymentStatus?: PaymentStatus;

  @ApiProperty({ description: 'Payment ID if payment is required', example: '64f1a2b3c4d5e6f7g8h9i0j4', required: false })
  @Prop({ type: Types.ObjectId, ref: 'Payment' })
  paymentId?: Types.ObjectId;

  @ApiProperty({ description: 'Whether this appointment requires payment', example: false, required: false })
  @Prop({ default: false })
  requiresPayment?: boolean;
}

export const AppointmentSchema = SchemaFactory.createForClass(Appointment);

// فهارس أساسية
AppointmentSchema.index({ doctorId: 1, startAt: 1 }, { 
  unique: true, 
  partialFilterExpression: { 
    status: { $in: [AppointmentStatus.PENDING_CONFIRM, AppointmentStatus.CONFIRMED] } 
  } 
});

// TTL index على holdExpiresAt
AppointmentSchema.index({ holdExpiresAt: 1 }, { 
  expireAfterSeconds: 0,
  partialFilterExpression: { holdExpiresAt: { $exists: true } }
});

// فهرس فريد جزئي على idempotencyKey
AppointmentSchema.index({ idempotencyKey: 1 }, { 
  unique: true, 
  sparse: true 
});

// فهارس للاستعلامات
AppointmentSchema.index({ patientId: 1, status: 1, startAt: 1 });
AppointmentSchema.index({ doctorId: 1, status: 1, startAt: 1 });
AppointmentSchema.index({ status: 1, startAt: 1 });
AppointmentSchema.index({ startAt: 1, endAt: 1 });

// فهارس للدفع
AppointmentSchema.index({ paymentId: 1 }, { sparse: true });
AppointmentSchema.index({ paymentStatus: 1, status: 1 });
AppointmentSchema.index({ requiresPayment: 1, status: 1 });
