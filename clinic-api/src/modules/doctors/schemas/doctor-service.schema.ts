import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { ApiProperty } from '@nestjs/swagger';

export type DoctorServiceDocument = DoctorService & Document;

@Schema({ timestamps: true, collection: 'doctorServices' })
export class DoctorService {
  @ApiProperty({ description: 'Doctor profile ID', example: '64f1a2b3c4d5e6f7g8h9i0j1' })
  @Prop({ required: true, type: Types.ObjectId, ref: 'DoctorProfile' })
  doctorId: Types.ObjectId;

  @ApiProperty({ description: 'Service ID', example: '64f1a2b3c4d5e6f7g8h9i0j2' })
  @Prop({ required: true, type: Types.ObjectId, ref: 'Service' })
  serviceId: Types.ObjectId;

  @ApiProperty({ description: 'Custom price for this doctor-service combination', example: 150, required: false, minimum: 0 })
  @Prop({ min: 0 })
  customPrice?: number;

  @ApiProperty({ description: 'Custom duration in minutes (1-480)', example: 45, required: false, minimum: 1, maximum: 480 })
  @Prop({ min: 1, max: 480 }) // 1 دقيقة إلى 8 ساعات
  customDuration?: number;

  @ApiProperty({ description: 'Whether this doctor-service is active', example: true })
  @Prop({ default: true })
  isActive: boolean;
}

export const DoctorServiceSchema = SchemaFactory.createForClass(DoctorService);

// فهارس
DoctorServiceSchema.index({ doctorId: 1, serviceId: 1 }, { unique: true });
DoctorServiceSchema.index({ doctorId: 1 });
DoctorServiceSchema.index({ serviceId: 1 });
