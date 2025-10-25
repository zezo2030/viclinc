import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { ApiProperty } from '@nestjs/swagger';

export type ChatSessionDocument = ChatSession & Document;

export enum ChatSessionStatus {
  ACTIVE = 'active',
  ARCHIVED = 'archived',
  EXPIRED = 'expired',
}

@Schema({ timestamps: true, collection: 'chat_sessions' })
export class ChatSession {
  @ApiProperty({ description: 'Appointment ID', example: '64f1a2b3c4d5e6f7g8h9i0j1' })
  @Prop({ required: true, unique: true, type: Types.ObjectId, ref: 'Appointment' })
  appointmentId: Types.ObjectId;

  @ApiProperty({ description: 'Doctor user ID', example: '64f1a2b3c4d5e6f7g8h9i0j2' })
  @Prop({ required: true, type: Types.ObjectId, ref: 'User' })
  doctorId: Types.ObjectId;

  @ApiProperty({ description: 'Patient user ID', example: '64f1a2b3c4d5e6f7g8h9i0j3' })
  @Prop({ required: true, type: Types.ObjectId, ref: 'User' })
  patientId: Types.ObjectId;

  @ApiProperty({ description: 'Session status', enum: ChatSessionStatus, example: ChatSessionStatus.ACTIVE })
  @Prop({ required: true, enum: ChatSessionStatus, default: ChatSessionStatus.ACTIVE })
  status: ChatSessionStatus;

  @ApiProperty({ description: 'Session expiration timestamp', example: '2024-01-15T11:00:00.000Z' })
  @Prop({ required: true })
  expiresAt: Date;

  @ApiProperty({ description: 'Archived timestamp', example: '2024-01-15T10:30:00.000Z', required: false })
  @Prop()
  archivedAt?: Date;

  @ApiProperty({ description: 'User who archived the session', example: '64f1a2b3c4d5e6f7g8h9i0j2', required: false })
  @Prop({ type: Types.ObjectId, ref: 'User' })
  archivedBy?: Types.ObjectId;

  @ApiProperty({ description: 'Total message count', example: 15, default: 0 })
  @Prop({ default: 0, min: 0 })
  messageCount: number;

  @ApiProperty({ description: 'Last message timestamp', example: '2024-01-15T10:25:00.000Z', required: false })
  @Prop()
  lastMessageAt?: Date;

  @ApiProperty({ description: 'Session metadata', example: { serviceType: 'consultation' }, required: false })
  @Prop({ type: Object })
  metadata?: Record<string, any>;
}

export const ChatSessionSchema = SchemaFactory.createForClass(ChatSession);

// فهرس فريد على appointmentId
ChatSessionSchema.index({ appointmentId: 1 }, { unique: true });

// TTL index على expiresAt
ChatSessionSchema.index({ expiresAt: 1 }, { 
  expireAfterSeconds: 0,
  partialFilterExpression: { status: ChatSessionStatus.ACTIVE }
});

// فهارس للاستعلامات
ChatSessionSchema.index({ status: 1, expiresAt: 1 });
ChatSessionSchema.index({ doctorId: 1, status: 1 });
ChatSessionSchema.index({ patientId: 1, status: 1 });
ChatSessionSchema.index({ lastMessageAt: -1 });
