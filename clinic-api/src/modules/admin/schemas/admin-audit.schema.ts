import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { ApiProperty } from '@nestjs/swagger';

export type AdminAuditDocument = AdminAudit & Document;

export enum AuditAction {
  LOGIN_AS = 'LOGIN_AS',
  LOGOUT_AS = 'LOGOUT_AS',
  EXPORT_DATA = 'EXPORT_DATA',
  IMPORT_DATA = 'IMPORT_DATA',
  UPDATE_USER_ROLE = 'UPDATE_USER_ROLE',
  UPDATE_USER_STATUS = 'UPDATE_USER_STATUS',
  UPDATE_DOCTOR_STATUS = 'UPDATE_DOCTOR_STATUS',
  UPDATE_APPOINTMENT_STATUS = 'UPDATE_APPOINTMENT_STATUS',
  CREATE_BACKUP = 'CREATE_BACKUP',
  VIEW_SENSITIVE_DATA = 'VIEW_SENSITIVE_DATA',
}

@Schema({ timestamps: true, collection: 'admin_audit' })
export class AdminAudit {
  @ApiProperty({ description: 'Admin user ID who performed the action', example: '64f1a2b3c4d5e6f7g8h9i0j1' })
  @Prop({ required: true, type: Types.ObjectId, ref: 'User' })
  adminId: Types.ObjectId;

  @ApiProperty({ description: 'Action performed', enum: AuditAction, example: AuditAction.LOGIN_AS })
  @Prop({ required: true, enum: AuditAction })
  action: AuditAction;

  @ApiProperty({ description: 'Target user ID (if applicable)', example: '64f1a2b3c4d5e6f7g8h9i0j2', required: false })
  @Prop({ type: Types.ObjectId, ref: 'User' })
  targetUserId?: Types.ObjectId;

  @ApiProperty({ description: 'IP address of the admin', example: '192.168.1.1', required: false })
  @Prop()
  ipAddress?: string;

  @ApiProperty({ description: 'User agent string', example: 'Mozilla/5.0...', required: false })
  @Prop()
  userAgent?: string;

  @ApiProperty({ description: 'Additional metadata about the action', example: { reason: 'User requested', departmentId: '64f1a2b3c4d5e6f7g8h9i0j3' }, required: false })
  @Prop({ type: Object })
  metadata?: Record<string, any>;

  @ApiProperty({ description: 'Session ID for tracking', example: 'sess_123456789', required: false })
  @Prop()
  sessionId?: string;

  @ApiProperty({ description: 'Whether the action was successful', example: true, default: true })
  @Prop({ default: true })
  success: boolean;

  @ApiProperty({ description: 'Error message if action failed', example: 'User not found', required: false })
  @Prop()
  errorMessage?: string;
}

export const AdminAuditSchema = SchemaFactory.createForClass(AdminAudit);

// فهارس للاستعلامات
AdminAuditSchema.index({ adminId: 1, createdAt: -1 });
AdminAuditSchema.index({ action: 1, createdAt: -1 });
AdminAuditSchema.index({ targetUserId: 1, createdAt: -1 });
AdminAuditSchema.index({ createdAt: -1 });
AdminAuditSchema.index({ sessionId: 1 });
AdminAuditSchema.index({ success: 1, createdAt: -1 });
