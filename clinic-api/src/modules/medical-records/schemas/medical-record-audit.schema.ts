import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';
import { Document, Types } from 'mongoose';

export type MedicalRecordAuditDocument = MedicalRecordAudit & Document;

export enum AuditAction {
  CREATE = 'CREATE',
  UPDATE = 'UPDATE',
  VIEW = 'VIEW',
  DELETE = 'DELETE',
}

export enum UserRole {
  DOCTOR = 'DOCTOR',
  PATIENT = 'PATIENT',
  ADMIN = 'ADMIN',
}

@Schema({ timestamps: false, collection: 'medical_record_audits' })
export class MedicalRecordAudit {
  @ApiProperty({ description: 'Medical record ID', example: '64f1a2b3c4d5e6f7g8h9i0j1' })
  @Prop({ required: true, type: Types.ObjectId, ref: 'MedicalRecord', index: true })
  recordId: Types.ObjectId;

  @ApiProperty({ description: 'User who performed the action', example: '64f1a2b3c4d5e6f7g8h9i0j2' })
  @Prop({ required: true, type: Types.ObjectId, ref: 'User', index: true })
  userId: Types.ObjectId;

  @ApiProperty({ description: 'User role', enum: UserRole, example: UserRole.DOCTOR })
  @Prop({ required: true, enum: UserRole })
  userRole: UserRole;

  @ApiProperty({ description: 'Action performed', enum: AuditAction, example: AuditAction.CREATE })
  @Prop({ required: true, enum: AuditAction })
  action: AuditAction;

  @ApiProperty({ 
    description: 'Changes made (for UPDATE actions)', 
    example: { diagnosis: { from: 'Hypertension', to: 'Hypertension stage 2' } },
    required: false 
  })
  @Prop({ type: Object })
  changes?: Record<string, any>;

  @ApiProperty({ description: 'Action timestamp', example: '2024-01-15T10:00:00.000Z' })
  @Prop({ required: true, default: Date.now, index: true })
  at: Date;

  @ApiProperty({ description: 'User IP address', example: '192.168.1.1', required: false })
  @Prop()
  ipAddress?: string;

  @ApiProperty({ description: 'User agent string', example: 'Mozilla/5.0...', required: false })
  @Prop()
  userAgent?: string;

  @ApiProperty({ description: 'Additional metadata', example: { sessionId: 'abc123' }, required: false })
  @Prop({ type: Object })
  metadata?: Record<string, any>;
}

export const MedicalRecordAuditSchema = SchemaFactory.createForClass(MedicalRecordAudit);

// Create compound indexes for better query performance
MedicalRecordAuditSchema.index({ recordId: 1, at: -1 });
MedicalRecordAuditSchema.index({ userId: 1, at: -1 });
MedicalRecordAuditSchema.index({ userRole: 1, at: -1 });
