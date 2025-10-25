import { IsString, IsNumber, IsOptional, IsArray, Min, Max, IsMongoId, MinLength, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateDoctorDto {
  @ApiProperty({ description: 'User ID', example: '64f1a2b3c4d5e6f7g8h9i0j1' })
  @IsMongoId()
  userId: string;

  @ApiProperty({ description: 'Doctor full name', example: 'Dr. Ahmed Mohamed', minLength: 2, maxLength: 100 })
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  name: string;

  @ApiProperty({ description: 'Medical license number', example: 'DOC123456', minLength: 5, maxLength: 50 })
  @IsString()
  @MinLength(5)
  @MaxLength(50)
  licenseNumber: string;

  @ApiProperty({ description: 'Years of experience', example: 5, minimum: 0, maximum: 50 })
  @IsNumber()
  @Min(0)
  @Max(50)
  yearsOfExperience: number;

  @ApiProperty({ description: 'Department ID', example: '64f1a2b3c4d5e6f7g8h9i0j2' })
  @IsMongoId()
  departmentId: string;

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
