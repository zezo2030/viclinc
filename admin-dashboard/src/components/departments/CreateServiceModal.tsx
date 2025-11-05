import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import toast from 'react-hot-toast'
import { servicesApi } from '@/api/services'
import type { CreateServiceRequest } from '@/types/service.types'

const schema = z.object({
  name: z.string().min(2, 'الاسم مطلوب (حد أدنى حرفين)'),
  description: z.string().max(1000).optional().or(z.literal('')),
  defaultPrice: z.number().min(0, 'السعر يجب أن يكون أكبر من أو يساوي 0').optional().or(z.nan()),
  defaultDurationMin: z.number().min(1, 'المدة يجب أن تكون على الأقل دقيقة واحدة').optional().or(z.nan()),
  isActive: z.boolean().optional(),
})

interface CreateServiceModalProps {
  isOpen: boolean
  onClose: () => void
  departmentId: string
  onSubmit: () => Promise<void> | void
}

export default function CreateServiceModal({
  isOpen,
  onClose,
  departmentId,
  onSubmit,
}: CreateServiceModalProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<CreateServiceRequest>({
    resolver: zodResolver(schema as any),
    defaultValues: {
      name: '',
      description: '',
      defaultPrice: undefined,
      defaultDurationMin: undefined,
      isActive: true,
    },
  })

  if (!isOpen) return null

  const submit = async (values: CreateServiceRequest) => {
    try {
      await servicesApi.create({
        ...values,
        departmentId,
        defaultPrice: values.defaultPrice || undefined,
        defaultDurationMin: values.defaultDurationMin || undefined,
      })
      toast.success('تم إنشاء الخدمة بنجاح')
      reset()
      await onSubmit()
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'فشل إنشاء الخدمة')
      throw error
    }
  }

  const handleClose = () => {
    reset()
    onClose()
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-gradient-to-br from-black/60 to-black/40 backdrop-blur-sm p-4">
      <div className="w-full max-w-2xl bg-gradient-to-br from-white to-gray-50 rounded-3xl shadow-2xl border border-gray-200 overflow-hidden">
        {/* Header with Gradient */}
        <div className="relative px-8 py-6 bg-gradient-to-r from-blue-500 via-purple-600 to-pink-500 flex items-center justify-between overflow-hidden">
          <div className="relative z-10 flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-lg">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </div>
            <h3 className="text-2xl font-black text-white drop-shadow-lg">إضافة خدمة جديدة</h3>
          </div>
          <button 
            onClick={handleClose} 
            className="relative z-10 w-10 h-10 flex items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white shadow-lg"
          >
            <span className="text-2xl font-bold">×</span>
          </button>
          {/* Decorative Elements */}
          <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -translate-y-20 translate-x-20 blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-40 h-40 bg-white/10 rounded-full translate-y-20 -translate-x-20 blur-3xl"></div>
        </div>

        <form onSubmit={handleSubmit(submit)} className="p-8 space-y-6 bg-gradient-to-br from-white to-purple-50/30">
          {/* Service Name */}
          <div>
            <label className="block text-sm font-bold text-gray-900 mb-2 flex items-center gap-2">
              <span className="text-purple-600">📝</span>
              <span>اسم الخدمة</span>
              <span className="text-red-500 text-lg">*</span>
            </label>
            <input
              className={`w-full border-2 rounded-xl px-4 py-3 transition-all duration-300 bg-white/70 backdrop-blur-sm focus:border-purple-500 focus:ring-2 focus:ring-purple-200 hover:border-gray-300 ${
                errors.name ? 'border-red-300 focus:border-red-500 focus:ring-red-200' : 'border-gray-200'
              }`}
              {...register('name')}
              placeholder="مثال: استشارة عامة"
            />
            {errors.name && (
              <p className="text-red-600 text-sm mt-2 flex items-center gap-1">
                <span>⚠️</span>
                <span>{errors.name.message as string}</span>
              </p>
            )}
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-bold text-gray-900 mb-2 flex items-center gap-2">
              <span className="text-purple-600">📄</span>
              <span>الوصف (اختياري)</span>
            </label>
            <textarea
              rows={4}
              className={`w-full border-2 rounded-xl px-4 py-3 transition-all duration-300 bg-white/70 backdrop-blur-sm focus:border-purple-500 focus:ring-2 focus:ring-purple-200 hover:border-gray-300 resize-none ${
                errors.description ? 'border-red-300 focus:border-red-500 focus:ring-red-200' : 'border-gray-200'
              }`}
              {...register('description')}
              placeholder="وصف الخدمة..."
            />
            {errors.description && (
              <p className="text-red-600 text-sm mt-2 flex items-center gap-1">
                <span>⚠️</span>
                <span>{errors.description.message as string}</span>
              </p>
            )}
          </div>

          {/* Price and Duration Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-gray-900 mb-2 flex items-center gap-2">
                <span className="text-green-600">💵</span>
                <span>السعر الافتراضي (ر.س)</span>
              </label>
              <div className="relative">
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  className={`w-full border-2 rounded-xl px-4 py-3 pr-12 transition-all duration-300 bg-white/70 backdrop-blur-sm focus:border-purple-500 focus:ring-2 focus:ring-purple-200 hover:border-gray-300 ${
                    errors.defaultPrice ? 'border-red-300 focus:border-red-500 focus:ring-red-200' : 'border-gray-200'
                  }`}
                  {...register('defaultPrice', { valueAsNumber: true })}
                  placeholder="0.00"
                />
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-medium">ر.س</span>
              </div>
              {errors.defaultPrice && (
                <p className="text-red-600 text-sm mt-2 flex items-center gap-1">
                  <span>⚠️</span>
                  <span>{errors.defaultPrice.message as string}</span>
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-900 mb-2 flex items-center gap-2">
                <span className="text-blue-600">⏱️</span>
                <span>المدة الافتراضية (دقيقة)</span>
              </label>
              <div className="relative">
                <input
                  type="number"
                  step="1"
                  min="1"
                  max="480"
                  className={`w-full border-2 rounded-xl px-4 py-3 pr-12 transition-all duration-300 bg-white/70 backdrop-blur-sm focus:border-purple-500 focus:ring-2 focus:ring-purple-200 hover:border-gray-300 ${
                    errors.defaultDurationMin ? 'border-red-300 focus:border-red-500 focus:ring-red-200' : 'border-gray-200'
                  }`}
                  {...register('defaultDurationMin', { valueAsNumber: true })}
                  placeholder="30"
                />
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-medium">دقيقة</span>
              </div>
              {errors.defaultDurationMin && (
                <p className="text-red-600 text-sm mt-2 flex items-center gap-1">
                  <span>⚠️</span>
                  <span>{errors.defaultDurationMin.message as string}</span>
                </p>
              )}
            </div>
          </div>

          {/* Active Status */}
          <div className="flex items-center justify-between p-4 rounded-xl bg-gradient-to-r from-white to-purple-50 border border-purple-200">
            <label htmlFor="isActive" className="flex items-center gap-3 cursor-pointer">
              <span className="text-lg">✅</span>
              <span className="text-sm font-bold text-gray-900">تفعيل الخدمة</span>
            </label>
            <label className="relative inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                id="isActive" 
                defaultChecked
                className="sr-only peer"
                {...register('isActive')} 
              />
              <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gradient-to-r peer-checked:from-purple-500 peer-checked:to-pink-500"></div>
            </label>
          </div>

          {/* Action Buttons */}
          <div className="pt-4 flex items-center justify-end gap-3">
            <button 
              type="button" 
              onClick={handleClose} 
              className="px-6 py-3 rounded-xl border-2 border-gray-300 text-gray-700 font-semibold hover:bg-gray-50 hover:border-gray-400 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              إلغاء
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-8 py-3 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold shadow-lg shadow-purple-500/30 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>جاري الحفظ...</span>
                </>
              ) : (
                <>
                  <span>✨</span>
                  <span>إضافة الخدمة</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

