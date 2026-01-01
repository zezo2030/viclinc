import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { X, Plus as PlusIcon, Loader2 } from 'lucide-react'
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
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 p-4" dir="rtl">
      <div className="w-full max-w-2xl bg-white rounded-xl shadow-sm border border-[#e2e8f0] overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 bg-[#6366f1] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center">
              <PlusIcon className="w-5 h-5 text-white" />
            </div>
            <h3 className="text-xl font-semibold text-white">إضافة خدمة جديدة</h3>
          </div>
          <button 
            onClick={handleClose} 
            className="w-8 h-8 flex items-center justify-center rounded-lg bg-white/20 hover:bg-white/30 text-white transition-colors duration-150"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit(submit)} className="p-6 space-y-5 bg-white">
          {/* Service Name */}
          <div>
            <label className="block text-sm font-medium text-[#0f172a] mb-2">
              اسم الخدمة <span className="text-[#ef4444]">*</span>
            </label>
            <input
              className={`w-full border rounded-lg px-4 py-3 text-[#0f172a] placeholder-[#64748b] focus:outline-none focus:ring-2 focus:ring-[#6366f1] focus:border-transparent transition-all duration-150 ease-out ${
                errors.name ? 'border-[#ef4444] bg-[#ef4444]/5' : 'border-[#e2e8f0] bg-white'
              }`}
              {...register('name')}
              placeholder="مثال: استشارة عامة"
            />
            {errors.name && (
              <p className="text-[#ef4444] text-sm mt-1">{errors.name.message as string}</p>
            )}
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-[#0f172a] mb-2">الوصف (اختياري)</label>
            <textarea
              rows={4}
              className={`w-full border rounded-lg px-4 py-3 text-[#0f172a] placeholder-[#64748b] focus:outline-none focus:ring-2 focus:ring-[#6366f1] focus:border-transparent resize-none transition-all duration-150 ease-out ${
                errors.description ? 'border-[#ef4444] bg-[#ef4444]/5' : 'border-[#e2e8f0] bg-white'
              }`}
              {...register('description')}
              placeholder="وصف الخدمة..."
            />
            {errors.description && (
              <p className="text-[#ef4444] text-sm mt-1">{errors.description.message as string}</p>
            )}
          </div>

          {/* Price and Duration Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-[#0f172a] mb-2">السعر الافتراضي (ر.س)</label>
              <div className="relative">
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  className={`w-full border rounded-lg px-4 py-3 pr-12 text-[#0f172a] placeholder-[#64748b] focus:outline-none focus:ring-2 focus:ring-[#6366f1] focus:border-transparent transition-all duration-150 ease-out ${
                    errors.defaultPrice ? 'border-[#ef4444] bg-[#ef4444]/5' : 'border-[#e2e8f0] bg-white'
                  }`}
                  {...register('defaultPrice', { valueAsNumber: true })}
                  placeholder="0.00"
                />
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#64748b] font-medium">ر.س</span>
              </div>
              {errors.defaultPrice && (
                <p className="text-[#ef4444] text-sm mt-1">{errors.defaultPrice.message as string}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-[#0f172a] mb-2">المدة الافتراضية (دقيقة)</label>
              <div className="relative">
                <input
                  type="number"
                  step="1"
                  min="1"
                  max="480"
                  className={`w-full border rounded-lg px-4 py-3 pr-12 text-[#0f172a] placeholder-[#64748b] focus:outline-none focus:ring-2 focus:ring-[#6366f1] focus:border-transparent transition-all duration-150 ease-out ${
                    errors.defaultDurationMin ? 'border-[#ef4444] bg-[#ef4444]/5' : 'border-[#e2e8f0] bg-white'
                  }`}
                  {...register('defaultDurationMin', { valueAsNumber: true })}
                  placeholder="30"
                />
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#64748b] font-medium">دقيقة</span>
              </div>
              {errors.defaultDurationMin && (
                <p className="text-[#ef4444] text-sm mt-1">{errors.defaultDurationMin.message as string}</p>
              )}
            </div>
          </div>

          {/* Active Status */}
          <div className="flex items-center justify-between p-4 rounded-lg bg-[#f8fafc] border border-[#e2e8f0]">
            <label htmlFor="isActive" className="flex items-center gap-3 cursor-pointer">
              <span className="text-sm font-medium text-[#0f172a]">تفعيل الخدمة</span>
            </label>
            <label className="relative inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                id="isActive" 
                defaultChecked
                className="sr-only peer"
                {...register('isActive')} 
              />
              <div className="w-11 h-6 bg-[#e2e8f0] peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-[#6366f1]/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-[#e2e8f0] after:border after:rounded-full after:h-5 after:w-5 after:transition-all duration-150 ease-out peer-checked:bg-[#6366f1]"></div>
            </label>
          </div>

          {/* Action Buttons */}
          <div className="pt-2 flex items-center justify-end gap-3">
            <button 
              type="button" 
              onClick={handleClose} 
              className="px-6 py-3 rounded-lg border border-[#e2e8f0] text-[#64748b] font-medium hover:bg-[#f8fafc] transition-colors duration-150 ease-out"
            >
              إلغاء
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-3 rounded-lg bg-[#6366f1] text-white font-medium shadow-sm hover:bg-[#4f46e5] transition-colors duration-150 ease-out disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="animate-spin h-5 w-5" />
                  <span>جاري الحفظ...</span>
                </>
              ) : (
                <span>إضافة الخدمة</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

