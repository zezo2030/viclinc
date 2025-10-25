import { IsArray, IsBoolean, IsDateString, IsOptional, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class TimeSlotDto {
  @IsString()
  startTime: string;

  @IsString()
  endTime: string;
}

export class AddExceptionDto {
  @IsDateString()
  date: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TimeSlotDto)
  @IsOptional()
  slots?: TimeSlotDto[];

  @IsBoolean()
  isAvailable: boolean;

  @IsString()
  @IsOptional()
  reason?: string;
}

