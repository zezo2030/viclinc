import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { ApiProperty } from '@nestjs/swagger';

export type DoctorProfileDocument = DoctorProfile & Document;

export enum DoctorStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  SUSPENDED = 'SUSPENDED',
}

@Schema({ timestamps: true, collection: 'doctorProfiles' })
export class DoctorProfile {
  @ApiProperty({ description: 'User ID reference', example: '64f1a2b3c4d5e6f7g8h9i0j1' })
  @Prop({ required: true, unique: true, type: Types.ObjectId, ref: 'User' })
  userId: Types.ObjectId;

  @ApiProperty({ description: 'Doctor full name', example: 'Dr. Ahmed Mohamed' })
  @Prop({ required: true, trim: true })
  name: string;

  @ApiProperty({ description: 'Medical license number', example: 'DOC123456' })
  @Prop({ required: true, unique: true, trim: true })
  licenseNumber: string;

  @ApiProperty({ description: 'Years of experience', example: 5, minimum: 0, maximum: 50 })
  @Prop({ required: true, min: 0, max: 50 })
  yearsOfExperience: number;

  @ApiProperty({ description: 'Department ID', example: '64f1a2b3c4d5e6f7g8h9i0j2' })
  @Prop({ required: true, type: Types.ObjectId, ref: 'Department' })
  departmentId: Types.ObjectId;

  @ApiProperty({ description: 'Doctor photos URLs', example: ['https://example.com/photo1.jpg'], type: [String] })
  @Prop({ type: [String], default: [] })
  photos: string[];

  @ApiProperty({ description: 'Doctor biography', example: 'Specialist in general surgery', required: false })
  @Prop({ trim: true })
  bio?: string;

  @ApiProperty({ description: 'Doctor approval status', enum: DoctorStatus, example: DoctorStatus.PENDING })
  @Prop({ required: true, enum: DoctorStatus, default: DoctorStatus.PENDING })
  status: DoctorStatus;
}

export const DoctorProfileSchema = SchemaFactory.createForClass(DoctorProfile);

// فهارس
DoctorProfileSchema.index({ userId: 1 }, { unique: true });
DoctorProfileSchema.index({ departmentId: 1 });
DoctorProfileSchema.index({ status: 1 });
DoctorProfileSchema.index({ licenseNumber: 1 }, { unique: true });
