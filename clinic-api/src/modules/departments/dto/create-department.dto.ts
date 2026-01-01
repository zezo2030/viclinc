import { IsBoolean, IsOptional, IsString, MinLength, ValidateNested, IsObject } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';

export class CreateDepartmentDto {
  @ApiProperty({ description: 'Department name', example: 'Cardiology', minLength: 2 })
  @IsString()
  @MinLength(2)
  name: string;

  @ApiProperty({ description: 'Department description', example: 'Heart and cardiovascular diseases', required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ description: 'Whether the department is active', example: true, required: false })
  @IsOptional()
  @Transform(({ value }) => {
    if (value === 'true' || value === true) return true;
    if (value === 'false' || value === false) return false;
    return value;
  })
  @IsBoolean()
  isActive?: boolean;

  @ApiProperty({ 
    description: 'Department working hours', 
    example: { startTime: '08:00', endTime: '17:00' }, 
    required: false 
  })
  @IsOptional()
  @Transform(({ value }) => {
    // Handle undefined/null
    if (value === undefined || value === null || value === '') {
      return undefined;
    }
    // Handle both JSON string (from FormData) and object (from JSON)
    if (typeof value === 'string') {
      try {
        const parsed = JSON.parse(value);
        // Validate parsed object has required fields
        if (parsed && typeof parsed === 'object' && parsed.startTime && parsed.endTime) {
          return parsed;
        }
        return undefined;
      } catch {
        return undefined;
      }
    }
    // If already an object, validate it has required fields
    if (typeof value === 'object' && value.startTime && value.endTime) {
      return value;
    }
    return undefined;
  })
  @IsObject()
  @ValidateNested()
  @Type(() => Object)
  workingHours?: {
    startTime: string;
    endTime: string;
  };
}


