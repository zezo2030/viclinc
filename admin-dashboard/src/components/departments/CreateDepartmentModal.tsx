import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { X } from 'lucide-react'
import type { CreateDepartmentRequest } from '@/types/department.types'

const schema = z.object({
  name: z.string().min(2, 'الاسم مطلوب'),
  description: z.string().max(1000).optional().or(z.literal('')),
  workingHours: z.object({
    startTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'تنسيق الوقت غير صحيح (HH:mm)'),
    endTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'تنسيق الوقت غير صحيح (HH:mm)'),
  }).optional(),
})

interface CreateDepartmentModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: CreateDepartmentRequest) => Promise<void> | void
}

export default function CreateDepartmentModal({ isOpen, onClose, onSubmit }: CreateDepartmentModalProps) {
  const [logo, setLogo] = useState<File | undefined>(undefined)
  const [previewUrl, setPreviewUrl] = useState<string | undefined>(undefined)
  const [logoError, setLogoError] = useState<string | null>(null)
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    getValues,
    watch,
  } = useForm<CreateDepartmentRequest>({
    resolver: zodResolver(schema as any),
    defaultValues: { 
      name: '', 
      description: '',
      workingHours: { startTime: '08:00', endTime: '17:00' }
    },
  })
  
  // مراقبة قيم workingHours للتأكد من تحديثها
  const watchedWorkingHours = watch('workingHours')

  if (!isOpen) return null

  const submit = async (values: CreateDepartmentRequest) => {
    // الحصول على workingHours من النموذج - استخدام watch أو getValues أو values
    let workingHours = watchedWorkingHours || getValues('workingHours') || values.workingHours
    
    // إذا لم يكن موجوداً، بناء من القيم الفردية
    if (!workingHours || !workingHours.startTime || !workingHours.endTime) {
      const startTime = getValues('workingHours.startTime') || '08:00'
      const endTime = getValues('workingHours.endTime') || '17:00'
      workingHours = { startTime, endTime }
    }
    
    await onSubmit({ ...values, workingHours, logo })
    reset()
    setLogo(undefined)
    if (previewUrl) URL.revokeObjectURL(previewUrl)
    setPreviewUrl(undefined)
    onClose()
  }

  const handleClose = () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl)
    setPreviewUrl(undefined)
    setLogo(undefined)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" dir="rtl">
      <div className="w-full max-w-lg bg-white rounded-xl shadow-sm border border-[#e2e8f0]">
        <div className="px-6 py-4 border-b border-[#e2e8f0] bg-[#f8fafc] flex items-center justify-between">
          <h3 className="text-lg font-semibold text-[#0f172a]">إضافة قسم</h3>
          <button onClick={handleClose} className="text-[#64748b] hover:text-[#0f172a] transition-colors duration-150">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit(submit)} className="px-6 py-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-[#0f172a] mb-2">الاسم <span className="text-[#ef4444]">*</span></label>
            <input 
              className={`w-full border rounded-lg px-3 py-2 text-[#0f172a] placeholder-[#64748b] focus:outline-none focus:ring-2 focus:ring-[#6366f1] focus:border-transparent transition-all duration-150 ease-out ${
                errors.name ? 'border-[#ef4444] bg-[#ef4444]/5' : 'border-[#e2e8f0] bg-white'
              }`} 
              {...register('name')} 
              placeholder="أدخل اسم القسم"
            />
            {errors.name && <p className="text-[#ef4444] text-sm mt-1">{errors.name.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-[#0f172a] mb-2">الوصف</label>
            <textarea 
              rows={3} 
              className={`w-full border rounded-lg px-3 py-2 text-[#0f172a] placeholder-[#64748b] focus:outline-none focus:ring-2 focus:ring-[#6366f1] focus:border-transparent transition-all duration-150 ease-out ${
                errors.description ? 'border-[#ef4444] bg-[#ef4444]/5' : 'border-[#e2e8f0] bg-white'
              }`} 
              {...register('description')} 
              placeholder="أدخل وصف القسم"
            />
            {errors.description && <p className="text-[#ef4444] text-sm mt-1">{errors.description.message as string}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-[#0f172a] mb-2">ساعات العمل (اختياري)</label>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-[#64748b] mb-1">وقت البدء</label>
                <input 
                  type="time" 
                  className={`w-full border rounded-lg px-3 py-2 text-[#0f172a] focus:outline-none focus:ring-2 focus:ring-[#6366f1] focus:border-transparent transition-all duration-150 ease-out ${
                    errors.workingHours?.startTime ? 'border-[#ef4444] bg-[#ef4444]/5' : 'border-[#e2e8f0] bg-white'
                  }`} 
                  {...register('workingHours.startTime')}
                />
                {errors.workingHours?.startTime && (
                  <p className="text-[#ef4444] text-sm mt-1">{errors.workingHours.startTime.message as string}</p>
                )}
              </div>
              <div>
                <label className="block text-xs text-[#64748b] mb-1">وقت الانتهاء</label>
                <input 
                  type="time" 
                  className={`w-full border rounded-lg px-3 py-2 text-[#0f172a] focus:outline-none focus:ring-2 focus:ring-[#6366f1] focus:border-transparent transition-all duration-150 ease-out ${
                    errors.workingHours?.endTime ? 'border-[#ef4444] bg-[#ef4444]/5' : 'border-[#e2e8f0] bg-white'
                  }`} 
                  {...register('workingHours.endTime')}
                />
                {errors.workingHours?.endTime && (
                  <p className="text-[#ef4444] text-sm mt-1">{errors.workingHours.endTime.message as string}</p>
                )}
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-[#0f172a] mb-2">شعار القسم (اختياري)</label>
            <input
              type="file"
              accept="image/*"
              className="w-full border border-[#e2e8f0] rounded-lg px-3 py-2 text-sm text-[#0f172a] focus:outline-none focus:ring-2 focus:ring-[#6366f1] focus:border-transparent transition-all duration-150 ease-out"
              onChange={(e) => {
                const file = (e.target.files && e.target.files[0]) || undefined
                setLogoError(null)
                if (file) {
                  if (!file.type.startsWith('image/')) {
                    setLogo(undefined)
                    setPreviewUrl(undefined)
                    setLogoError('الملف المختار ليس صورة')
                    return
                  }
                  if (file.size > 2 * 1024 * 1024) {
                    setLogo(undefined)
                    setPreviewUrl(undefined)
                    setLogoError('حجم الصورة يتجاوز 2MB')
                    return
                  }
                  setLogo(file)
                  if (previewUrl) URL.revokeObjectURL(previewUrl)
                  setPreviewUrl(URL.createObjectURL(file))
                } else {
                  setLogo(undefined)
                  if (previewUrl) URL.revokeObjectURL(previewUrl)
                  setPreviewUrl(undefined)
                }
              }}
            />
            {logoError && <p className="text-[#ef4444] text-sm mt-1">{logoError}</p>}
            {previewUrl && (
              <div className="mt-3">
                <div className="w-24 h-24 rounded-lg overflow-hidden border border-[#e2e8f0]">
                  <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                </div>
              </div>
            )}
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


