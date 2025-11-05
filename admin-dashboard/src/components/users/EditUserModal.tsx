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
  console.log('EditUserModal render:', { isOpen, user: user?.name })

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<UpdateUserFormData>({
    resolver: zodResolver(updateUserSchema),
    defaultValues: {
      name: user?.name || '',
      email: user?.email || '',
      phone: user?.phone || '',
      role: user?.role || UserRole.PATIENT,
      status: user?.status || UserStatus.ACTIVE,
    },
  })

  useEffect(() => {
    if (isOpen && user) {
      console.log('Resetting form with user data:', user)
      reset({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        role: user.role || UserRole.PATIENT,
        status: user.status || UserStatus.ACTIVE,
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

  if (!isOpen || !user) {
    console.log('EditUserModal: not rendering because isOpen:', isOpen, 'user:', !!user)
    return null
  }

  console.log('EditUserModal: rendering modal')

  return (
    <div 
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999] p-4" 
      dir="rtl"
      onClick={handleClose}
      style={{ 
        position: 'fixed', 
        zIndex: 9999, 
        top: 0, 
        left: 0, 
        right: 0, 
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem'
      }}
    >
      <div 
        className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
        style={{ 
          backgroundColor: 'white',
          borderRadius: '0.5rem',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
          maxWidth: '42rem',
          width: '100%',
          maxHeight: '90vh',
          overflowY: 'auto'
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-primary-50">
          <h3 className="text-xl font-bold text-gray-900">تعديل المستخدم</h3>
          <button
            onClick={handleClose}
            className="p-1 hover:bg-primary-100 rounded-lg transition-colors"
            type="button"
            disabled={isSubmitting}
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {/* Form Content */}
        <form onSubmit={handleSubmit(onFormSubmit)}>
          <div className="p-6 space-y-5">
            {/* Name Field */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                الاسم الكامل <span className="text-red-500">*</span>
              </label>
              <input
                id="name"
                type="text"
                {...register('name')}
                className={`w-full px-4 py-2.5 border rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all ${
                  errors.name ? 'border-red-300 bg-red-50' : 'border-gray-300 bg-white'
                }`}
                placeholder="أدخل الاسم الكامل"
              />
              {errors.name && (
                <p className="mt-1.5 text-sm text-red-600">{errors.name.message}</p>
              )}
            </div>

            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                البريد الإلكتروني <span className="text-red-500">*</span>
              </label>
              <input
                id="email"
                type="email"
                {...register('email')}
                className={`w-full px-4 py-2.5 border rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all ${
                  errors.email ? 'border-red-300 bg-red-50' : 'border-gray-300 bg-white'
                }`}
                placeholder="example@email.com"
              />
              {errors.email && (
                <p className="mt-1.5 text-sm text-red-600">{errors.email.message}</p>
              )}
            </div>

            {/* Phone Field */}
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                رقم الهاتف <span className="text-red-500">*</span>
              </label>
              <input
                id="phone"
                type="tel"
                {...register('phone')}
                className={`w-full px-4 py-2.5 border rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all ${
                  errors.phone ? 'border-red-300 bg-red-50' : 'border-gray-300 bg-white'
                }`}
                placeholder="05xxxxxxxx"
              />
              {errors.phone && (
                <p className="mt-1.5 text-sm text-red-600">{errors.phone.message}</p>
              )}
            </div>

            {/* Role Field */}
            <div>
              <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-2">
                الدور <span className="text-red-500">*</span>
              </label>
              <select
                id="role"
                {...register('role')}
                className={`w-full px-4 py-2.5 border rounded-lg text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all appearance-none ${
                  errors.role ? 'border-red-300 bg-red-50' : 'border-gray-300'
                }`}
              >
                <option value="">اختر الدور</option>
                <option value={UserRole.ADMIN}>{roleLabels[UserRole.ADMIN]}</option>
                <option value={UserRole.DOCTOR}>{roleLabels[UserRole.DOCTOR]}</option>
                <option value={UserRole.PATIENT}>{roleLabels[UserRole.PATIENT]}</option>
              </select>
              {errors.role && (
                <p className="mt-1.5 text-sm text-red-600">{errors.role.message}</p>
              )}
            </div>

            {/* Status Field */}
            <div>
              <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-2">
                الحالة <span className="text-red-500">*</span>
              </label>
              <select
                id="status"
                {...register('status')}
                className={`w-full px-4 py-2.5 border rounded-lg text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all appearance-none ${
                  errors.status ? 'border-red-300 bg-red-50' : 'border-gray-300'
                }`}
              >
                <option value="">اختر الحالة</option>
                <option value={UserStatus.ACTIVE}>{statusLabels[UserStatus.ACTIVE]}</option>
                <option value={UserStatus.DISABLED}>{statusLabels[UserStatus.DISABLED]}</option>
                <option value={UserStatus.PENDING_DELETE}>
                  {statusLabels[UserStatus.PENDING_DELETE]}
                </option>
              </select>
              {errors.status && (
                <p className="mt-1.5 text-sm text-red-600">{errors.status.message}</p>
              )}
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex gap-3 p-6 bg-gray-50 border-t border-gray-200">
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 bg-white rounded-lg hover:bg-gray-100 transition-colors font-medium"
              disabled={isSubmitting}
            >
              إلغاء
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2.5 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium flex items-center justify-center gap-2"
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
  )
}

