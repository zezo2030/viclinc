import { IsNumber, IsOptional, IsBoolean, Min, Max } from 'class-validator';

export class UpdateDoctorServiceDto {
  @IsOptional()
  @IsNumber()
  @Min(0)
  customPrice?: number;

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(480) // 1 دقيقة إلى 8 ساعات
  customDuration?: number;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
