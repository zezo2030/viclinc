import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber, IsBoolean, IsOptional, Min, Max } from 'class-validator';

export class UpdateAgoraSettingsDto {
  @ApiProperty({ 
    description: 'Agora App ID', 
    example: 'your-app-id-here',
    required: false 
  })
  @IsOptional()
  @IsString()
  appId?: string;

  @ApiProperty({ 
    description: 'Agora App Certificate', 
    example: 'your-app-certificate-here',
    required: false 
  })
  @IsOptional()
  @IsString()
  appCertificate?: string;

  @ApiProperty({ 
    description: 'Token expiration time in seconds', 
    example: 3600,
    minimum: 60,
    maximum: 86400,
    required: false 
  })
  @IsOptional()
  @IsNumber()
  @Min(60)
  @Max(86400)
  tokenExpirationTime?: number;

  @ApiProperty({ 
    description: 'Whether Agora is enabled', 
    example: true,
    required: false 
  })
  @IsOptional()
  @IsBoolean()
  isEnabled?: boolean;
}

export class AgoraSettingsResponseDto {
  @ApiProperty({ description: 'Agora App ID' })
  appId: string;

  @ApiProperty({ description: 'Agora App Certificate (masked)' })
  appCertificate: string;

  @ApiProperty({ description: 'Token expiration time in seconds' })
  tokenExpirationTime: number;

  @ApiProperty({ description: 'Whether Agora is enabled' })
  isEnabled: boolean;

  @ApiProperty({ description: 'Last updated by user ID' })
  updatedBy: string;

  @ApiProperty({ description: 'Last update timestamp' })
  updatedAt: Date;
}

export class TestAgoraConnectionDto {
  @ApiProperty({ description: 'Test result' })
  success: boolean;

  @ApiProperty({ description: 'Test message' })
  message: string;

  @ApiProperty({ description: 'Test timestamp' })
  timestamp: Date;
}
