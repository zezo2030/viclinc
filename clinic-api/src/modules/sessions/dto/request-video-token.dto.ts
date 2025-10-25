import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsEnum, IsNotEmpty } from 'class-validator';

export enum UserRole {
  DOCTOR = 'doctor',
  PATIENT = 'patient',
}

export class RequestVideoTokenDto {
  @ApiProperty({ 
    description: 'Appointment ID', 
    example: '64f1a2b3c4d5e6f7g8h9i0j1' 
  })
  @IsString()
  @IsNotEmpty()
  appointmentId: string;

  @ApiProperty({ 
    description: 'User role in the session', 
    enum: UserRole, 
    example: UserRole.DOCTOR 
  })
  @IsEnum(UserRole)
  role: UserRole;
}

export class VideoTokenResponseDto {
  @ApiProperty({ description: 'Agora access token' })
  token: string;

  @ApiProperty({ description: 'Agora channel name' })
  channelName: string;

  @ApiProperty({ description: 'User ID for Agora' })
  uid: number;

  @ApiProperty({ description: 'Token expiration time in seconds' })
  expirationTime: number;

  @ApiProperty({ description: 'Session status' })
  sessionStatus: string;

  @ApiProperty({ description: 'Waiting room status' })
  canJoin: boolean;
}
