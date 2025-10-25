import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, MaxLength } from 'class-validator';

export class RejectAppointmentDto {
  @ApiProperty({
    description: 'سبب رفض الموعد',
    example: 'التوقيت غير مناسب',
    maxLength: 500,
  })
  @IsString()
  @IsNotEmpty({ message: 'سبب الرفض مطلوب' })
  @MaxLength(500, { message: 'سبب الرفض يجب أن يكون أقل من 500 حرف' })
  reason: string;
}
