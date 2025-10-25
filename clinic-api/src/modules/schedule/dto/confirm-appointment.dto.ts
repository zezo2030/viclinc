import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength } from 'class-validator';

export class ConfirmAppointmentDto {
  @ApiProperty({
    description: 'ملاحظات إضافية من الطبيب',
    example: 'يرجى إحضار التقارير الطبية السابقة',
    required: false,
    maxLength: 500,
  })
  @IsOptional()
  @IsString()
  @MaxLength(500, { message: 'الملاحظات يجب أن تكون أقل من 500 حرف' })
  notes?: string;
}
