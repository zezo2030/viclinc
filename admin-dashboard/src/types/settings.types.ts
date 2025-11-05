// Branding Settings
export interface BrandingSettings {
  appName: string
  logoUrl?: string
  primaryColor?: string
  defaultLanguage: string // 'ar', 'en', etc.
  timezone: string // 'Asia/Riyadh', etc.
}

// Appointment Settings
export interface AppointmentSettings {
  defaultDurationMinutes: number
  cancellationWindowHours: number
  allowReschedule: boolean
  reminderOffsets: number[] // [24, 2] => 24 hours then 2 hours
}

// Payment Settings
export interface PaymentSettings {
  defaultCurrency: string // 'SAR', 'USD', 'EUR', etc.
  provider: 'stripe' | 'paypal' | 'tap' | 'manual'
  providerConfig: Record<string, string> // API keys, secret, webhook
  processingFeePercent?: number
  enableRefunds: boolean
}

// Notification Channel Configuration
export interface NotificationChannelConfig {
  email: boolean
  sms: boolean
  push: boolean
  inApp: boolean
}

// Notification Template
export interface NotificationTemplate {
  id: string
  name: string
  subject?: string
  body: string
  channel: 'email' | 'sms' | 'push'
}

// Notification Settings
export interface NotificationSettings {
  channels: NotificationChannelConfig
  templates: NotificationTemplate[]
  defaultSenderEmail?: string
  defaultSenderName?: string
  smsProvider?: 'twilio' | 'vonage' | 'other'
}

// Complete System Settings
export interface SystemSettings {
  general: BrandingSettings
  appointments: AppointmentSettings
  payments: PaymentSettings
  notifications: NotificationSettings
  updatedAt: string
  updatedBy?: string
}

// Partial Update Request
export interface UpdateSettingsRequest {
  general?: Partial<BrandingSettings>
  appointments?: Partial<AppointmentSettings>
  payments?: Partial<PaymentSettings>
  notifications?: Partial<NotificationSettings>
}

// Request Types for Update
export interface UpdateGeneralSettingsRequest {
  appName?: string
  logo?: File
  primaryColor?: string
  defaultLanguage?: string
  timezone?: string
}

export interface UpdateAppointmentSettingsRequest {
  defaultDurationMinutes?: number
  cancellationWindowHours?: number
  allowReschedule?: boolean
  reminderOffsets?: number[]
}

export interface UpdatePaymentSettingsRequest {
  defaultCurrency?: string
  provider?: 'stripe' | 'paypal' | 'tap' | 'manual'
  providerConfig?: Record<string, string>
  processingFeePercent?: number
  enableRefunds?: boolean
}

export interface UpdateNotificationSettingsRequest {
  channels?: Partial<NotificationChannelConfig>
  templates?: NotificationTemplate[]
  defaultSenderEmail?: string
  defaultSenderName?: string
  smsProvider?: 'twilio' | 'vonage' | 'other'
}

