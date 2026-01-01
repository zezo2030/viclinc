import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { ApiProperty } from '@nestjs/swagger';

export type DepartmentDocument = Department & Document;

@Schema({ timestamps: true, collection: 'departments' })
export class Department {
  @ApiProperty({ description: 'Department name', example: 'Cardiology' })
  @Prop({ required: true, unique: true, trim: true })
  name: string;

  @ApiProperty({ description: 'Department description', example: 'Heart and cardiovascular diseases', required: false })
  @Prop()
  description?: string;

  @ApiProperty({ description: 'Department logo path (used as icon)', example: 'sections/logos/uuid-filename.png', required: false })
  @Prop()
  logoPath?: string;

  @ApiProperty({ description: 'Whether the department is active', example: true })
  @Prop({ default: true })
  isActive: boolean;

  @ApiProperty({ 
    description: 'Department working hours', 
    example: { startTime: '08:00', endTime: '17:00' }, 
    required: false 
  })
  @Prop({ type: Object, required: false })
  workingHours?: {
    startTime: string;
    endTime: string;
  };
}

export const DepartmentSchema = SchemaFactory.createForClass(Department);
DepartmentSchema.index({ name: 1 }, { unique: true });

