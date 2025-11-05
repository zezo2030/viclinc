import apiClient from './client'
import type {
  Service,
  CreateServiceRequest,
  UpdateServiceRequest,
  DepartmentDetails,
} from '../types/service.types'

export const servicesApi = {
  // الحصول على جميع الخدمات مع فلترة حسب القسم
  getAll: async (departmentId?: string): Promise<Service[]> => {
    const params = departmentId ? { departmentId } : {}
    const response = await apiClient.get('/admin/services', { params })
    const list = response.data || []
    return (Array.isArray(list) ? list : []).map((s: any) => ({
      id: s._id || s.id,
      name: s.name,
      description: s.description,
      departmentId: s.departmentId?._id || s.departmentId || s.departmentId?.toString(),
      basePrice: s.basePrice || s.defaultPrice,
      baseDuration: s.baseDuration || s.defaultDurationMin,
      defaultPrice: s.defaultPrice || s.basePrice,
      defaultDurationMin: s.defaultDurationMin || s.baseDuration,
      isActive: Boolean(s.isActive),
      createdAt: s.createdAt,
      updatedAt: s.updatedAt,
    }))
  },

  // الحصول على خدمة واحدة
  getById: async (id: string): Promise<Service> => {
    const response = await apiClient.get(`/admin/services/${id}`)
    const s = response.data
    return {
      id: s._id || s.id,
      name: s.name,
      description: s.description,
      departmentId: s.departmentId?._id || s.departmentId || s.departmentId?.toString(),
      basePrice: s.basePrice || s.defaultPrice,
      baseDuration: s.baseDuration || s.defaultDurationMin,
      defaultPrice: s.defaultPrice || s.basePrice,
      defaultDurationMin: s.defaultDurationMin || s.baseDuration,
      isActive: Boolean(s.isActive),
      createdAt: s.createdAt,
      updatedAt: s.updatedAt,
    }
  },

  // الحصول على الخدمات حسب القسم
  getByDepartment: async (departmentId: string): Promise<Service[]> => {
    return servicesApi.getAll(departmentId)
  },

  // إنشاء خدمة جديدة
  create: async (data: CreateServiceRequest): Promise<Service> => {
    const response = await apiClient.post('/admin/services', {
      name: data.name,
      departmentId: data.departmentId,
      description: data.description,
      defaultPrice: data.defaultPrice,
      defaultDurationMin: data.defaultDurationMin,
      isActive: data.isActive !== undefined ? data.isActive : true,
    })
    const s = response.data
    return {
      id: s._id || s.id,
      name: s.name,
      description: s.description,
      departmentId: s.departmentId?._id || s.departmentId || s.departmentId?.toString(),
      basePrice: s.basePrice || s.defaultPrice,
      baseDuration: s.baseDuration || s.defaultDurationMin,
      defaultPrice: s.defaultPrice || s.basePrice,
      defaultDurationMin: s.defaultDurationMin || s.baseDuration,
      isActive: Boolean(s.isActive),
      createdAt: s.createdAt,
      updatedAt: s.updatedAt,
    }
  },

  // تحديث خدمة
  update: async (id: string, data: UpdateServiceRequest): Promise<Service> => {
    const payload: any = {}
    if (data.name !== undefined) payload.name = data.name
    if (data.description !== undefined) payload.description = data.description
    if (data.departmentId !== undefined) payload.departmentId = data.departmentId
    if (data.defaultPrice !== undefined) payload.defaultPrice = data.defaultPrice
    if (data.defaultDurationMin !== undefined) payload.defaultDurationMin = data.defaultDurationMin
    if (data.isActive !== undefined) payload.isActive = data.isActive

    const response = await apiClient.patch(`/admin/services/${id}`, payload)
    const s = response.data
    return {
      id: s._id || s.id,
      name: s.name,
      description: s.description,
      departmentId: s.departmentId?._id || s.departmentId || s.departmentId?.toString(),
      basePrice: s.basePrice || s.defaultPrice,
      baseDuration: s.baseDuration || s.defaultDurationMin,
      defaultPrice: s.defaultPrice || s.basePrice,
      defaultDurationMin: s.defaultDurationMin || s.baseDuration,
      isActive: Boolean(s.isActive),
      createdAt: s.createdAt,
      updatedAt: s.updatedAt,
    }
  },

  // حذف خدمة
  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/admin/services/${id}`)
  },
}

// API للحصول على تفاصيل القسم مع الخدمات والأطباء
export const departmentsDetailsApi = {
  getDetails: async (departmentId: string): Promise<DepartmentDetails> => {
    const response = await apiClient.get(`/admin/departments/${departmentId}/details`)
    const d = response.data
    return {
      _id: d._id || d.id,
      id: d._id || d.id,
      name: d.name,
      description: d.description,
      logoPath: d.logoPath,
      logoUrl: d.logoUrl,
      icon: d.icon,
      isActive: Boolean(d.isActive),
      doctors: d.doctors || [],
      services: (d.services || []).map((s: any) => ({
        id: s._id || s.id,
        name: s.name,
        description: s.description,
        departmentId: s.departmentId?._id || s.departmentId || s.departmentId?.toString(),
        basePrice: s.basePrice || s.defaultPrice,
        baseDuration: s.baseDuration || s.defaultDurationMin,
        defaultPrice: s.defaultPrice || s.basePrice,
        defaultDurationMin: s.defaultDurationMin || s.baseDuration,
        isActive: Boolean(s.isActive),
        createdAt: s.createdAt,
        updatedAt: s.updatedAt,
      })),
      createdAt: d.createdAt,
      updatedAt: d.updatedAt,
    }
  },
}

