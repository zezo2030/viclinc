import { z } from 'zod'
import { UserRole, UserStatus } from '../types/user.types'

export const createUserSchema = z.object({
  name: z
    .string()
    .min(2, 'الاسم يجب أن يكون على الأقل حرفين')
    .max(100, 'الاسم يجب أن لا يتجاوز 100 حرف'),
  email: z.string().email('البريد الإلكتروني غير صحيح'),
  phone: z
    .string()
    .regex(/^[0-9+\-\s()]+$/, 'رقم الهاتف غير صحيح')
    .min(10, 'رقم الهاتف يجب أن يكون على الأقل 10 أرقام'),
  password: z
    .string()
    .min(8, 'كلمة المرور يجب أن تكون على الأقل 8 أحرف'),
  role: z.nativeEnum(UserRole, {
    errorMap: () => ({ message: 'الدور غير صحيح' }),
  }),
})

export const updateUserSchema = z.object({
  name: z
    .string()
    .min(2, 'الاسم يجب أن يكون على الأقل حرفين')
    .max(100, 'الاسم يجب أن لا يتجاوز 100 حرف')
    .optional(),
  email: z.string().email('البريد الإلكتروني غير صحيح').optional(),
  phone: z
    .string()
    .regex(/^[0-9+\-\s()]+$/, 'رقم الهاتف غير صحيح')
    .min(10, 'رقم الهاتف يجب أن يكون على الأقل 10 أرقام')
    .optional(),
  role: z
    .nativeEnum(UserRole, {
      errorMap: () => ({ message: 'الدور غير صحيح' }),
    })
    .optional(),
  status: z
    .nativeEnum(UserStatus, {
      errorMap: () => ({ message: 'الحالة غير صحيحة' }),
    })
    .optional(),
})

export type CreateUserFormData = z.infer<typeof createUserSchema>
export type UpdateUserFormData = z.infer<typeof updateUserSchema>

