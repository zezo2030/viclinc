import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { X } from 'lucide-react'
import toast from 'react-hot-toast'
import { servicesApi } from '@/api/services'
import type { UpdateServiceRequest, Service } from '@/types/service.types'

const schema = z.object({
  name: z.string().min(2, 'الاسم مطلوب (حد أدنى حرفين)').optional(),
  description: z.string().max(1000).optional().or(z.literal('')),
  defaultPrice: z.number().min(0, 'السعر يجب أن يكون أكبر من أو يساوي 0').optional().or(z.nan()),
  defaultDurationMin: z.number().min(1, 'المدة يجب أن تكون على الأقل دقيقة واحدة').optional().or(z.nan()),
  isActive: z.boolean().optional(),
})

interface EditServiceModalProps {
  isOpen: boolean
  onClose: () => void
  service: Service | any
  onSubmit: () => Promise<void> | void
}

export default function EditServiceModal({
  isOpen,
  onClose,
  service,
  onSubmit,
}: EditServiceModalProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<UpdateServiceRequest>({
    resolver: zodResolver(schema as any),
    defaultValues: {
      name: service?.name || '',
      description: service?.description || '',
      defaultPrice: service?.defaultPrice || service?.basePrice,
      defaultDurationMin: service?.defaultDurationMin || service?.baseDuration,
      isActive: service?.isActive !== undefined ? service.isActive : true,
    },
    values: {
      name: service?.name || '',
      description: service?.description || '',
      defaultPrice: service?.defaultPrice || service?.basePrice,
      defaultDurationMin: service?.defaultDurationMin || service?.baseDuration,
      isActive: service?.isActive !== undefined ? service.isActive : true,
    },
  })

  useEffect(() => {
    if (service) {
      reset({
        name: service?.name || '',
        description: service?.description || '',
        defaultPrice: service?.defaultPrice || service?.basePrice,
        defaultDurationMin: service?.defaultDurationMin || service?.baseDuration,
        isActive: service?.isActive !== undefined ? service.isActive : true,
      })
    }
  }, [service, reset])

  if (!isOpen) return null

  const submit = async (values: UpdateServiceRequest) => {
    try {
      await servicesApi.update(service.id || service._id, {
        ...values,
        defaultPrice: values.defaultPrice || undefined,
        defaultDurationMin: values.defaultDurationMin || undefined,
      })
      toast.success('تم تحديث الخدمة بنجاح')
      await onSubmit()
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'فشل تحديث الخدمة')
      throw error
    }
  }

  const handleClose = () => {
    onClose()
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 p-4" dir="rtl">
      <div className="w-full max-w-lg bg-white rounded-xl shadow-sm border border-[#e2e8f0]">
        <div className="px-6 py-4 border-b border-[#e2e8f0] bg-[#f8fafc] flex items-center justify-between">
          <h3 className="text-lg font-semibold text-[#0f172a]">تعديل الخدمة</h3>
          <button
            onClick={handleClose}
            className="text-[#64748b] hover:text-[#0f172a] transition-colors duration-150 text-xl font-bold leading-none"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit(submit)} className="px-6 py-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-[#0f172a] mb-2">
              اسم الخدمة <span className="text-[#ef4444]">*</span>
            </label>
            <input
              className={`w-full border rounded-lg px-3 py-2 text-[#0f172a] placeholder-[#64748b] focus:outline-none focus:ring-2 focus:ring-[#6366f1] focus:border-transparent transition-all duration-150 ease-out ${
                errors.name ? 'border-[#ef4444] bg-[#ef4444]/5' : 'border-[#e2e8f0] bg-white'
              }`}
              {...register('name')}
              placeholder="مثال: استشارة عامة"
            />
            {errors.name && <p className="text-[#ef4444] text-sm mt-1">{errors.name.message as string}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-[#0f172a] mb-2">الوصف (اختياري)</label>
            <textarea
              rows={3}
              className={`w-full border rounded-lg px-3 py-2 text-[#0f172a] placeholder-[#64748b] focus:outline-none focus:ring-2 focus:ring-[#6366f1] focus:border-transparent resize-none transition-all duration-150 ease-out ${
                errors.description ? 'border-[#ef4444] bg-[#ef4444]/5' : 'border-[#e2e8f0] bg-white'
              }`}
              {...register('description')}
              placeholder="وصف الخدمة..."
            />
            {errors.description && (
              <p className="text-[#ef4444] text-sm mt-1">{errors.description.message as string}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-[#0f172a] mb-2">السعر الافتراضي (ر.س)</label>
              <input
                type="number"
                step="0.01"
                min="0"
                className={`w-full border rounded-lg px-3 py-2 text-[#0f172a] placeholder-[#64748b] focus:outline-none focus:ring-2 focus:ring-[#6366f1] focus:border-transparent transition-all duration-150 ease-out ${
                  errors.defaultPrice ? 'border-[#ef4444] bg-[#ef4444]/5' : 'border-[#e2e8f0] bg-white'
                }`}
                {...register('defaultPrice', { valueAsNumber: true })}
                placeholder="0"
              />
              {errors.defaultPrice && (
                <p className="text-[#ef4444] text-sm mt-1">{errors.defaultPrice.message as string}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-[#0f172a] mb-2">المدة الافتراضية (دقيقة)</label>
              <input
                type="number"
                step="1"
                min="1"
                max="480"
                className={`w-full border rounded-lg px-3 py-2 text-[#0f172a] placeholder-[#64748b] focus:outline-none focus:ring-2 focus:ring-[#6366f1] focus:border-transparent transition-all duration-150 ease-out ${
                  errors.defaultDurationMin ? 'border-[#ef4444] bg-[#ef4444]/5' : 'border-[#e2e8f0] bg-white'
                }`}
                {...register('defaultDurationMin', { valueAsNumber: true })}
                placeholder="30"
              />
              {errors.defaultDurationMin && (
                <p className="text-[#ef4444] text-sm mt-1">
                  {errors.defaultDurationMin.message as string}
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center justify-between p-4 rounded-lg bg-[#f8fafc] border border-[#e2e8f0]">
            <label htmlFor="isActive" className="flex items-center gap-3 cursor-pointer">
              <span className="text-sm font-medium text-[#0f172a]">تفعيل الخدمة</span>
            </label>
            <label className="relative inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                id="isActive" 
                className="sr-only peer"
                {...register('isActive')} 
              />
              <div className="w-11 h-6 bg-[#e2e8f0] peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-[#6366f1]/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-[#e2e8f0] after:border after:rounded-full after:h-5 after:w-5 after:transition-all duration-150 ease-out peer-checked:bg-[#6366f1]"></div>
            </label>
          </div>

          <div className="pt-2 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 rounded-lg border border-[#e2e8f0] text-[#64748b] hover:bg-[#f8fafc] transition-colors duration-150 ease-out"
            >
              إلغاء
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 rounded-lg bg-[#6366f1] text-white hover:bg-[#4f46e5] disabled:opacity-50 transition-colors duration-150 ease-out shadow-sm"
            >
              {isSubmitting ? 'جاري الحفظ...' : 'حفظ'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

