import { IsString, IsNotEmpty, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginAsDto {
  @ApiProperty({ description: 'User ID to impersonate', example: '64f1a2b3c4d5e6f7g8h9i0j1' })
  @IsString()
  @IsNotEmpty()
  userId: string;

  @ApiProperty({ description: 'Reason for impersonation', example: 'User support request', required: false })
  @IsOptional()
  @IsString()
  reason?: string;

  @ApiProperty({ description: 'Session duration in minutes', example: 60, required: false })
  @IsOptional()
  sessionDuration?: number;
}
