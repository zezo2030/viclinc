import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsEnum, MaxLength, IsOptional } from 'class-validator';

export enum ReportReason {
  SPAM = 'spam',
  HARASSMENT = 'harassment',
  INAPPROPRIATE_CONTENT = 'inappropriate_content',
  FAKE_INFORMATION = 'fake_information',
  OTHER = 'other',
}

export class ReportChatDto {
  @ApiProperty({ 
    description: 'Report reason', 
    enum: ReportReason, 
    example: ReportReason.HARASSMENT 
  })
  @IsEnum(ReportReason)
  reason: ReportReason;

  @ApiProperty({ 
    description: 'Additional details about the report', 
    example: 'User sent inappropriate messages',
    maxLength: 500,
    required: false
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  details?: string;

  @ApiProperty({ 
    description: 'Message ID being reported', 
    example: '64f1a2b3c4d5e6f7g8h9i0j1',
    required: false
  })
  @IsOptional()
  @IsString()
  messageId?: string;
}

export class ReportResponseDto {
  @ApiProperty({ description: 'Report ID' })
  reportId: string;

  @ApiProperty({ description: 'Report status' })
  status: string;

  @ApiProperty({ description: 'Report timestamp' })
  createdAt: Date;
}
