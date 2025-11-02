import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PaymentMethod, PaymentStatus } from '../../payments/schemas/payment.schema';

export class SimpleRefDto {
  @ApiProperty({ example: '64f1a2b3c4d5e6f7g8h9i0j1' })
  id: string;

  @ApiProperty({ example: 'Ahmed Mohamed' })
  name: string;
}

export class AppointmentBriefDto {
  @ApiProperty({ example: '2024-01-15T10:00:00.000Z', required: false })
  startAt?: string;

  @ApiProperty({ example: 'CONFIRMED', required: false })
  status?: string;
}

export class PaymentAdminDto {
  @ApiProperty({ example: '64f1a2b3c4d5e6f7g8h9i0j4' })
  id: string;

  @ApiProperty({ example: '64f1a2b3c4d5e6f7g8h9i0j5' })
  appointmentId: string;

  @ApiProperty({ example: 150.0 })
  amount: number;

  @ApiProperty({ example: 'SAR' })
  currency: string;

  @ApiProperty({ enum: PaymentStatus, example: PaymentStatus.PENDING })
  status: PaymentStatus;

  @ApiProperty({ enum: PaymentMethod, example: PaymentMethod.CREDIT_CARD })
  paymentMethod: PaymentMethod;

  @ApiPropertyOptional({ example: 'txn_123456789' })
  transactionId?: string;

  @ApiPropertyOptional({ example: 'pi_123456789' })
  intentId?: string;

  @ApiPropertyOptional({ example: '2024-01-15T10:30:00.000Z' })
  paidAt?: string;

  @ApiPropertyOptional({ example: 'Insufficient funds' })
  failureReason?: string;

  @ApiPropertyOptional({ type: Object })
  metadata?: Record<string, any>;

  @ApiProperty({ example: '2024-01-15T09:59:00.000Z' })
  createdAt: string;

  @ApiProperty({ example: '2024-01-15T10:31:00.000Z' })
  updatedAt: string;

  @ApiPropertyOptional({ type: SimpleRefDto })
  patient?: SimpleRefDto;

  @ApiPropertyOptional({ type: SimpleRefDto })
  doctor?: SimpleRefDto;

  @ApiPropertyOptional({ type: AppointmentBriefDto })
  appointment?: AppointmentBriefDto;
}


