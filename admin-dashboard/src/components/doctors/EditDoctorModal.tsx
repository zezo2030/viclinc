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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-black/60 to-black/40 backdrop-blur-sm p-4 animate-fade-in">
      <div className="w-full max-w-2xl bg-gradient-to-br from-white to-gray-50 rounded-3xl shadow-2xl border border-gray-200 overflow-hidden animate-slide-in-right">
        {/* Header with Gradient */}
        <div className="relative px-8 py-6 bg-gradient-to-r from-teal-500 via-cyan-600 to-blue-500 flex items-center justify-between overflow-hidden">
          <div className="relative z-10 flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-lg">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </div>
            <h3 className="text-2xl font-black text-white drop-shadow-lg">تعديل طبيب</h3>
          </div>
          <button 
            onClick={onClose} 
            className="relative z-10 w-10 h-10 flex items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white transition-all duration-300 hover:scale-110 hover:rotate-90 shadow-lg"
          >
            <span className="text-2xl font-bold">×</span>
          </button>
          {/* Decorative Elements */}
          <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -translate-y-20 translate-x-20 blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-40 h-40 bg-white/10 rounded-full translate-y-20 -translate-x-20 blur-3xl"></div>
        </div>

        <form onSubmit={handleSubmit(submit)} className="p-8 space-y-6 bg-gradient-to-br from-white to-teal-50/30">
          {/* Name Field */}
          <div>
            <label className="block text-sm font-bold text-gray-900 mb-2 flex items-center gap-2">
              <span className="text-teal-600">👤</span>
              <span>اسم الطبيب</span>
            </label>
            <input 
              className={`w-full border-2 rounded-xl px-4 py-3 transition-all duration-300 bg-white/70 backdrop-blur-sm focus:border-teal-500 focus:ring-2 focus:ring-teal-200 hover:border-gray-300 ${
                errors.name ? 'border-red-300 focus:border-red-500 focus:ring-red-200' : 'border-gray-200'
              }`}
              placeholder="أدخل اسم الطبيب..."
              {...register('name')} 
            />
            {errors.name && (
              <p className="text-red-600 text-sm mt-2 flex items-center gap-1">
                <span>⚠️</span>
                <span>{errors.name.message as string}</span>
              </p>
            )}
          </div>

          {/* License Number and Years of Experience */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-gray-900 mb-2 flex items-center gap-2">
                <span className="text-teal-600">📜</span>
                <span>رقم الرخصة</span>
              </label>
              <input 
                className={`w-full border-2 rounded-xl px-4 py-3 transition-all duration-300 bg-white/70 backdrop-blur-sm focus:border-teal-500 focus:ring-2 focus:ring-teal-200 hover:border-gray-300 ${
                  errors.licenseNumber ? 'border-red-300 focus:border-red-500 focus:ring-red-200' : 'border-gray-200'
                }`}
                placeholder="أدخل رقم الرخصة..."
                {...register('licenseNumber')} 
              />
              {errors.licenseNumber && (
                <p className="text-red-600 text-sm mt-2 flex items-center gap-1">
                  <span>⚠️</span>
                  <span>{errors.licenseNumber.message as string}</span>
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-900 mb-2 flex items-center gap-2">
                <span className="text-teal-600">⭐</span>
                <span>سنوات الخبرة</span>
              </label>
              <div className="relative">
                <input 
                  type="number" 
                  className={`w-full border-2 rounded-xl px-4 py-3 pr-12 transition-all duration-300 bg-white/70 backdrop-blur-sm focus:border-teal-500 focus:ring-2 focus:ring-teal-200 hover:border-gray-300 ${
                    errors.yearsOfExperience ? 'border-red-300 focus:border-red-500 focus:ring-red-200' : 'border-gray-200'
                  }`}
                  placeholder="0"
                  {...register('yearsOfExperience')} 
                />
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-medium">سنة</span>
              </div>
              {errors.yearsOfExperience && (
                <p className="text-red-600 text-sm mt-2 flex items-center gap-1">
                  <span>⚠️</span>
                  <span>{errors.yearsOfExperience.message as string}</span>
                </p>
              )}
            </div>
          </div>

          {/* Department */}
          <div>
            <label className="block text-sm font-bold text-gray-900 mb-2 flex items-center gap-2">
              <span className="text-teal-600">🏥</span>
              <span>القسم</span>
            </label>
            <select
              className={`w-full border-2 rounded-xl px-4 py-3 transition-all duration-300 bg-white/70 backdrop-blur-sm focus:border-teal-500 focus:ring-2 focus:ring-teal-200 hover:border-gray-300 font-medium ${
                errors.departmentId ? 'border-red-300 focus:border-red-500 focus:ring-red-200' : 'border-gray-200'
              }`}
              disabled={depsLoading}
              {...register('departmentId')}
            >
              <option value="">{depsLoading ? '⏳ جاري التحميل...' : '🔵 اختر قسماً'}</option>
              {departments.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
            </select>
            {depsError && (
              <p className="text-red-600 text-sm mt-2 flex items-center gap-1">
                <span>⚠️</span>
                <span>{depsError}</span>
              </p>
            )}
            {errors.departmentId && (
              <p className="text-red-600 text-sm mt-2 flex items-center gap-1">
                <span>⚠️</span>
                <span>{errors.departmentId.message as string}</span>
              </p>
            )}
          </div>

          {/* Bio */}
          <div>
            <label className="block text-sm font-bold text-gray-900 mb-2 flex items-center gap-2">
              <span className="text-teal-600">📄</span>
              <span>نبذة عن الطبيب (اختياري)</span>
            </label>
            <textarea 
              rows={4} 
              className={`w-full border-2 rounded-xl px-4 py-3 transition-all duration-300 bg-white/70 backdrop-blur-sm focus:border-teal-500 focus:ring-2 focus:ring-teal-200 hover:border-gray-300 resize-none ${
                errors.bio ? 'border-red-300 focus:border-red-500 focus:ring-red-200' : 'border-gray-200'
              }`}
              placeholder="أدخل نبذة عن الطبيب..."
              {...register('bio')} 
            />
            {errors.bio && (
              <p className="text-red-600 text-sm mt-2 flex items-center gap-1">
                <span>⚠️</span>
                <span>{errors.bio.message as string}</span>
              </p>
            )}
          </div>

          {/* Action Buttons */}
          <div className="pt-4 flex items-center justify-end gap-3">
            <button 
              type="button" 
              onClick={onClose} 
              className="px-6 py-3 rounded-xl border-2 border-gray-300 text-gray-700 font-semibold hover:bg-gray-50 hover:border-gray-400 transition-all duration-300 hover:scale-105"
            >
              إلغاء
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-8 py-3 rounded-xl bg-gradient-to-r from-teal-500 to-cyan-500 text-white font-bold shadow-lg shadow-teal-500/30 hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center gap-2"
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


