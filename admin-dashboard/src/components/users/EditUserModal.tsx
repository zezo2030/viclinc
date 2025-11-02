import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { X } from 'lucide-react'
import toast from 'react-hot-toast'
import { updateUserSchema, type UpdateUserFormData } from '../../validations/user.validation'
import type { EditUserModalProps } from '../../types/user.types'
import { UserRole, UserStatus } from '../../types/user.types'
import { Spinner } from '../common/Spinner'
import { useEffect } from 'react'

const roleLabels = {
  [UserRole.ADMIN]: 'مدير',
  [UserRole.DOCTOR]: 'طبيب',
  [UserRole.PATIENT]: 'مريض',
}

const statusLabels = {
  [UserStatus.ACTIVE]: 'نشط',
  [UserStatus.DISABLED]: 'معطل',
  [UserStatus.PENDING_DELETE]: 'قيد الحذف',
}

export default function EditUserModal({ isOpen, onClose, user, onSubmit }: EditUserModalProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<UpdateUserFormData>({
    resolver: zodResolver(updateUserSchema),
    defaultValues: {
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      status: user.status,
    },
  })

  useEffect(() => {
    if (isOpen && user) {
      reset({
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        status: user.status,
      })
    }
  }, [isOpen, user, reset])

  const onFormSubmit = async (data: UpdateUserFormData) => {
    try {
      await onSubmit(data)
      onClose()
      toast.success('تم تحديث المستخدم بنجاح')
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'فشل تحديث المستخدم')
    }
  }

  const handleClose = () => {
    reset()
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        {/* Background overlay */}
        <div
          className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75"
          onClick={handleClose}
        />

        {/* Modal panel */}
        <div className="inline-block align-bottom bg-white rounded-lg text-right overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">تعديل المستخدم</h3>
            <button
              onClick={handleClose}
              className="text-gray-400 hover:text-gray-500 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit(onFormSubmit)} className="px-6 py-4">
            <div className="space-y-4">
              {/* Name */}
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                  الاسم
                </label>
                <input
                  id="name"
                  type="text"
                  {...register('name')}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="اسم المستخدم"
                />
                {errors.name && (
                  <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
                )}
              </div>

              {/* Email */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  البريد الإلكتروني
                </label>
                <input
                  id="email"
                  type="email"
                  {...register('email')}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="example@email.com"
                />
                {errors.email && (
                  <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
                )}
              </div>

              {/* Phone */}
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                  رقم الهاتف
                </label>
                <input
                  id="phone"
                  type="tel"
                  {...register('phone')}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="05xxxxxxxx"
                />
                {errors.phone && (
                  <p className="mt-1 text-sm text-red-600">{errors.phone.message}</p>
                )}
              </div>

              {/* Role */}
              <div>
                <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-2">
                  الدور
                </label>
                <select
                  id="role"
                  {...register('role')}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="">اختر الدور</option>
                  <option value={UserRole.ADMIN}>{roleLabels[UserRole.ADMIN]}</option>
                  <option value={UserRole.DOCTOR}>{roleLabels[UserRole.DOCTOR]}</option>
                  <option value={UserRole.PATIENT}>{roleLabels[UserRole.PATIENT]}</option>
                </select>
                {errors.role && (
                  <p className="mt-1 text-sm text-red-600">{errors.role.message}</p>
                )}
              </div>

              {/* Status */}
              <div>
                <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-2">
                  الحالة
                </label>
                <select
                  id="status"
                  {...register('status')}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="">اختر الحالة</option>
                  <option value={UserStatus.ACTIVE}>{statusLabels[UserStatus.ACTIVE]}</option>
                  <option value={UserStatus.DISABLED}>{statusLabels[UserStatus.DISABLED]}</option>
                  <option value={UserStatus.PENDING_DELETE}>
                    {statusLabels[UserStatus.PENDING_DELETE]}
                  </option>
                </select>
                {errors.status && (
                  <p className="mt-1 text-sm text-red-600">{errors.status.message}</p>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3 mt-6">
              <button
                type="button"
                onClick={handleClose}
                className="flex-1 px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                disabled={isSubmitting}
              >
                إلغاء
              </button>
              <button
                type="submit"
                className="flex-1 px-4 py-2 text-white bg-primary-600 rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Spinner size="sm" />
                    <span>جاري التحديث...</span>
                  </>
                ) : (
                  'تحديث'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

