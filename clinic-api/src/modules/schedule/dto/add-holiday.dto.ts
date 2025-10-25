import { IsDateString, IsOptional, IsString } from 'class-validator';

export class AddHolidayDto {
  @IsDateString()
  startDate: string;

  @IsDateString()
  endDate: string;

  @IsString()
  @IsOptional()
  reason?: string;
}

