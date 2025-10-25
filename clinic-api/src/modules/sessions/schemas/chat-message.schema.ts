import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { ApiProperty } from '@nestjs/swagger';

export type ChatMessageDocument = ChatMessage & Document;

export enum MessageType {
  TEXT = 'text',
  SYSTEM = 'system',
}

export enum SenderRole {
  DOCTOR = 'doctor',
  PATIENT = 'patient',
}

@Schema({ timestamps: true, collection: 'chat_messages' })
export class ChatMessage {
  @ApiProperty({ description: 'Chat session ID', example: '64f1a2b3c4d5e6f7g8h9i0j1' })
  @Prop({ required: true, type: Types.ObjectId, ref: 'ChatSession' })
  sessionId: Types.ObjectId;

  @ApiProperty({ description: 'Sender user ID', example: '64f1a2b3c4d5e6f7g8h9i0j2' })
  @Prop({ required: true, type: Types.ObjectId, ref: 'User' })
  senderId: Types.ObjectId;

  @ApiProperty({ description: 'Sender role', enum: SenderRole, example: SenderRole.DOCTOR })
  @Prop({ required: true, enum: SenderRole })
  senderRole: SenderRole;

  @ApiProperty({ description: 'Message content', example: 'Hello, how are you feeling today?' })
  @Prop({ required: true, maxlength: 2000 })
  content: string;

  @ApiProperty({ description: 'Message type', enum: MessageType, example: MessageType.TEXT })
  @Prop({ required: true, enum: MessageType, default: MessageType.TEXT })
  type: MessageType;

  @ApiProperty({ description: 'Whether message is read', example: false, default: false })
  @Prop({ default: false })
  isRead: boolean;

  @ApiProperty({ description: 'Read timestamp', example: '2024-01-15T10:05:00.000Z', required: false })
  @Prop()
  readAt?: Date;

  @ApiProperty({ description: 'Message metadata', example: { edited: true }, required: false })
  @Prop({ type: Object })
  metadata?: Record<string, any>;

  @ApiProperty({ description: 'Reply to message ID', example: '64f1a2b3c4d5e6f7g8h9i0j3', required: false })
  @Prop({ type: Types.ObjectId, ref: 'ChatMessage' })
  replyTo?: Types.ObjectId;

  @ApiProperty({ description: 'Message attachments', example: [{ type: 'image', url: 'https://...' }], required: false })
  @Prop({ type: [Object] })
  attachments?: Array<{
    type: string;
    url: string;
    name?: string;
    size?: number;
  }>;
}

export const ChatMessageSchema = SchemaFactory.createForClass(ChatMessage);

// فهارس للاستعلامات
ChatMessageSchema.index({ sessionId: 1, createdAt: 1 });
ChatMessageSchema.index({ senderId: 1, createdAt: -1 });
ChatMessageSchema.index({ sessionId: 1, isRead: 1 });
ChatMessageSchema.index({ createdAt: -1 });
ChatMessageSchema.index({ replyTo: 1 });
