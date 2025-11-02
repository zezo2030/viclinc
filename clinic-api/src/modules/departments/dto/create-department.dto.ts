import { IsBoolean, IsOptional, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';

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
}


