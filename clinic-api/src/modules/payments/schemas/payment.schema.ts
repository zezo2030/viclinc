import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { ApiProperty } from '@nestjs/swagger';

export type PaymentDocument = Payment & Document;

export enum PaymentStatus {
  PENDING = 'PENDING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  REFUNDED = 'REFUNDED',
}

export enum PaymentMethod {
  CREDIT_CARD = 'CREDIT_CARD',
  DEBIT_CARD = 'DEBIT_CARD',
  BANK_TRANSFER = 'BANK_TRANSFER',
  DIGITAL_WALLET = 'DIGITAL_WALLET',
}

@Schema({ timestamps: true, collection: 'payments' })
export class Payment {
  @ApiProperty({ description: 'Appointment ID', example: '64f1a2b3c4d5e6f7g8h9i0j1' })
  @Prop({ required: true, type: Types.ObjectId, ref: 'Appointment', unique: true })
  appointmentId: Types.ObjectId;

  @ApiProperty({ description: 'Payment amount', example: 150.00, minimum: 0 })
  @Prop({ required: true, min: 0 })
  amount: number;

  @ApiProperty({ description: 'Currency code', example: 'SAR', default: 'SAR' })
  @Prop({ required: true, default: 'SAR' })
  currency: string;

  @ApiProperty({ description: 'Payment status', enum: PaymentStatus, example: PaymentStatus.PENDING })
  @Prop({ required: true, enum: PaymentStatus, default: PaymentStatus.PENDING })
  status: PaymentStatus;

  @ApiProperty({ description: 'Payment method', enum: PaymentMethod, example: PaymentMethod.CREDIT_CARD })
  @Prop({ required: true, enum: PaymentMethod })
  paymentMethod: PaymentMethod;

  @ApiProperty({ description: 'External transaction ID', example: 'txn_123456789', required: false })
  @Prop()
  transactionId?: string;

  @ApiProperty({ description: 'Payment intent ID from payment provider', example: 'pi_123456789', required: false })
  @Prop()
  intentId?: string;

  @ApiProperty({ description: 'Payment completion timestamp', example: '2024-01-15T10:30:00.000Z', required: false })
  @Prop()
  paidAt?: Date;

  @ApiProperty({ description: 'Payment failure reason', example: 'Insufficient funds', required: false })
  @Prop()
  failureReason?: string;

  @ApiProperty({ description: 'Additional payment metadata', example: { gateway: 'stripe', version: '1.0' }, required: false })
  @Prop({ type: Object })
  metadata?: Record<string, any>;
}

export const PaymentSchema = SchemaFactory.createForClass(Payment);

// فهارس أساسية
PaymentSchema.index({ appointmentId: 1 }, { unique: true });
PaymentSchema.index({ status: 1, createdAt: 1 });
PaymentSchema.index({ transactionId: 1 }, { sparse: true });
PaymentSchema.index({ intentId: 1 }, { sparse: true });
PaymentSchema.index({ paidAt: 1 });
