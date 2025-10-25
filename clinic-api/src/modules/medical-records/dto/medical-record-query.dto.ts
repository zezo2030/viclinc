import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsMongoId, IsDateString, IsNumber, Min, Max } from 'class-validator';
import { Transform } from 'class-transformer';

export class MedicalRecordQueryDto {
  @ApiProperty({ description: 'Patient ID filter', example: '64f1a2b3c4d5e6f7g8h9i0j1', required: false })
  @IsOptional()
  @IsMongoId()
  patientId?: string;

  @ApiProperty({ description: 'Doctor ID filter', example: '64f1a2b3c4d5e6f7g8h9i0j2', required: false })
  @IsOptional()
  @IsMongoId()
  doctorId?: string;

  @ApiProperty({ description: 'Start date filter (ISO string)', example: '2024-01-01T00:00:00.000Z', required: false })
  @IsOptional()
  @IsDateString()
  dateFrom?: string;

  @ApiProperty({ description: 'End date filter (ISO string)', example: '2024-01-31T23:59:59.999Z', required: false })
  @IsOptional()
  @IsDateString()
  dateTo?: string;

  @ApiProperty({ description: 'Page number', example: 1, default: 1, required: false })
  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  @IsNumber()
  @Min(1)
  page?: number = 1;

  @ApiProperty({ description: 'Items per page', example: 10, default: 10, required: false })
  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  @IsNumber()
  @Min(1)
  @Max(100)
  limit?: number = 10;

  @ApiProperty({ description: 'Sort field', example: 'createdAt', default: 'createdAt', required: false })
  @IsOptional()
  sortBy?: string = 'createdAt';

  @ApiProperty({ description: 'Sort order', example: 'desc', default: 'desc', required: false })
  @IsOptional()
  sortOrder?: 'asc' | 'desc' = 'desc';
}
