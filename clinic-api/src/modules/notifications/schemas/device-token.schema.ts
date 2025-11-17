import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { ApiProperty } from '@nestjs/swagger';

export type DeviceTokenDocument = DeviceToken & Document;

@Schema({ timestamps: true })
export class DeviceToken {
  @ApiProperty({ description: 'User ID', example: '507f1f77bcf86cd799439011' })
  @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
  userId: Types.ObjectId;

  @ApiProperty({ description: 'Device token from Firebase', example: 'fGhJkLmNoPqRsTuVwXyZ123456789' })
  @Prop({ required: true, unique: true, index: true })
  deviceToken: string;

  @ApiProperty({ description: 'Platform', enum: ['android', 'ios'], example: 'android' })
  @Prop({ required: true, enum: ['android', 'ios'] })
  platform: string;

  @ApiProperty({ description: 'Created at', example: '2024-01-15T10:00:00.000Z' })
  @Prop()
  createdAt?: Date;

  @ApiProperty({ description: 'Updated at', example: '2024-01-15T10:00:00.000Z' })
  @Prop()
  updatedAt?: Date;
}

export const DeviceTokenSchema = SchemaFactory.createForClass(DeviceToken);

// Compound index for userId and deviceToken
DeviceTokenSchema.index({ userId: 1, deviceToken: 1 });

