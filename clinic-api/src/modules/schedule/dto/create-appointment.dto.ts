import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsEnum, IsDateString, IsOptional, IsObject } from 'class-validator';
import { AppointmentType } from '../schemas/appointment.schema';

export class CreateAppointmentDto {
  @ApiProperty({ 
    description: 'Doctor profile ID', 
    example: '64f1a2b3c4d5e6f7g8h9i0j1' 
  })
  @IsNotEmpty()
  @IsString()
  doctorId: string;

  @ApiProperty({ 
    description: 'Service ID', 
    example: '64f1a2b3c4d5e6f7g8h9i0j2' 
  })
  @IsNotEmpty()
  @IsString()
  serviceId: string;

  @ApiProperty({ 
    description: 'Appointment start time (ISO string)', 
    example: '2024-01-15T10:00:00.000Z' 
  })
  @IsNotEmpty()
  @IsDateString()
  startAt: string;

  @ApiProperty({ 
    description: 'Appointment type', 
    enum: AppointmentType, 
    example: AppointmentType.IN_PERSON 
  })
  @IsNotEmpty()
  @IsEnum(AppointmentType)
  type: AppointmentType;

  @ApiProperty({ 
    description: 'Additional metadata', 
    example: { notes: 'Patient prefers morning' }, 
    required: false 
  })
  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;
}

