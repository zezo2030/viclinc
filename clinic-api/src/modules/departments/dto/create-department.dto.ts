import { IsBoolean, IsOptional, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateDepartmentDto {
  @ApiProperty({ description: 'Department name', example: 'Cardiology', minLength: 2 })
  @IsString()
  @MinLength(2)
  name: string;

  @ApiProperty({ description: 'Department description', example: 'Heart and cardiovascular diseases', required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ description: 'Department icon path', example: '/brain_11666594 copy.webp', required: false })
  @IsOptional()
  @IsString()
  icon?: string;

  @ApiProperty({ description: 'Whether the department is active', example: true, required: false })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}


