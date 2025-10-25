import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { ApiProperty } from '@nestjs/swagger';

export type ImpersonationSessionDocument = ImpersonationSession & Document;

@Schema({ timestamps: true, collection: 'impersonation_sessions' })
export class ImpersonationSession {
  @ApiProperty({ description: 'Admin user ID who initiated impersonation', example: '64f1a2b3c4d5e6f7g8h9i0j1' })
  @Prop({ required: true, type: Types.ObjectId, ref: 'User' })
  adminId: Types.ObjectId;

  @ApiProperty({ description: 'Target user ID being impersonated', example: '64f1a2b3c4d5e6f7g8h9i0j2' })
  @Prop({ required: true, type: Types.ObjectId, ref: 'User' })
  targetUserId: Types.ObjectId;

  @ApiProperty({ description: 'Impersonation JWT token', example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' })
  @Prop({ required: true, unique: true })
  token: string;

  @ApiProperty({ description: 'Token expiration date', example: '2024-01-15T12:00:00.000Z' })
  @Prop({ required: true })
  expiresAt: Date;

  @ApiProperty({ description: 'Whether the session is active', example: true, default: true })
  @Prop({ default: true })
  isActive: boolean;

  @ApiProperty({ description: 'IP address when session was created', example: '192.168.1.1', required: false })
  @Prop()
  ipAddress?: string;

  @ApiProperty({ description: 'User agent when session was created', example: 'Mozilla/5.0...', required: false })
  @Prop()
  userAgent?: string;

  @ApiProperty({ description: 'Reason for impersonation', example: 'User support request', required: false })
  @Prop()
  reason?: string;

  @ApiProperty({ description: 'Session metadata', example: { department: 'IT', priority: 'high' }, required: false })
  @Prop({ type: Object })
  metadata?: Record<string, any>;

  @ApiProperty({ description: 'When the session was ended', example: '2024-01-15T11:30:00.000Z', required: false })
  @Prop()
  endedAt?: Date;

  @ApiProperty({ description: 'How the session was ended', example: 'MANUAL', required: false })
  @Prop()
  endedBy?: string;
}

export const ImpersonationSessionSchema = SchemaFactory.createForClass(ImpersonationSession);

// فهارس للاستعلامات
ImpersonationSessionSchema.index({ adminId: 1, isActive: 1 });
ImpersonationSessionSchema.index({ targetUserId: 1, isActive: 1 });
ImpersonationSessionSchema.index({ token: 1 }, { unique: true });
ImpersonationSessionSchema.index({ expiresAt: 1 });
ImpersonationSessionSchema.index({ isActive: 1, expiresAt: 1 });
ImpersonationSessionSchema.index({ createdAt: -1 });
