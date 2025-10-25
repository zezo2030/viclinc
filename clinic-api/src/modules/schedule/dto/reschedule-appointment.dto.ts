import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsDateString, IsOptional, IsObject } from 'class-validator';

export class RescheduleAppointmentDto {
  @ApiProperty({ 
    description: 'New appointment start time (ISO string)', 
    example: '2024-01-16T10:00:00.000Z' 
  })
  @IsNotEmpty()
  @IsDateString()
  newStartAt: string;

  @ApiProperty({ 
    description: 'Additional metadata for rescheduling', 
    example: { reason: 'Patient request' }, 
    required: false 
  })
  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;
}

