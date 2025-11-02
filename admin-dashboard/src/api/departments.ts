import apiClient from './client'
import type {
  Department,
  CreateDepartmentRequest,
  UpdateDepartmentRequest,
} from '../types'

export const departmentsApi = {
  // الحصول على جميع الأقسام
  getAll: async (): Promise<Department[]> => {
    const response = await apiClient.get('/admin/departments')
    const list = response.data || []
    return (Array.isArray(list) ? list : []).map((d: any) => ({
      id: d._id || d.id,
      name: d.name,
      description: d.description,
      logoPath: d.logoUrl || d.logoPath,
      isActive: Boolean(d.isActive),
      createdAt: d.createdAt,
      updatedAt: d.updatedAt,
    }))
  },

  // الحصول على قسم واحد
  getById: async (id: string): Promise<Department> => {
    const response = await apiClient.get(`/admin/departments/${id}`)
    const d = response.data
    return {
      id: d._id || d.id,
      name: d.name,
      description: d.description,
      logoPath: d.logoUrl || d.logoPath,
      isActive: Boolean(d.isActive),
      createdAt: d.createdAt,
      updatedAt: d.updatedAt,
    }
  },

  // إنشاء قسم جديد (مع رفع صورة)
  create: async (data: CreateDepartmentRequest): Promise<Department> => {
    const formData = new FormData()
    formData.append('name', data.name)
    if (data.description) formData.append('description', data.description)
    if (data.logo) formData.append('logo', data.logo)

    const response = await apiClient.post('/admin/departments', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    const d = response.data
    return {
      id: d._id || d.id,
      name: d.name,
      description: d.description,
      logoPath: d.logoUrl || d.logoPath,
      isActive: Boolean(d.isActive),
      createdAt: d.createdAt,
      updatedAt: d.updatedAt,
    }
  },

  // تحديث قسم
  update: async (id: string, data: UpdateDepartmentRequest): Promise<Department> => {
    const formData = new FormData()
    if (data.name) formData.append('name', data.name)
    if (data.description) formData.append('description', data.description)
    if (data.logo) formData.append('logo', data.logo)
    if (data.isActive !== undefined) formData.append('isActive', String(data.isActive))

    const response = await apiClient.patch(`/admin/departments/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    const d = response.data
    return {
      id: d._id || d.id,
      name: d.name,
      description: d.description,
      logoPath: d.logoUrl || d.logoPath,
      isActive: Boolean(d.isActive),
      createdAt: d.createdAt,
      updatedAt: d.updatedAt,
    }
  },

  // حذف قسم
  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/admin/departments/${id}`)
  },
}

