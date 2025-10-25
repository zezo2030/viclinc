import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { ApiProperty } from '@nestjs/swagger';

export type ServiceDocument = Service & Document;

@Schema({ timestamps: true, collection: 'services' })
export class Service {
  @ApiProperty({ description: 'Service name', example: 'General Consultation' })
  @Prop({ required: true, trim: true })
  name: string;

  @ApiProperty({ description: 'Department ID this service belongs to', example: '64f1a2b3c4d5e6f7g8h9i0j1' })
  @Prop({ type: Types.ObjectId, ref: 'Department', required: true })
  departmentId: Types.ObjectId;

  @ApiProperty({ description: 'Service description', example: 'General medical consultation', required: false })
  @Prop()
  description?: string;

  @ApiProperty({ description: 'Default duration in minutes', example: 30, required: false })
  @Prop()
  defaultDurationMin?: number;

  @ApiProperty({ description: 'Base duration in minutes', example: 30, required: false })
  @Prop()
  baseDuration?: number;

  @ApiProperty({ description: 'Default price', example: 100, required: false })
  @Prop()
  defaultPrice?: number;

  @ApiProperty({ description: 'Base price', example: 100, required: false })
  @Prop()
  basePrice?: number;

  @ApiProperty({ description: 'Whether the service is active', example: true })
  @Prop({ default: true })
  isActive: boolean;
}

export const ServiceSchema = SchemaFactory.createForClass(Service);
ServiceSchema.index({ departmentId: 1 });
ServiceSchema.index({ departmentId: 1, name: 1 }, { unique: true });

