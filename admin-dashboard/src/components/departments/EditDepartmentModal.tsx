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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="w-full max-w-lg bg-white rounded-xl shadow-xl border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <h3 className="text-lg font-semibold">تعديل قسم</h3>
          <button onClick={handleClose} className="text-gray-500 hover:text-gray-700">×</button>
        </div>

        <form onSubmit={handleSubmit(submit)} className="px-6 py-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">الاسم</label>
            <input className="w-full border rounded-lg px-3 py-2" {...register('name')} />
            {errors.name && <p className="text-red-600 text-sm mt-1">{errors.name.message as string}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">الوصف</label>
            <textarea rows={3} className="w-full border rounded-lg px-3 py-2" {...register('description')} />
            {errors.description && <p className="text-red-600 text-sm mt-1">{errors.description.message as string}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">الشعار (اختياري)</label>
            <input
              type="file"
              accept="image/*"
              className="w-full border rounded-lg px-3 py-2"
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
            {logoError && <p className="text-red-600 text-sm mt-1">{logoError}</p>}
            <div className="mt-3">
              <div className="w-24 h-24 rounded-lg overflow-hidden border">
                {previewUrl ? (
                  <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                ) : department.logoPath ? (
                  <img src={resolveLogoUrl(department.logoPath)} alt={department.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">لا شعار</div>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <input type="checkbox" id="isActive" {...register('isActive')} />
            <label htmlFor="isActive" className="text-sm">نشط</label>
          </div>

          <div className="pt-2 flex items-center justify-end gap-2">
            <button type="button" onClick={handleClose} className="px-4 py-2 rounded-lg border">إلغاء</button>
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


