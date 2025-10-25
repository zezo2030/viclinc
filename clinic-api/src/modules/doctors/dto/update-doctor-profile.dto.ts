import { IsString, IsNumber, IsOptional, IsArray, Min, Max, MinLength, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateDoctorProfileDto {
  @ApiProperty({ description: 'Doctor full name', example: 'Dr. Ahmed Mohamed', required: false, minLength: 2, maxLength: 100 })
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  name?: string;

  @ApiProperty({ description: 'Medical license number', example: 'DOC123456', required: false, minLength: 5, maxLength: 50 })
  @IsOptional()
  @IsString()
  @MinLength(5)
  @MaxLength(50)
  licenseNumber?: string;

  @ApiProperty({ description: 'Years of experience', example: 5, required: false, minimum: 0, maximum: 50 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(50)
  yearsOfExperience?: number;

  @ApiProperty({ description: 'Doctor photos URLs', example: ['https://example.com/photo1.jpg'], required: false, type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  photos?: string[];

  @ApiProperty({ description: 'Doctor biography', example: 'Specialist in general surgery', required: false, maxLength: 1000 })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  bio?: string;
}
