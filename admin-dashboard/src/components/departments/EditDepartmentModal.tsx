import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import type { Department, UpdateDepartmentRequest } from '@/types/department.types'
import { API_URL } from '@/utils/constants'

const schema = z.object({
  name: z.string().min(2, 'الاسم مطلوب').optional(),
  description: z.string().max(1000).optional().or(z.literal('')),
  isActive: z.boolean().optional(),
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
  } = useForm<UpdateDepartmentRequest>({
    resolver: zodResolver(schema as any),
    defaultValues: {
      name: department?.name,
      description: department?.description,
      isActive: department?.isActive,
    },
    values: {
      name: department?.name,
      description: department?.description,
      isActive: department?.isActive,
    },
  })

  if (!isOpen) return null

  const submit = async (values: UpdateDepartmentRequest) => {
    await onSubmit({ ...values, logo })
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-black/60 to-black/40 backdrop-blur-sm p-4 animate-fade-in">
      <div className="w-full max-w-2xl bg-gradient-to-br from-white to-gray-50 rounded-3xl shadow-2xl border border-gray-200 overflow-hidden animate-slide-in-right">
        {/* Header with Gradient */}
        <div className="relative px-8 py-6 bg-gradient-to-r from-blue-500 via-purple-600 to-pink-500 flex items-center justify-between overflow-hidden">
          <div className="relative z-10 flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-lg">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </div>
            <h3 className="text-2xl font-black text-white drop-shadow-lg">تعديل قسم</h3>
          </div>
          <button 
            onClick={handleClose} 
            className="relative z-10 w-10 h-10 flex items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white transition-all duration-300 hover:scale-110 hover:rotate-90 shadow-lg"
          >
            <span className="text-2xl font-bold">×</span>
          </button>
          {/* Decorative Elements */}
          <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -translate-y-20 translate-x-20 blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-40 h-40 bg-white/10 rounded-full translate-y-20 -translate-x-20 blur-3xl"></div>
        </div>

        <form onSubmit={handleSubmit(submit)} className="p-8 space-y-6 bg-gradient-to-br from-white to-purple-50/30">
          {/* Name Field */}
          <div>
            <label className="block text-sm font-bold text-gray-900 mb-2 flex items-center gap-2">
              <span className="text-purple-600">📝</span>
              <span>اسم القسم</span>
            </label>
            <input 
              className={`w-full border-2 rounded-xl px-4 py-3 transition-all duration-300 bg-white/70 backdrop-blur-sm focus:border-purple-500 focus:ring-2 focus:ring-purple-200 hover:border-gray-300 ${
                errors.name ? 'border-red-300 focus:border-red-500 focus:ring-red-200' : 'border-gray-200'
              }`}
              placeholder="أدخل اسم القسم..."
              {...register('name')} 
            />
            {errors.name && (
              <p className="text-red-600 text-sm mt-2 flex items-center gap-1">
                <span>⚠️</span>
                <span>{errors.name.message as string}</span>
              </p>
            )}
          </div>

          {/* Description Field */}
          <div>
            <label className="block text-sm font-bold text-gray-900 mb-2 flex items-center gap-2">
              <span className="text-purple-600">📄</span>
              <span>الوصف</span>
            </label>
            <textarea 
              rows={4} 
              className={`w-full border-2 rounded-xl px-4 py-3 transition-all duration-300 bg-white/70 backdrop-blur-sm focus:border-purple-500 focus:ring-2 focus:ring-purple-200 hover:border-gray-300 resize-none ${
                errors.description ? 'border-red-300 focus:border-red-500 focus:ring-red-200' : 'border-gray-200'
              }`}
              placeholder="أدخل وصف القسم..."
              {...register('description')} 
            />
            {errors.description && (
              <p className="text-red-600 text-sm mt-2 flex items-center gap-1">
                <span>⚠️</span>
                <span>{errors.description.message as string}</span>
              </p>
            )}
          </div>

          {/* Logo Upload */}
          <div>
            <label className="block text-sm font-bold text-gray-900 mb-2 flex items-center gap-2">
              <span className="text-purple-600">🖼️</span>
              <span>شعار القسم (اختياري)</span>
            </label>
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
                className="flex items-center justify-center gap-2 w-full border-2 border-dashed border-gray-300 rounded-xl px-4 py-6 cursor-pointer transition-all duration-300 hover:border-purple-400 hover:bg-purple-50/50 bg-white/50"
              >
                <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span className="text-sm font-medium text-gray-600">اضغط لاختيار صورة</span>
              </label>
            </div>
            {logoError && (
              <p className="text-red-600 text-sm mt-2 flex items-center gap-1">
                <span>⚠️</span>
                <span>{logoError}</span>
              </p>
            )}
            
            {/* Logo Preview */}
            <div className="mt-4">
              <div className="relative inline-block">
                <div className="w-32 h-32 rounded-2xl overflow-hidden border-4 border-white shadow-xl ring-4 ring-purple-100 bg-gradient-to-br from-purple-100 to-pink-100">
                  {previewUrl ? (
                    <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                  ) : department.logoPath ? (
                    <img src={resolveLogoUrl(department.logoPath)} alt={department.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                      <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
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
                    className="absolute -top-2 -right-2 w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center shadow-lg hover:bg-red-600 hover:scale-110 transition-all duration-300"
                  >
                    <span className="text-lg">×</span>
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Active Status */}
          <div className="flex items-center justify-between p-4 rounded-xl bg-gradient-to-r from-white to-purple-50 border border-purple-200">
            <label htmlFor="isActive" className="flex items-center gap-3 cursor-pointer">
              <span className="text-lg">✅</span>
              <span className="text-sm font-bold text-gray-900">تفعيل القسم</span>
            </label>
            <label className="relative inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                id="isActive" 
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
              className="px-6 py-3 rounded-xl border-2 border-gray-300 text-gray-700 font-semibold hover:bg-gray-50 hover:border-gray-400 transition-all duration-300 hover:scale-105"
            >
              إلغاء
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-8 py-3 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold shadow-lg shadow-purple-500/30 hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center gap-2"
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
                  <span>💾</span>
                  <span>حفظ التغييرات</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}


