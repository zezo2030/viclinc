import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, IsEnum, IsDateString, IsNumberString } from 'class-validator';
import { AppointmentStatus } from '../schemas/appointment.schema';
import { Transform } from 'class-transformer';

export class AppointmentQueryDto {
  @ApiProperty({ 
    description: 'Appointment status filter', 
    enum: AppointmentStatus, 
    required: false 
  })
  @IsOptional()
  @IsEnum(AppointmentStatus)
  status?: AppointmentStatus;

  @ApiProperty({ 
    description: 'Start date filter (ISO string)', 
    example: '2024-01-01T00:00:00.000Z',
    required: false 
  })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiProperty({ 
    description: 'End date filter (ISO string)', 
    example: '2024-01-31T23:59:59.999Z',
    required: false 
  })
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @ApiProperty({ 
    description: 'Doctor ID filter', 
    example: '64f1a2b3c4d5e6f7g8h9i0j1',
    required: false 
  })
  @IsOptional()
  @IsString()
  doctorId?: string;

  @ApiProperty({ 
    description: 'Patient ID filter', 
    example: '64f1a2b3c4d5e6f7g8h9i0j2',
    required: false 
  })
  @IsOptional()
  @IsString()
  patientId?: string;

  @ApiProperty({ 
    description: 'Page number (default: 1)', 
    example: 1,
    required: false 
  })
  @IsOptional()
  @IsNumberString()
  @Transform(({ value }) => parseInt(value, 10))
  page?: number = 1;

  @ApiProperty({ 
    description: 'Items per page (default: 10, max: 100)', 
    example: 10,
    required: false 
  })
  @IsOptional()
  @IsNumberString()
  @Transform(({ value }) => Math.min(parseInt(value, 10) || 10, 100))
  limit?: number = 10;
}

