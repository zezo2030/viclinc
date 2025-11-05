import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
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
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40">
      <div className="w-full max-w-lg bg-white rounded-xl shadow-xl border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <h3 className="text-lg font-semibold">تعديل الخدمة</h3>
          <button
            onClick={handleClose}
            className="text-gray-500 hover:text-gray-700 text-2xl font-bold leading-none"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit(submit)} className="px-6 py-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              اسم الخدمة <span className="text-red-500">*</span>
            </label>
            <input
              className="w-full border rounded-lg px-3 py-2"
              {...register('name')}
              placeholder="مثال: استشارة عامة"
            />
            {errors.name && <p className="text-red-600 text-sm mt-1">{errors.name.message as string}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">الوصف (اختياري)</label>
            <textarea
              rows={3}
              className="w-full border rounded-lg px-3 py-2"
              {...register('description')}
              placeholder="وصف الخدمة..."
            />
            {errors.description && (
              <p className="text-red-600 text-sm mt-1">{errors.description.message as string}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">السعر الافتراضي (ر.س)</label>
              <input
                type="number"
                step="0.01"
                min="0"
                className="w-full border rounded-lg px-3 py-2"
                {...register('defaultPrice', { valueAsNumber: true })}
                placeholder="0"
              />
              {errors.defaultPrice && (
                <p className="text-red-600 text-sm mt-1">{errors.defaultPrice.message as string}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">المدة الافتراضية (دقيقة)</label>
              <input
                type="number"
                step="1"
                min="1"
                max="480"
                className="w-full border rounded-lg px-3 py-2"
                {...register('defaultDurationMin', { valueAsNumber: true })}
                placeholder="30"
              />
              {errors.defaultDurationMin && (
                <p className="text-red-600 text-sm mt-1">
                  {errors.defaultDurationMin.message as string}
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <input type="checkbox" id="isActive" {...register('isActive')} />
            <label htmlFor="isActive" className="text-sm">
              تفعيل الخدمة
            </label>
          </div>

          <div className="pt-2 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 rounded-lg border hover:bg-gray-50"
            >
              إلغاء
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 rounded-lg bg-primary-600 text-white hover:bg-primary-700 disabled:opacity-50"
            >
              {isSubmitting ? 'جاري الحفظ...' : 'حفظ'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

