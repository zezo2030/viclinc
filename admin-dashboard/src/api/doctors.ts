import apiClient from './client'
import type { PaginatedResponse, SearchParams } from '../types'
import type {
  DoctorProfile,
  UpdateDoctorRequest,
  UpdateDoctorStatusRequest,
} from '../types'
import type { AdminCreateDoctorRequest } from '@/types/doctor.types'

export const doctorsApi = {
  // الحصول على جميع الأطباء
  getAll: async (params?: SearchParams): Promise<PaginatedResponse<DoctorProfile>> => {
    const response = await apiClient.get('/admin/doctors', { params })
    const raw = response.data

    const mapOne = (d: any): DoctorProfile => ({
      id: d._id || d.id,
      userId: d.userId || d.user?.id || d.user?._id,
      name: d.name || d.user?.name,
      email: d.email || d.user?.email,
      phone: d.phone || d.user?.phone,
      licenseNumber: d.licenseNumber,
      yearsOfExperience: d.yearsOfExperience,
      departmentId: d.departmentId || d.department?.id || d.department?._id,
      photos: d.photos || [],
      bio: d.bio,
      status: d.status,
      createdAt: d.createdAt,
      updatedAt: d.updatedAt,
    })

    // إذا رجع الباك إند مصفوفة
    if (Array.isArray(raw)) {
      const mapped = raw.map(mapOne)
      const page = (params as any)?.page || 1
      const limit = (params as any)?.limit || mapped.length
      const total = mapped.length
      return { data: mapped, meta: { total, page, limit, totalPages: Math.max(1, Math.ceil(total / limit)) } }
    }

    // إذا رجع كائن يحتوي data (أو doctors) ومعلومات صفحات
    const dataArray = Array.isArray(raw?.data)
      ? raw.data
      : Array.isArray(raw?.doctors)
      ? raw.doctors
      : []
    if (dataArray.length) {
      const mapped = dataArray.map(mapOne)
      const page = raw?.meta?.page || raw?.pagination?.page || raw?.page || (params as any)?.page || 1
      const limit = raw?.meta?.limit || raw?.pagination?.limit || raw?.limit || (params as any)?.limit || mapped.length
      const total = raw?.meta?.total || raw?.pagination?.total || raw?.total || mapped.length
      const totalPages = raw?.meta?.totalPages || raw?.pagination?.totalPages || raw?.totalPages || Math.max(1, Math.ceil(total / limit))
      return { data: mapped, meta: { total, page, limit, totalPages } }
    }

    // fallback آمن
    return { data: [], meta: { total: 0, page: 1, limit: 10, totalPages: 0 } }
  },

  // الحصول على طبيب واحد
  getById: async (id: string): Promise<DoctorProfile> => {
    const response = await apiClient.get(`/admin/doctors/${id}`)
    return response.data
  },

  // إنشاء طبيب جديد (يدعم JSON أو FormData)
  create: async (data: AdminCreateDoctorRequest | FormData): Promise<DoctorProfile> => {
    const response = await apiClient.post('/admin/doctors', data)
    return response.data
  },

  // تحديث طبيب
  update: async (id: string, data: UpdateDoctorRequest): Promise<DoctorProfile> => {
    const response = await apiClient.patch(`/admin/doctors/${id}`, data)
    return response.data
  },

  // تحديث حالة الطبيب
  updateStatus: async (
    id: string,
    data: UpdateDoctorStatusRequest
  ): Promise<DoctorProfile> => {
    const response = await apiClient.patch(`/admin/doctors/${id}/status`, data)
    return response.data
  },

  // حذف طبيب
  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/admin/doctors/${id}`)
  },

  // الحصول على جدول الطبيب
  getSchedule: async (id: string) => {
    const response = await apiClient.get(`/admin/doctors/${id}/schedule`)
    return response.data
  },

  // الحصول على مواعيد الطبيب
  getAppointments: async (id: string, params?: any) => {
    const response = await apiClient.get(`/admin/doctors/${id}/appointments`, { params })
    return response.data
  },
}

