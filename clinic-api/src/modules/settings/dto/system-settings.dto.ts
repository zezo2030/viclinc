import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber, IsBoolean, IsOptional, IsObject, IsArray, ValidateNested, IsEmail } from 'class-validator';
import { Type } from 'class-transformer';

// Branding Settings DTOs
export class BrandingSettingsDto {
  @ApiProperty({ description: 'Application name', example: 'نظام العيادة الذكي' })
  @IsString()
  appName: string;

  @ApiProperty({ description: 'Logo URL', required: false })
  @IsOptional()
  @IsString()
  logoUrl?: string;

  @ApiProperty({ description: 'Primary color', example: '#2563eb', required: false })
  @IsOptional()
  @IsString()
  primaryColor?: string;

  @ApiProperty({ description: 'Default language', example: 'ar' })
  @IsString()
  defaultLanguage: string;

  @ApiProperty({ description: 'Timezone', example: 'Asia/Riyadh' })
  @IsString()
  timezone: string;
}

// Appointment Settings DTOs
export class AppointmentSettingsDto {
  @ApiProperty({ description: 'Default appointment duration in minutes', example: 30 })
  @IsNumber()
  defaultDurationMinutes: number;

  @ApiProperty({ description: 'Cancellation window in hours', example: 24 })
  @IsNumber()
  cancellationWindowHours: number;

  @ApiProperty({ description: 'Allow reschedule', example: true })
  @IsBoolean()
  allowReschedule: boolean;

  @ApiProperty({ description: 'Reminder offsets in hours', example: [24, 2] })
  @IsArray()
  @IsNumber({}, { each: true })
  reminderOffsets: number[];
}

// Payment Settings DTOs
export class PaymentSettingsDto {
  @ApiProperty({ description: 'Default currency', example: 'SAR' })
  @IsString()
  defaultCurrency: string;

  @ApiProperty({ description: 'Payment provider', example: 'stripe' })
  @IsString()
  provider: string;

  @ApiProperty({ description: 'Provider configuration', example: {} })
  @IsObject()
  providerConfig: Record<string, string>;

  @ApiProperty({ description: 'Processing fee percentage', example: 2.5, required: false })
  @IsOptional()
  @IsNumber()
  processingFeePercent?: number;

  @ApiProperty({ description: 'Enable refunds', example: true })
  @IsBoolean()
  enableRefunds: boolean;
}

// Notification Template DTO
export class NotificationTemplateDto {
  @ApiProperty({ description: 'Template ID' })
  @IsString()
  id: string;

  @ApiProperty({ description: 'Template name' })
  @IsString()
  name: string;

  @ApiProperty({ description: 'Template subject', required: false })
  @IsOptional()
  @IsString()
  subject?: string;

  @ApiProperty({ description: 'Template body' })
  @IsString()
  body: string;

  @ApiProperty({ description: 'Notification channel', example: 'email' })
  @IsString()
  channel: string;
}

// Notification Channel Config DTO
export class NotificationChannelConfigDto {
  @ApiProperty({ description: 'Enable email notifications', example: true })
  @IsBoolean()
  email: boolean;

  @ApiProperty({ description: 'Enable SMS notifications', example: true })
  @IsBoolean()
  sms: boolean;

  @ApiProperty({ description: 'Enable push notifications', example: true })
  @IsBoolean()
  push: boolean;

  @ApiProperty({ description: 'Enable in-app notifications', example: true })
  @IsBoolean()
  inApp: boolean;
}

// Notification Settings DTOs
export class NotificationSettingsDto {
  @ApiProperty({ description: 'Notification channels configuration' })
  @ValidateNested()
  @Type(() => NotificationChannelConfigDto)
  channels: NotificationChannelConfigDto;

  @ApiProperty({ description: 'Notification templates', type: [NotificationTemplateDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => NotificationTemplateDto)
  templates: NotificationTemplateDto[];

  @ApiProperty({ description: 'Default sender email', required: false })
  @IsOptional()
  @IsEmail()
  defaultSenderEmail?: string;

  @ApiProperty({ description: 'Default sender name', required: false })
  @IsOptional()
  @IsString()
  defaultSenderName?: string;

  @ApiProperty({ description: 'SMS provider', example: 'twilio', required: false })
  @IsOptional()
  @IsString()
  smsProvider?: string;
}

// Complete System Settings Response DTO
export class SystemSettingsResponseDto {
  @ApiProperty({ description: 'General/Branding settings' })
  @ValidateNested()
  @Type(() => BrandingSettingsDto)
  general: BrandingSettingsDto;

  @ApiProperty({ description: 'Appointment settings' })
  @ValidateNested()
  @Type(() => AppointmentSettingsDto)
  appointments: AppointmentSettingsDto;

  @ApiProperty({ description: 'Payment settings' })
  @ValidateNested()
  @Type(() => PaymentSettingsDto)
  payments: PaymentSettingsDto;

  @ApiProperty({ description: 'Notification settings' })
  @ValidateNested()
  @Type(() => NotificationSettingsDto)
  notifications: NotificationSettingsDto;

  @ApiProperty({ description: 'Last update timestamp' })
  updatedAt: string;

  @ApiProperty({ description: 'Last updated by user ID', required: false })
  updatedBy?: string;
}

// Update Settings Request DTO
export class UpdateSettingsRequestDto {
  @ApiProperty({ description: 'General settings update', required: false })
  @IsOptional()
  @ValidateNested()
  @Type(() => BrandingSettingsDto)
  general?: Partial<BrandingSettingsDto>;

  @ApiProperty({ description: 'Appointment settings update', required: false })
  @IsOptional()
  @ValidateNested()
  @Type(() => AppointmentSettingsDto)
  appointments?: Partial<AppointmentSettingsDto>;

  @ApiProperty({ description: 'Payment settings update', required: false })
  @IsOptional()
  @ValidateNested()
  @Type(() => PaymentSettingsDto)
  payments?: Partial<PaymentSettingsDto>;

  @ApiProperty({ description: 'Notification settings update', required: false })
  @IsOptional()
  @ValidateNested()
  @Type(() => NotificationSettingsDto)
  notifications?: Partial<NotificationSettingsDto>;
}





