import { z } from 'zod'

// Vital Signs Validation
export const vitalSignsSchema = z.object({
  bloodPressure: z.string().regex(/^\d{2,3}\/\d{2,3}$/, 'يجب أن يكون ضغط الدم بصيغة XXX/XX').optional(),
  temperature: z.number().min(30, 'درجة الحرارة يجب أن تكون على الأقل 30').max(45, 'درجة الحرارة يجب أن لا تتجاوز 45').optional(),
  heartRate: z.number().min(30, 'معدل النبض يجب أن يكون على الأقل 30').max(220, 'معدل النبض يجب أن لا يتجاوز 220').optional(),
  weight: z.number().min(1, 'الوزن يجب أن يكون على الأقل 1').max(300, 'الوزن يجب أن لا يتجاوز 300 كجم').optional(),
  height: z.number().min(50, 'الطول يجب أن يكون على الأقل 50').max(250, 'الطول يجب أن لا يتجاوز 250 سم').optional(),
})

// Prescription Item Validation
export const prescriptionItemSchema = z.object({
  medication: z.string().min(2, 'اسم الدواء يجب أن يكون على الأقل حرفين').max(100, 'اسم الدواء يجب أن لا يتجاوز 100 حرف'),
  dosage: z.string().min(1, 'الجرعة مطلوبة').max(100, 'الجرعة يجب أن لا تتجاوز 100 حرف'),
  duration: z.string().min(1, 'المدة مطلوبة').max(100, 'المدة يجب أن لا تتجاوز 100 حرف'),
  instructions: z.string().max(500, 'التعليمات يجب أن لا تتجاوز 500 حرف').optional(),
})

// Attachment Validation
export const attachmentSchema = z.object({
  type: z.string().min(1, 'نوع الملف مطلوب'),
  url: z.string().url('يجب أن يكون رابط صالح'),
  name: z.string().min(1, 'اسم الملف مطلوب'),
  size: z.number().min(0, 'الحجم يجب أن يكون عدد موجب').optional(),
})

// Create Medical Record Schema
export const createMedicalRecordSchema = z.object({
  patientId: z.string().min(1, 'معرف المريض مطلوب'),
  appointmentId: z.string().optional(),
  diagnosis: z.string().min(2, 'التشخيص يجب أن يكون على الأقل حرفين').max(1000, 'التشخيص يجب أن لا يتجاوز 1000 حرف'),
  prescription: z.array(prescriptionItemSchema).optional(),
  notes: z.string().max(2000, 'الملاحظات يجب أن لا تتجاوز 2000 حرف').optional(),
  attachments: z.array(attachmentSchema).optional(),
  vitalSigns: vitalSignsSchema.optional(),
})

// Update Medical Record Schema
export const updateMedicalRecordSchema = z.object({
  diagnosis: z.string().min(2, 'التشخيص يجب أن يكون على الأقل حرفين').max(1000, 'التشخيص يجب أن لا يتجاوز 1000 حرف').optional(),
  prescription: z.array(prescriptionItemSchema).optional(),
  notes: z.string().max(2000, 'الملاحظات يجب أن لا تتجاوز 2000 حرف').optional(),
  attachments: z.array(attachmentSchema).optional(),
  vitalSigns: vitalSignsSchema.optional(),
})

export type CreateMedicalRecordFormData = z.infer<typeof createMedicalRecordSchema>
export type UpdateMedicalRecordFormData = z.infer<typeof updateMedicalRecordSchema>
export type VitalSignsFormData = z.infer<typeof vitalSignsSchema>
export type PrescriptionItemFormData = z.infer<typeof prescriptionItemSchema>

