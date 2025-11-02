import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import type { DoctorProfile, UpdateDoctorRequest } from '@/types/doctor.types'
import { departmentsApi } from '@/api/departments'
import type { Department } from '@/types/department.types'

const schema = z.object({
  name: z.string().min(2, 'الاسم مطلوب').optional(),
  licenseNumber: z.string().min(3, 'رقم الرخصة مطلوب').optional(),
  yearsOfExperience: z.coerce.number().min(0, 'سنوات الخبرة لا تقل عن 0').optional(),
  departmentId: z.string().min(1, 'القسم مطلوب').optional(),
  bio: z.string().max(1000).optional(),
})

interface EditDoctorModalProps {
  isOpen: boolean
  onClose: () => void
  doctor: DoctorProfile
  onSubmit: (data: UpdateDoctorRequest) => Promise<void> | void
}

export default function EditDoctorModal({ isOpen, onClose, doctor, onSubmit }: EditDoctorModalProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<UpdateDoctorRequest>({
    resolver: zodResolver(schema as any),
    defaultValues: {
      name: doctor?.name,
      licenseNumber: doctor?.licenseNumber,
      yearsOfExperience: doctor?.yearsOfExperience,
      departmentId: doctor?.departmentId,
      bio: doctor?.bio,
    },
    values: {
      name: doctor?.name,
      licenseNumber: doctor?.licenseNumber,
      yearsOfExperience: doctor?.yearsOfExperience,
      departmentId: doctor?.departmentId,
      bio: doctor?.bio,
    },
  })

  useEffect(() => {
    if (!isOpen) {
      reset()
    }
  }, [isOpen, reset])

  // Load departments
  const [departments, setDepartments] = useState<Department[]>([])
  const [depsLoading, setDepsLoading] = useState(false)
  const [depsError, setDepsError] = useState<string | null>(null)
  useEffect(() => {
    if (!isOpen) return
    setDepsLoading(true)
    setDepsError(null)
    departmentsApi
      .getAll()
      .then((list) => setDepartments(list))
      .catch((e) => setDepsError(e?.response?.data?.message || e?.message || 'فشل تحميل الأقسام'))
      .finally(() => setDepsLoading(false))
  }, [isOpen])

  if (!isOpen) return null

  const submit = async (values: UpdateDoctorRequest) => {
    await onSubmit(values)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="w-full max-w-lg bg-white rounded-xl shadow-xl border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <h3 className="text-lg font-semibold">تعديل طبيب</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">×</button>
        </div>

        <form onSubmit={handleSubmit(submit)} className="px-6 py-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">الاسم</label>
            <input className="w-full border rounded-lg px-3 py-2" {...register('name')} />
            {errors.name && <p className="text-red-600 text-sm mt-1">{errors.name.message as string}</p>}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">رقم الرخصة</label>
              <input className="w-full border rounded-lg px-3 py-2" {...register('licenseNumber')} />
              {errors.licenseNumber && (
                <p className="text-red-600 text-sm mt-1">{errors.licenseNumber.message as string}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">سنوات الخبرة</label>
              <input type="number" className="w-full border rounded-lg px-3 py-2" {...register('yearsOfExperience')} />
              {errors.yearsOfExperience && (
                <p className="text-red-600 text-sm mt-1">{errors.yearsOfExperience.message as string}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">القسم</label>
              <select
                className="w-full border rounded-lg px-3 py-2 bg-white"
                disabled={depsLoading}
                {...register('departmentId')}
              >
                <option value="">{depsLoading ? 'جاري التحميل...' : 'اختر قسماً'}</option>
                {departments.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name}
                  </option>
                ))}
              </select>
              {depsError && <p className="text-red-600 text-sm mt-1">{depsError}</p>}
              {errors.departmentId && (
                <p className="text-red-600 text-sm mt-1">{errors.departmentId.message as string}</p>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">نبذة</label>
            <textarea rows={3} className="w-full border rounded-lg px-3 py-2" {...register('bio')} />
            {errors.bio && <p className="text-red-600 text-sm mt-1">{errors.bio.message as string}</p>}
          </div>

          <div className="pt-2 flex items-center justify-end gap-2">
            <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg border">إلغاء</button>
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


