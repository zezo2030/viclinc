import { IsString, IsNumber, IsOptional, Min, Max, MinLength, MaxLength, IsMongoId } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

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
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @Max(50)
  yearsOfExperience?: number;

  @ApiProperty({ description: 'Department ID', example: '64f1a2b3c4d5e6f7g8h9i0j2', required: false })
  @IsOptional()
  @IsMongoId()
  departmentId?: string;

  @ApiProperty({ description: 'Doctor avatar URL', example: 'https://example.com/avatar.jpg', required: false })
  @IsOptional()
  @IsString()
  avatar?: string;

  @ApiProperty({ description: 'Doctor biography', example: 'Specialist in general surgery', required: false, maxLength: 1000 })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  bio?: string;
}
