import { IsOptional, IsDateString, IsEnum, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';

export enum MetricsPeriod {
  DAY = 'day',
  WEEK = 'week',
  MONTH = 'month',
  YEAR = 'year',
}

export class MetricsQueryDto {
  @ApiProperty({ description: 'Start date for metrics', example: '2024-01-01', required: false })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiProperty({ description: 'End date for metrics', example: '2024-01-31', required: false })
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @ApiProperty({ description: 'Metrics period', enum: MetricsPeriod, example: MetricsPeriod.MONTH, required: false })
  @IsOptional()
  @IsEnum(MetricsPeriod)
  period?: MetricsPeriod;

  @ApiProperty({ description: 'Department ID filter', example: '64f1a2b3c4d5e6f7g8h9i0j1', required: false })
  @IsOptional()
  @IsString()
  departmentId?: string;

  @ApiProperty({ description: 'Doctor ID filter', example: '64f1a2b3c4d5e6f7g8h9i0j2', required: false })
  @IsOptional()
  @IsString()
  doctorId?: string;

  @ApiProperty({ description: 'Include comparison with previous period', example: true, required: false })
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  includeComparison?: boolean;
}
