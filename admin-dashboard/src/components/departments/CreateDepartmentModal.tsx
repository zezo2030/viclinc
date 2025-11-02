import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import type { CreateDepartmentRequest } from '@/types/department.types'

const schema = z.object({
  name: z.string().min(2, 'الاسم مطلوب'),
  description: z.string().max(1000).optional().or(z.literal('')),
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
  } = useForm<CreateDepartmentRequest>({
    resolver: zodResolver(schema as any),
    defaultValues: { name: '', description: '' },
  })

  if (!isOpen) return null

  const submit = async (values: CreateDepartmentRequest) => {
    await onSubmit({ ...values, logo })
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="w-full max-w-lg bg-white rounded-xl shadow-xl border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <h3 className="text-lg font-semibold">إضافة قسم</h3>
          <button onClick={handleClose} className="text-gray-500 hover:text-gray-700">×</button>
        </div>

        <form onSubmit={handleSubmit(submit)} className="px-6 py-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">الاسم</label>
            <input className="w-full border rounded-lg px-3 py-2" {...register('name')} />
            {errors.name && <p className="text-red-600 text-sm mt-1">{errors.name.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">الوصف</label>
            <textarea rows={3} className="w-full border rounded-lg px-3 py-2" {...register('description')} />
            {errors.description && <p className="text-red-600 text-sm mt-1">{errors.description.message as string}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">شعار القسم (اختياري)</label>
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
            {previewUrl && (
              <div className="mt-3">
                <div className="w-24 h-24 rounded-lg overflow-hidden border">
                  <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                </div>
              </div>
            )}
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


