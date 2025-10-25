import { ApiProperty } from '@nestjs/swagger';
import { PaymentStatus, PaymentMethod } from '../schemas/payment.schema';

export class PaymentResponseDto {
  @ApiProperty({ description: 'Payment ID', example: '64f1a2b3c4d5e6f7g8h9i0j1' })
  id: string;

  @ApiProperty({ description: 'Appointment ID', example: '64f1a2b3c4d5e6f7g8h9i0j2' })
  appointmentId: string;

  @ApiProperty({ description: 'Payment amount', example: 150.00 })
  amount: number;

  @ApiProperty({ description: 'Currency code', example: 'SAR' })
  currency: string;

  @ApiProperty({ description: 'Payment status', enum: PaymentStatus, example: PaymentStatus.PENDING })
  status: PaymentStatus;

  @ApiProperty({ description: 'Payment method', enum: PaymentMethod, example: PaymentMethod.CREDIT_CARD })
  paymentMethod: PaymentMethod;

  @ApiProperty({ description: 'Payment intent ID', example: 'pi_123456789', required: false })
  intentId?: string;

  @ApiProperty({ description: 'Transaction ID', example: 'txn_123456789', required: false })
  transactionId?: string;

  @ApiProperty({ description: 'Payment completion timestamp', example: '2024-01-15T10:30:00.000Z', required: false })
  paidAt?: Date;

  @ApiProperty({ description: 'Payment failure reason', example: 'Insufficient funds', required: false })
  failureReason?: string;

  @ApiProperty({ description: 'Payment creation timestamp', example: '2024-01-15T10:00:00.000Z' })
  createdAt: Date;

  @ApiProperty({ description: 'Payment last update timestamp', example: '2024-01-15T10:30:00.000Z' })
  updatedAt: Date;
}

export class PaymentIntentResponseDto {
  @ApiProperty({ description: 'Payment intent ID', example: 'pi_123456789' })
  intentId: string;

  @ApiProperty({ description: 'Client secret for frontend', example: 'pi_123456789_secret_abc123' })
  clientSecret: string;

  @ApiProperty({ description: 'Payment amount', example: 150.00 })
  amount: number;

  @ApiProperty({ description: 'Currency code', example: 'SAR' })
  currency: string;

  @ApiProperty({ description: 'Payment status', enum: PaymentStatus, example: PaymentStatus.PENDING })
  status: PaymentStatus;
}
