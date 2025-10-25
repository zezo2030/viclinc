import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, IsEnum, MaxLength, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export enum MessageType {
  TEXT = 'text',
  SYSTEM = 'system',
}

export class AttachmentDto {
  @ApiProperty({ description: 'Attachment type', example: 'image' })
  @IsString()
  @IsNotEmpty()
  type: string;

  @ApiProperty({ description: 'Attachment URL', example: 'https://example.com/file.jpg' })
  @IsString()
  @IsNotEmpty()
  url: string;

  @ApiProperty({ description: 'Attachment name', example: 'image.jpg', required: false })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({ description: 'Attachment size in bytes', example: 1024000, required: false })
  @IsOptional()
  size?: number;
}

export class SendMessageDto {
  @ApiProperty({ 
    description: 'Message content', 
    example: 'Hello, how are you feeling today?',
    maxLength: 2000
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(2000)
  content: string;

  @ApiProperty({ 
    description: 'Message type', 
    enum: MessageType, 
    example: MessageType.TEXT,
    required: false
  })
  @IsOptional()
  @IsEnum(MessageType)
  type?: MessageType;

  @ApiProperty({ 
    description: 'Reply to message ID', 
    example: '64f1a2b3c4d5e6f7g8h9i0j1',
    required: false
  })
  @IsOptional()
  @IsString()
  replyTo?: string;

  @ApiProperty({ 
    description: 'Message attachments', 
    type: [AttachmentDto],
    required: false
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AttachmentDto)
  attachments?: AttachmentDto[];
}

export class MessageResponseDto {
  @ApiProperty({ description: 'Message ID' })
  id: string;

  @ApiProperty({ description: 'Session ID' })
  sessionId: string;

  @ApiProperty({ description: 'Sender ID' })
  senderId: string;

  @ApiProperty({ description: 'Sender role' })
  senderRole: string;

  @ApiProperty({ description: 'Message content' })
  content: string;

  @ApiProperty({ description: 'Message type' })
  type: string;

  @ApiProperty({ description: 'Whether message is read' })
  isRead: boolean;

  @ApiProperty({ description: 'Message timestamp' })
  createdAt: Date;

  @ApiProperty({ description: 'Reply to message ID', required: false })
  replyTo?: string;

  @ApiProperty({ description: 'Message attachments', required: false })
  attachments?: AttachmentDto[];
}
