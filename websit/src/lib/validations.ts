import { z } from 'zod';

// مخططات التحقق من صحة البيانات

export const contactFormSchema = z.object({
  name: z.string().min(2, 'الاسم يجب أن يكون أكثر من حرفين'),
  email: z.string().email('البريد الإلكتروني غير صحيح'),
  phone: z.string().min(10, 'رقم الهاتف يجب أن يكون 10 أرقام على الأقل'),
  subject: z.string().min(5, 'الموضوع يجب أن يكون أكثر من 5 أحرف'),
  message: z.string().min(10, 'الرسالة يجب أن تكون أكثر من 10 أحرف'),
});

export const appointmentFormSchema = z.object({
  patientName: z.string().min(2, 'اسم المريض مطلوب'),
  patientEmail: z.string().email('البريد الإلكتروني غير صحيح'),
  patientPhone: z.string().min(10, 'رقم الهاتف مطلوب'),
  doctorId: z.string().min(1, 'اختيار الطبيب مطلوب'),
  date: z.string().min(1, 'تاريخ الموعد مطلوب'),
  time: z.string().min(1, 'وقت الموعد مطلوب'),
  reason: z.string().optional(),
});

export const newsletterSchema = z.object({
  email: z.string().email('البريد الإلكتروني غير صحيح'),
});

// أنواع TypeScript المستخرجة من المخططات
export type ContactFormData = z.infer<typeof contactFormSchema>;
export type AppointmentFormData = z.infer<typeof appointmentFormSchema>;
export type NewsletterData = z.infer<typeof newsletterSchema>;
