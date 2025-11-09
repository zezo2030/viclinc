import { ApiProperty } from '@nestjs/swagger';
import { PaymentAdminDto } from './payment-admin.dto';

export class PaginatedPaymentsDto {
  @ApiProperty({ type: [PaymentAdminDto] })
  items: PaymentAdminDto[];

  @ApiProperty({ example: 1 })
  page: number;

  @ApiProperty({ example: 10 })
  limit: number;

  @ApiProperty({ example: 100 })
  total: number;
}











