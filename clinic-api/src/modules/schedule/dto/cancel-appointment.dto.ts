import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsOptional } from 'class-validator';

export class CancelAppointmentDto {
  @ApiProperty({ 
    description: 'Cancellation reason', 
    example: 'Patient request',
    required: false 
  })
  @IsOptional()
  @IsString()
  reason?: string;
}

