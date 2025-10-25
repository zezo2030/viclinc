import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ApiProperty } from '@nestjs/swagger';
import { Document, Types } from 'mongoose';

export type MedicalRecordDocument = MedicalRecord & Document;

export interface PrescriptionItem {
  medication: string;
  dosage: string;
  duration: string;
  instructions?: string;
}

export interface Attachment {
  type: string;
  url: string;
  name: string;
  size?: number;
}

export interface VitalSigns {
  bloodPressure?: string;
  temperature?: number;
  heartRate?: number;
  weight?: number;
  height?: number;
}

@Schema({ timestamps: true, collection: 'medical_records' })
export class MedicalRecord {
  @ApiProperty({ description: 'Patient user ID', example: '64f1a2b3c4d5e6f7g8h9i0j1' })
  @Prop({ required: true, type: Types.ObjectId, ref: 'User', index: true })
  patientId: Types.ObjectId;

  @ApiProperty({ description: 'Doctor user ID', example: '64f1a2b3c4d5e6f7g8h9i0j2' })
  @Prop({ required: true, type: Types.ObjectId, ref: 'User', index: true })
  doctorId: Types.ObjectId;

  @ApiProperty({ description: 'Appointment ID', example: '64f1a2b3c4d5e6f7g8h9i0j3', required: false })
  @Prop({ type: Types.ObjectId, ref: 'Appointment', sparse: true })
  appointmentId?: Types.ObjectId;

  @ApiProperty({ description: 'Record version number', example: 1, default: 1 })
  @Prop({ required: true, default: 1, min: 1 })
  version: number;

  @ApiProperty({ description: 'Medical diagnosis', example: 'Hypertension stage 1' })
  @Prop({ required: true, maxlength: 1000 })
  diagnosis: string;

  @ApiProperty({ 
    description: 'Prescription items', 
    example: [{ medication: 'Lisinopril', dosage: '10mg', duration: '30 days', instructions: 'Take once daily' }],
    required: false 
  })
  @Prop({ type: [Object] })
  prescription?: PrescriptionItem[];

  @ApiProperty({ description: 'Additional notes', example: 'Patient shows good response to treatment', required: false })
  @Prop({ maxlength: 2000 })
  notes?: string;

  @ApiProperty({ 
    description: 'File attachments', 
    example: [{ type: 'image', url: 'https://...', name: 'xray.jpg', size: 1024000 }],
    required: false 
  })
  @Prop({ type: [Object] })
  attachments?: Attachment[];

  @ApiProperty({ 
    description: 'Vital signs measurements', 
    example: { bloodPressure: '120/80', temperature: 36.5, heartRate: 72, weight: 70, height: 175 },
    required: false 
  })
  @Prop({ type: Object })
  vitalSigns?: VitalSigns;

  @ApiProperty({ description: 'Whether record is active', example: true, default: true })
  @Prop({ default: true })
  isActive: boolean;

  @ApiProperty({ description: 'Record creation timestamp', example: '2024-01-15T10:00:00.000Z' })
  createdAt: Date;

  @ApiProperty({ description: 'Record last update timestamp', example: '2024-01-15T10:30:00.000Z' })
  updatedAt: Date;
}

export const MedicalRecordSchema = SchemaFactory.createForClass(MedicalRecord);

// Create compound indexes for better query performance
MedicalRecordSchema.index({ patientId: 1, updatedAt: -1 });
MedicalRecordSchema.index({ doctorId: 1, updatedAt: -1 });
MedicalRecordSchema.index({ appointmentId: 1 }, { sparse: true });
