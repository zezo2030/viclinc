import { z } from 'zod'

// Validation schemas for reports

export const dailyReportSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'التاريخ يجب أن يكون بصيغة YYYY-MM-DD'),
})

export const weeklyReportSchema = z.object({
  weekStart: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'تاريخ بداية الأسبوع يجب أن يكون بصيغة YYYY-MM-DD'),
})

export const monthlyReportSchema = z.object({
  month: z.string().regex(/^\d{4}-\d{2}$/, 'الشهر يجب أن يكون بصيغة YYYY-MM'),
})

export const doctorsPerformanceParamsSchema = z.object({
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'تاريخ البداية يجب أن يكون بصيغة YYYY-MM-DD').optional(),
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'تاريخ النهاية يجب أن يكون بصيغة YYYY-MM-DD').optional(),
  departmentId: z.string().optional(),
  limit: z.number().int().min(1).max(100).optional(),
}).refine(
  (data) => {
    if (!data.startDate || !data.endDate) return true
    return new Date(data.startDate) <= new Date(data.endDate)
  },
  {
    message: 'تاريخ البداية يجب أن يكون قبل أو يساوي تاريخ النهاية',
    path: ['endDate'],
  }
)

export const customReportParamsSchema = z.object({
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'تاريخ البداية يجب أن يكون بصيغة YYYY-MM-DD'),
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'تاريخ النهاية يجب أن يكون بصيغة YYYY-MM-DD'),
  departmentIds: z.array(z.string()).optional(),
  doctorIds: z.array(z.string()).optional(),
  appointmentTypes: z.array(z.string()).optional(),
  paymentStatuses: z.array(z.string()).optional(),
  serviceTypes: z.array(z.string()).optional(),
  fields: z.array(z.string()).optional(),
}).refine(
  (data) => new Date(data.startDate) <= new Date(data.endDate),
  {
    message: 'تاريخ البداية يجب أن يكون قبل أو يساوي تاريخ النهاية',
    path: ['endDate'],
  }
).refine(
  (data) => {
    const start = new Date(data.startDate)
    const end = new Date(data.endDate)
    const diffTime = Math.abs(end.getTime() - start.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays <= 365
  },
  {
    message: 'نطاق التاريخ لا يمكن أن يتجاوز 365 يوم',
    path: ['endDate'],
  }
)

export type DailyReportInput = z.infer<typeof dailyReportSchema>
export type WeeklyReportInput = z.infer<typeof weeklyReportSchema>
export type MonthlyReportInput = z.infer<typeof monthlyReportSchema>
export type DoctorsPerformanceParamsInput = z.infer<typeof doctorsPerformanceParamsSchema>
export type CustomReportParamsInput = z.infer<typeof customReportParamsSchema>








