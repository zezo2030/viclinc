import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { ApiProperty } from '@nestjs/swagger';

export type UserDocument = User & Document;

export enum Role {
  ADMIN = 'ADMIN',
  DOCTOR = 'DOCTOR',
  PATIENT = 'PATIENT',
}

export enum UserStatus {
  ACTIVE = 'ACTIVE',
  DISABLED = 'DISABLED',
  PENDING_DELETE = 'PENDING_DELETE',
}

@Schema({ timestamps: true, collection: 'users' })
export class User {
  @ApiProperty({ description: 'User full name', example: 'Ahmed Mohamed' })
  @Prop({ required: false, trim: true })
  name?: string;

  @ApiProperty({ description: 'User email address', example: 'user@example.com' })
  @Prop({ required: true, unique: true, lowercase: true, trim: true })
  email: string;

  @ApiProperty({ description: 'User phone number', example: '+1234567890' })
  @Prop({ required: true, unique: true, trim: true })
  phone: string;

  @ApiProperty({ description: 'Hashed password', example: '$2b$10$...' })
  @Prop({ required: true })
  passwordHash: string;

  @ApiProperty({ description: 'User role', enum: Role, example: Role.PATIENT })
  @Prop({ required: true, enum: Role })
  role: Role;

  @ApiProperty({ description: 'User status', enum: UserStatus, example: UserStatus.ACTIVE })
  @Prop({ required: true, enum: UserStatus, default: UserStatus.ACTIVE })
  status: UserStatus;
}

export const UserSchema = SchemaFactory.createForClass(User);

UserSchema.index({ email: 1 }, { unique: true });
UserSchema.index({ phone: 1 }, { unique: true });

