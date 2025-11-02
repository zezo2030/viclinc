import { IsOptional, IsString, IsBoolean } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class HardDeleteUserDto {
  @ApiProperty({ 
    description: 'Reason for hard deletion', 
    example: 'User requested account deletion', 
    required: false 
  })
  @IsOptional()
  @IsString()
  reason?: string;

  @ApiProperty({ 
    description: 'Whether to delete related data (appointments, sessions, etc.)', 
    example: false,
    required: false,
    default: false
  })
  @IsOptional()
  @IsBoolean()
  purgeRelated?: boolean;

  @ApiProperty({ 
    description: 'Whether to anonymize instead of delete (for medical records)', 
    example: true,
    required: false,
    default: true
  })
  @IsOptional()
  @IsBoolean()
  anonymize?: boolean;
}

