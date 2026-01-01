import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsEnum, IsNotEmpty, IsOptional } from 'class-validator';

export class SaveDeviceTokenDto {
  @ApiProperty({ description: 'User ID (optional, will use JWT token if not provided)', example: '507f1f77bcf86cd799439011', required: false })
  @IsString()
  @IsOptional()
  userId?: string;

  @ApiProperty({ description: 'Device token from Firebase', example: 'fGhJkLmNoPqRsTuVwXyZ123456789' })
  @IsString()
  @IsNotEmpty()
  deviceToken: string;

  @ApiProperty({ description: 'Platform', enum: ['android', 'ios'], example: 'android' })
  @IsEnum(['android', 'ios'])
  @IsNotEmpty()
  platform: 'android' | 'ios';
}

export class DeleteDeviceTokenDto {
  @ApiProperty({ description: 'Device token to delete', example: 'fGhJkLmNoPqRsTuVwXyZ123456789' })
  @IsString()
  @IsNotEmpty()
  deviceToken: string;
}








