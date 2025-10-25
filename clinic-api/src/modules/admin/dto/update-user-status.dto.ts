import { IsEnum, IsString, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { UserStatus } from '../../users/schemas/user.schema';

export class UpdateUserStatusDto {
  @ApiProperty({ description: 'New user status', enum: UserStatus, example: UserStatus.ACTIVE })
  @IsEnum(UserStatus)
  status: UserStatus;

  @ApiProperty({ description: 'Reason for status change', example: 'Account violation', required: false })
  @IsOptional()
  @IsString()
  reason?: string;
}
