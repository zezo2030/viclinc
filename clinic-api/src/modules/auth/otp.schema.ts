import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type OtpDocument = Otp & Document;

@Schema({ timestamps: true, collection: 'otps' })
export class Otp {
  @Prop({ required: true })
  email: string;

  @Prop({ required: true })
  otpCode: string;

  @Prop({ required: true, enum: ['FORGOT_PASSWORD'] })
  purpose: string;

  @Prop({ default: false })
  isUsed: boolean;

  @Prop({ default: Date.now, expires: 600 }) // TTL: 10 minutes
  expiresAt: Date;
}

export const OtpSchema = SchemaFactory.createForClass(Otp);
