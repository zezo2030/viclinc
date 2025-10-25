import { IsArray, IsBoolean, IsNumber, IsOptional, IsString, Min, ValidateNested, ArrayMinSize, ArrayMaxSize } from 'class-validator';
import { Type } from 'class-transformer';

export class TimeSlotDto {
  @IsString()
  startTime: string; // "09:00"

  @IsString()
  endTime: string; // "17:00"
}

export class WeeklyTemplateDto {
  @IsNumber()
  @Min(0)
  @ArrayMaxSize(6)
  dayOfWeek: number; // 0-6

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TimeSlotDto)
  @ArrayMinSize(1)
  slots: TimeSlotDto[];

  @IsBoolean()
  isAvailable: boolean;
}

export class ServiceBufferDto {
  @IsString()
  serviceId: string;

  @IsNumber()
  @Min(0)
  bufferBefore: number;

  @IsNumber()
  @Min(0)
  bufferAfter: number;
}

export class CreateScheduleDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => WeeklyTemplateDto)
  @ArrayMinSize(1)
  @ArrayMaxSize(7)
  weeklyTemplate: WeeklyTemplateDto[];

  @IsNumber()
  @Min(0)
  @IsOptional()
  defaultBufferBefore?: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  defaultBufferAfter?: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ServiceBufferDto)
  @IsOptional()
  serviceBuffers?: ServiceBufferDto[];
}

