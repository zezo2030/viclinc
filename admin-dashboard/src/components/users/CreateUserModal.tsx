import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { X, Eye, EyeOff, UserPlus } from 'lucide-react'
import toast from 'react-hot-toast'
import { createUserSchema, type CreateUserFormData } from '../../validations/user.validation'
import type { CreateUserModalProps } from '../../types/user.types'
import { UserRole } from '../../types/user.types'
import { Spinner } from '../common/Spinner'

const roleLabels = {
  [UserRole.ADMIN]: 'مدير',
  [UserRole.DOCTOR]: 'طبيب',
  [UserRole.PATIENT]: 'مريض',
}

export default function CreateUserModal({ isOpen, onClose, onSubmit }: CreateUserModalProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<CreateUserFormData>({
    resolver: zodResolver(createUserSchema),
  })

  const [showPassword, setShowPassword] = useState(false)

  const onFormSubmit = async (data: CreateUserFormData) => {
    try {
      await onSubmit(data)
      reset()
      setShowPassword(false)
      onClose()
      toast.success('تم إضافة المستخدم بنجاح')
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'فشل إضافة المستخدم')
    }
  }

  const handleClose = () => {
    reset()
    setShowPassword(false)
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4" dir="rtl">
      <div className="bg-white rounded-xl shadow-sm max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-[#e2e8f0]">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-[#e2e8f0] bg-[#f8fafc]">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[#6366f1]/10 rounded-lg">
              <UserPlus className="w-6 h-6 text-[#6366f1]" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-[#0f172a]">إضافة مستخدم جديد</h2>
              <p className="text-sm text-[#64748b] mt-1">املأ البيانات أدناه لإضافة مستخدم جديد</p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-1 hover:bg-[#6366f1]/10 rounded-lg transition-colors duration-150 ease-out"
            type="button"
            disabled={isSubmitting}
          >
            <X className="w-5 h-5 text-[#64748b]" />
          </button>
        </div>

        {/* Form Content */}
        <form onSubmit={handleSubmit(onFormSubmit)}>
          <div className="p-6 space-y-5">
            {/* Name Field */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-[#0f172a] mb-2">
                الاسم الكامل <span className="text-[#ef4444]">*</span>
              </label>
              <input
                id="name"
                type="text"
                {...register('name')}
                className={`w-full px-4 py-2.5 border rounded-lg text-[#0f172a] placeholder-[#64748b] focus:outline-none focus:ring-2 focus:ring-[#6366f1] focus:border-transparent transition-all duration-150 ease-out ${
                  errors.name ? 'border-[#ef4444] bg-[#ef4444]/5' : 'border-[#e2e8f0] bg-white'
                }`}
                placeholder="أدخل الاسم الكامل"
              />
              {errors.name && (
                <p className="mt-1.5 text-sm text-[#ef4444]">{errors.name.message}</p>
              )}
            </div>

            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-[#0f172a] mb-2">
                البريد الإلكتروني <span className="text-[#ef4444]">*</span>
              </label>
              <input
                id="email"
                type="email"
                {...register('email')}
                className={`w-full px-4 py-2.5 border rounded-lg text-[#0f172a] placeholder-[#64748b] focus:outline-none focus:ring-2 focus:ring-[#6366f1] focus:border-transparent transition-all duration-150 ease-out ${
                  errors.email ? 'border-[#ef4444] bg-[#ef4444]/5' : 'border-[#e2e8f0] bg-white'
                }`}
                placeholder="example@email.com"
              />
              {errors.email && (
                <p className="mt-1.5 text-sm text-[#ef4444]">{errors.email.message}</p>
              )}
            </div>

            {/* Phone Field */}
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-[#0f172a] mb-2">
                رقم الهاتف <span className="text-[#ef4444]">*</span>
              </label>
              <input
                id="phone"
                type="tel"
                {...register('phone')}
                className={`w-full px-4 py-2.5 border rounded-lg text-[#0f172a] placeholder-[#64748b] focus:outline-none focus:ring-2 focus:ring-[#6366f1] focus:border-transparent transition-all duration-150 ease-out ${
                  errors.phone ? 'border-[#ef4444] bg-[#ef4444]/5' : 'border-[#e2e8f0] bg-white'
                }`}
                placeholder="05xxxxxxxx"
              />
              {errors.phone && (
                <p className="mt-1.5 text-sm text-[#ef4444]">{errors.phone.message}</p>
              )}
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-[#0f172a] mb-2">
                كلمة المرور <span className="text-[#ef4444]">*</span>
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  {...register('password')}
                  className={`w-full px-4 py-2.5 pr-10 border rounded-lg text-[#0f172a] placeholder-[#64748b] focus:outline-none focus:ring-2 focus:ring-[#6366f1] focus:border-transparent transition-all duration-150 ease-out ${
                    errors.password ? 'border-[#ef4444] bg-[#ef4444]/5' : 'border-[#e2e8f0] bg-white'
                  }`}
                  placeholder="أدخل كلمة المرور (8 أحرف على الأقل)"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#64748b] hover:text-[#0f172a] transition-colors duration-150 p-1"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1.5 text-sm text-[#ef4444]">{errors.password.message}</p>
              )}
            </div>

            {/* Role Field */}
            <div>
              <label htmlFor="role" className="block text-sm font-medium text-[#0f172a] mb-2">
                الدور <span className="text-[#ef4444]">*</span>
              </label>
              <select
                id="role"
                {...register('role')}
                className={`w-full px-4 py-2.5 border rounded-lg text-[#0f172a] bg-white focus:outline-none focus:ring-2 focus:ring-[#6366f1] focus:border-transparent transition-all duration-150 ease-out appearance-none ${
                  errors.role ? 'border-[#ef4444] bg-[#ef4444]/5' : 'border-[#e2e8f0]'
                }`}
              >
                <option value="">اختر الدور</option>
                <option value={UserRole.ADMIN}>{roleLabels[UserRole.ADMIN]}</option>
                <option value={UserRole.DOCTOR}>{roleLabels[UserRole.DOCTOR]}</option>
                <option value={UserRole.PATIENT}>{roleLabels[UserRole.PATIENT]}</option>
              </select>
              {errors.role && (
                <p className="mt-1.5 text-sm text-[#ef4444]">{errors.role.message}</p>
              )}
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex gap-3 p-6 bg-[#f8fafc] border-t border-[#e2e8f0]">
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 px-4 py-2.5 border border-[#e2e8f0] text-[#64748b] bg-white rounded-lg hover:bg-[#f8fafc] transition-colors duration-150 ease-out font-medium"
              disabled={isSubmitting}
            >
              إلغاء
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2.5 bg-[#6366f1] text-white rounded-lg hover:bg-[#4f46e5] disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-150 ease-out font-medium flex items-center justify-center gap-2 shadow-sm"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Spinner size="sm" />
                  <span>جاري الإضافة...</span>
                </>
              ) : (
                <>
                  <UserPlus className="w-5 h-5" />
                  <span>إضافة المستخدم</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
