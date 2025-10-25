import { IsOptional, IsDateString, IsEnum, IsString, IsNumber, Min, Max } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { AppointmentStatus } from '../../schedule/schemas/appointment.schema';

export class AdminAppointmentQueryDto {
  @ApiProperty({ description: 'Appointment status filter', enum: AppointmentStatus, required: false })
  @IsOptional()
  @IsEnum(AppointmentStatus)
  status?: AppointmentStatus;

  @ApiProperty({ description: 'Doctor ID filter', example: '64f1a2b3c4d5e6f7g8h9i0j1', required: false })
  @IsOptional()
  @IsString()
  doctorId?: string;

  @ApiProperty({ description: 'Patient ID filter', example: '64f1a2b3c4d5e6f7g8h9i0j2', required: false })
  @IsOptional()
  @IsString()
  patientId?: string;

  @ApiProperty({ description: 'Start date filter', example: '2024-01-01', required: false })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiProperty({ description: 'End date filter', example: '2024-01-31', required: false })
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @ApiProperty({ description: 'Page number', example: 1, minimum: 1, required: false })
  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  @IsNumber()
  @Min(1)
  page?: number = 1;

  @ApiProperty({ description: 'Items per page', example: 10, minimum: 1, maximum: 100, required: false })
  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  @IsNumber()
  @Min(1)
  @Max(100)
  limit?: number = 10;

  @ApiProperty({ description: 'Search term for patient or doctor name', example: 'Ahmed', required: false })
  @IsOptional()
  @IsString()
  search?: string;
}
