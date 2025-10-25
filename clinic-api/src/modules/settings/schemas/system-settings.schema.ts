import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { ApiProperty } from '@nestjs/swagger';

export type SystemSettingsDocument = SystemSettings & Document;

export enum SettingKey {
  AGORA_CONFIG = 'agora_config',
  SYSTEM_CONFIG = 'system_config',
  NOTIFICATION_CONFIG = 'notification_config',
}

@Schema({ timestamps: true, collection: 'system_settings' })
export class SystemSettings {
  @ApiProperty({ description: 'Setting key', enum: SettingKey, example: SettingKey.AGORA_CONFIG })
  @Prop({ required: true, unique: true, enum: SettingKey })
  key: SettingKey;

  @ApiProperty({ description: 'Setting value', example: { appId: 'test', isEnabled: true } })
  @Prop({ required: true, type: Object })
  value: Record<string, any>;

  @ApiProperty({ description: 'User who last updated this setting', example: '64f1a2b3c4d5e6f7g8h9i0j1' })
  @Prop({ required: true, type: Types.ObjectId, ref: 'User' })
  updatedBy: Types.ObjectId;

  @ApiProperty({ description: 'Last update timestamp', example: '2024-01-15T10:00:00.000Z' })
  @Prop({ default: Date.now })
  updatedAt: Date;
}

export const SystemSettingsSchema = SchemaFactory.createForClass(SystemSettings);

// فهرس فريد على key
SystemSettingsSchema.index({ key: 1 }, { unique: true });

// فهرس على updatedBy للتدقيق
SystemSettingsSchema.index({ updatedBy: 1, updatedAt: -1 });
