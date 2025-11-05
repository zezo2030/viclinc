import { z } from 'zod'

// Branding Settings Schema
export const generalSettingsSchema = z.object({
  appName: z
    .string()
    .min(2, 'اسم التطبيق يجب أن يكون على الأقل حرفين')
    .max(50, 'اسم التطبيق يجب أن لا يتجاوز 50 حرف'),
  logoUrl: z.string().optional(),
  primaryColor: z.string().regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, 'اللون يجب أن يكون بصيغة hex').optional(),
  defaultLanguage: z.enum(['ar', 'en', 'fr', 'es'], {
    errorMap: () => ({ message: 'اللغة غير مدعومة' }),
  }),
  timezone: z.string().min(1, 'المنطقة الزمنية مطلوبة'),
})

// Appointment Settings Schema
export const appointmentSettingsSchema = z.object({
  defaultDurationMinutes: z
    .number()
    .min(15, 'المدة الدنيا 15 دقيقة')
    .max(240, 'المدة القصوى 240 دقيقة'),
  cancellationWindowHours: z
    .number()
    .min(0, 'نافذة الإلغاء لا يمكن أن تكون سالبة')
    .max(168, 'نافذة الإلغاء القصوى هي 168 ساعة (أسبوع)'),
  allowReschedule: z.boolean(),
  reminderOffsets: z
    .array(z.number().positive('أوقات التذكير يجب أن تكون أرقاماً موجبة'))
    .max(5, 'أقصى عدد من أوقات التذكير هو 5')
    .refine(
      (arr) => {
        // التحقق من أن الأرقام مرتبة تصاعدياً
        const sorted = [...arr].sort((a, b) => a - b)
        return JSON.stringify(arr) === JSON.stringify(sorted)
      },
      { message: 'أوقات التذكير يجب أن تكون مرتبة تصاعدياً' }
    ),
})

// Payment Settings Schema
export const paymentSettingsSchema = z.object({
  defaultCurrency: z.enum(['SAR', 'USD', 'EUR', 'GBP', 'AED'], {
    errorMap: () => ({ message: 'العملة غير مدعومة' }),
  }),
  provider: z.enum(['stripe', 'paypal', 'tap', 'manual'], {
    errorMap: () => ({ message: 'مزود الدفع غير مدعوم' }),
  }),
  providerConfig: z.record(z.string()),
  processingFeePercent: z
    .number()
    .min(0, 'نسبة الرسوم لا يمكن أن تكون سالبة')
    .max(100, 'نسبة الرسوم لا يمكن أن تتجاوز 100%')
    .optional(),
  enableRefunds: z.boolean(),
}).refine(
  (data) => {
    // إذا كان المزود ليس manual، يجب أن تحتوي providerConfig على مفاتيح
    if (data.provider !== 'manual') {
      return Object.keys(data.providerConfig).length > 0
    }
    return true
  },
  { message: 'يجب إضافة مفاتيح API للمزود المختار', path: ['providerConfig'] }
)

// Notification Template Schema
export const notificationTemplateSchema = z.object({
  id: z.string(),
  name: z
    .string()
    .min(2, 'اسم القالب يجب أن يكون على الأقل حرفين')
    .max(50, 'اسم القالب يجب أن لا يتجاوز 50 حرف'),
  subject: z.string().optional(),
  body: z
    .string()
    .min(10, 'محتوى القالب يجب أن يكون على الأقل 10 أحرف')
    .max(5000, 'محتوى القالب يجب أن لا يتجاوز 5000 حرف'),
  channel: z.enum(['email', 'sms', 'push'], {
    errorMap: () => ({ message: 'قناة الإشعار غير مدعومة' }),
  }),
}).refine(
  (data) => {
    // موضوع البريد مطلوب فقط للإشعارات عبر البريد
    if (data.channel === 'email') {
      return data.subject && data.subject.trim().length > 0
    }
    return true
  },
  { message: 'موضوع البريد مطلوب للإشعارات عبر البريد', path: ['subject'] }
)

// Notification Settings Schema
export const notificationSettingsSchema = z.object({
  channels: z.object({
    email: z.boolean(),
    sms: z.boolean(),
    push: z.boolean(),
    inApp: z.boolean(),
  }),
  templates: z.array(notificationTemplateSchema).max(20, 'أقصى عدد من القوالب هو 20'),
  defaultSenderEmail: z.string().email('البريد الإلكتروني غير صحيح').optional(),
  defaultSenderName: z.string().optional(),
  smsProvider: z.enum(['twilio', 'vonage', 'other']).optional(),
}).refine(
  (data) => {
    // إذا كانت قناة البريد مفعلة، يجب إضافة بريد المرسل
    if (data.channels.email) {
      return data.defaultSenderEmail && data.defaultSenderEmail.trim().length > 0
    }
    return true
  },
  { message: 'البريد الافتراضي للمرسل مطلوب عند تفعيل قناة البريد', path: ['defaultSenderEmail'] }
)

// Complete System Settings Schema
export const systemSettingsSchema = z.object({
  general: generalSettingsSchema,
  appointments: appointmentSettingsSchema,
  payments: paymentSettingsSchema,
  notifications: notificationSettingsSchema,
  updatedAt: z.string(),
  updatedBy: z.string().optional(),
})

// Update Schemas (partial)
export const updateGeneralSettingsSchema = generalSettingsSchema.partial()

export const updateAppointmentSettingsSchema = appointmentSettingsSchema.partial()

export const updatePaymentSettingsSchema = paymentSettingsSchema.partial()

export const updateNotificationSettingsSchema = notificationSettingsSchema.partial()

export const updateSettingsSchema = z.object({
  general: updateGeneralSettingsSchema.optional(),
  appointments: updateAppointmentSettingsSchema.optional(),
  payments: updatePaymentSettingsSchema.optional(),
  notifications: updateNotificationSettingsSchema.optional(),
})

// Type exports
export type GeneralSettingsFormData = z.infer<typeof generalSettingsSchema>
export type AppointmentSettingsFormData = z.infer<typeof appointmentSettingsSchema>
export type PaymentSettingsFormData = z.infer<typeof paymentSettingsSchema>
export type NotificationTemplateFormData = z.infer<typeof notificationTemplateSchema>
export type NotificationSettingsFormData = z.infer<typeof notificationSettingsSchema>
export type SystemSettingsFormData = z.infer<typeof systemSettingsSchema>
export type UpdateSettingsFormData = z.infer<typeof updateSettingsSchema>

