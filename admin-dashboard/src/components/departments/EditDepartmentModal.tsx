import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { X, Edit, Image as ImageIcon, Loader2 } from 'lucide-react'
import type { Department, UpdateDepartmentRequest } from '@/types/department.types'
import { API_URL } from '@/utils/constants'

const schema = z.object({
  name: z.string().min(2, 'الاسم مطلوب').optional(),
  description: z.string().max(1000).optional().or(z.literal('')),
  isActive: z.boolean().optional(),
  workingHours: z.object({
    startTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'تنسيق الوقت غير صحيح (HH:mm)'),
    endTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'تنسيق الوقت غير صحيح (HH:mm)'),
  }).optional(),
})

interface EditDepartmentModalProps {
  isOpen: boolean
  onClose: () => void
  department: Department
  onSubmit: (data: UpdateDepartmentRequest) => Promise<void> | void
}

export default function EditDepartmentModal({ isOpen, onClose, department, onSubmit }: EditDepartmentModalProps) {
  const [logo, setLogo] = useState<File | undefined>(undefined)
  const [previewUrl, setPreviewUrl] = useState<string | undefined>(undefined)
  const [logoError, setLogoError] = useState<string | null>(null)
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    getValues,
    watch,
  } = useForm<UpdateDepartmentRequest>({
    resolver: zodResolver(schema as any),
    defaultValues: {
      name: department?.name,
      description: department?.description,
      isActive: department?.isActive,
      workingHours: department?.workingHours || { startTime: '08:00', endTime: '17:00' },
    },
    values: {
      name: department?.name,
      description: department?.description,
      isActive: department?.isActive,
      workingHours: department?.workingHours || { startTime: '08:00', endTime: '17:00' },
    },
  })

  // مراقبة قيم workingHours للتأكد من تحديثها
  const watchedWorkingHours = watch('workingHours')

  if (!isOpen) return null

  const submit = async (values: UpdateDepartmentRequest) => {
    // الحصول على workingHours من النموذج - استخدام watch أو getValues أو values
    let workingHours = watchedWorkingHours || getValues('workingHours') || values.workingHours || department?.workingHours
    
    // إذا لم يكن موجوداً، بناء من القيم الفردية
    if (!workingHours || !workingHours.startTime || !workingHours.endTime) {
      const startTime = getValues('workingHours.startTime') || department?.workingHours?.startTime || '08:00'
      const endTime = getValues('workingHours.endTime') || department?.workingHours?.endTime || '17:00'
      workingHours = { startTime, endTime }
    }
    
    await onSubmit({ ...values, workingHours, logo })
    if (previewUrl) URL.revokeObjectURL(previewUrl)
    setPreviewUrl(undefined)
    onClose()
  }
  const resolveLogoUrl = (path?: string) => {
    if (!path) return undefined
    if (path.startsWith('http')) return path
    try {
      const origin = new URL(API_URL).origin
      if (path.startsWith('/')) return `${origin}${path}`
      return `${origin}/${path}`
    } catch {
      return path
    }
  }

  const handleClose = () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl)
    setPreviewUrl(undefined)
    setLogo(undefined)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" dir="rtl">
      <div className="w-full max-w-2xl bg-white rounded-xl shadow-sm border border-[#e2e8f0] overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 bg-[#6366f1] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center">
              <Edit className="w-5 h-5 text-white" />
            </div>
            <h3 className="text-xl font-semibold text-white">تعديل قسم</h3>
          </div>
          <button 
            onClick={handleClose} 
            className="w-8 h-8 flex items-center justify-center rounded-lg bg-white/20 hover:bg-white/30 text-white transition-colors duration-150"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit(submit)} className="p-6 space-y-5 bg-white">
          {/* Name Field */}
          <div>
            <label className="block text-sm font-medium text-[#0f172a] mb-2">اسم القسم</label>
            <input 
              className={`w-full border rounded-lg px-4 py-3 text-[#0f172a] placeholder-[#64748b] focus:outline-none focus:ring-2 focus:ring-[#6366f1] focus:border-transparent transition-all duration-150 ease-out ${
                errors.name ? 'border-[#ef4444] bg-[#ef4444]/5' : 'border-[#e2e8f0] bg-white'
              }`}
              placeholder="أدخل اسم القسم..."
              {...register('name')} 
            />
            {errors.name && (
              <p className="text-[#ef4444] text-sm mt-1">{errors.name.message as string}</p>
            )}
          </div>

          {/* Description Field */}
          <div>
            <label className="block text-sm font-medium text-[#0f172a] mb-2">الوصف</label>
            <textarea 
              rows={4} 
              className={`w-full border rounded-lg px-4 py-3 text-[#0f172a] placeholder-[#64748b] focus:outline-none focus:ring-2 focus:ring-[#6366f1] focus:border-transparent resize-none transition-all duration-150 ease-out ${
                errors.description ? 'border-[#ef4444] bg-[#ef4444]/5' : 'border-[#e2e8f0] bg-white'
              }`}
              placeholder="أدخل وصف القسم..."
              {...register('description')} 
            />
            {errors.description && (
              <p className="text-[#ef4444] text-sm mt-1">{errors.description.message as string}</p>
            )}
          </div>

          {/* Working Hours Field */}
          <div>
            <label className="block text-sm font-medium text-[#0f172a] mb-2">ساعات العمل (اختياري)</label>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-[#64748b] mb-1">وقت البدء</label>
                <input 
                  type="time" 
                  className={`w-full border rounded-lg px-4 py-3 text-[#0f172a] focus:outline-none focus:ring-2 focus:ring-[#6366f1] focus:border-transparent transition-all duration-150 ease-out ${
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
                  className={`w-full border rounded-lg px-4 py-3 text-[#0f172a] focus:outline-none focus:ring-2 focus:ring-[#6366f1] focus:border-transparent transition-all duration-150 ease-out ${
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

          {/* Logo Upload */}
          <div>
            <label className="block text-sm font-medium text-[#0f172a] mb-2">شعار القسم (اختياري)</label>
            <div className="relative">
              <input
                type="file"
                accept="image/*"
                className="hidden"
                id="logo-upload"
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
              <label
                htmlFor="logo-upload"
                className="flex items-center justify-center gap-2 w-full border border-dashed border-[#e2e8f0] rounded-lg px-4 py-6 cursor-pointer transition-all duration-150 ease-out hover:border-[#6366f1] hover:bg-[#6366f1]/5 bg-[#f8fafc]"
              >
                <ImageIcon className="w-5 h-5 text-[#64748b]" />
                <span className="text-sm font-medium text-[#64748b]">اضغط لاختيار صورة</span>
              </label>
            </div>
            {logoError && (
              <p className="text-[#ef4444] text-sm mt-1">{logoError}</p>
            )}
            
            {/* Logo Preview */}
            <div className="mt-4">
              <div className="relative inline-block">
                <div className="w-28 h-28 rounded-lg overflow-hidden border border-[#e2e8f0] bg-[#f8fafc]">
                  {previewUrl ? (
                    <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                  ) : department.logoPath ? (
                    <img src={resolveLogoUrl(department.logoPath)} alt={department.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-[#64748b]">
                      <ImageIcon className="w-10 h-10" />
                    </div>
                  )}
                </div>
                {(previewUrl || department.logoPath) && (
                  <button
                    type="button"
                    onClick={() => {
                      setLogo(undefined)
                      if (previewUrl) URL.revokeObjectURL(previewUrl)
                      setPreviewUrl(undefined)
                    }}
                    className="absolute -top-2 -right-2 w-7 h-7 bg-[#ef4444] text-white rounded-full flex items-center justify-center shadow-sm hover:bg-[#dc2626] transition-colors duration-150"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Active Status */}
          <div className="flex items-center justify-between p-4 rounded-lg bg-[#f8fafc] border border-[#e2e8f0]">
            <label htmlFor="isActive" className="flex items-center gap-3 cursor-pointer">
              <span className="text-sm font-medium text-[#0f172a]">تفعيل القسم</span>
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
                <span>حفظ التغييرات</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}


