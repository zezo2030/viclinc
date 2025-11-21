import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsEnum, IsNotEmpty } from 'class-validator';

export class SaveDeviceTokenDto {
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








