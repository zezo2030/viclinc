import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength } from 'class-validator';

export class RefundPaymentDto {
  @ApiPropertyOptional({ description: 'Reason for refund' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  reason?: string;
}


