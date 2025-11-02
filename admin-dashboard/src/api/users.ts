import apiClient from './client'
import type {
  User,
  CreateUserRequest,
  UpdateUserRequest,
  UpdateUserRoleRequest,
  UpdateUserStatusRequest,
  UsersQueryParams,
  UsersResponse,
} from '../types'

export const usersApi = {
  // الحصول على جميع المستخدمين
  getAll: async (params?: UsersQueryParams): Promise<UsersResponse> => {
    const response = await apiClient.get('/admin/users', { params })
    // Backend يرجع { users, total, page, limit, totalPages }
    // نحتاج تحويله إلى { data, pagination }
    const backendData = response.data
    // تحويل _id إلى id لكل مستخدم (MongoDB يستخدم _id)
    const users = (backendData.users || []).map((user: any) => {
      const userId = user._id?.toString() || user.id?.toString()
      if (!userId) {
        console.warn('User missing ID:', user)
      }
      return {
        ...user,
        id: userId || user._id || user.id,
      }
    })
    
    return {
      data: users,
      pagination: {
        page: backendData.page || 1,
        limit: backendData.limit || 10,
        total: backendData.total || 0,
        totalPages: backendData.totalPages || 0,
      },
    }
  },

  // الحصول على مستخدم واحد
  getById: async (id: string): Promise<User> => {
    const response = await apiClient.get(`/admin/users/${id}`)
    const user = response.data.user || response.data
    // تحويل _id إلى id
    return {
      ...user,
      id: user._id || user.id,
      _id: undefined,
    }
  },

  // إنشاء مستخدم جديد
  create: async (data: CreateUserRequest): Promise<User> => {
    const response = await apiClient.post('/admin/users', data)
    const user = response.data.user || response.data
    // تحويل _id إلى id
    return {
      ...user,
      id: user._id || user.id,
      _id: undefined,
    }
  },

  // تحديث مستخدم
  update: async (id: string, data: UpdateUserRequest): Promise<User> => {
    const response = await apiClient.patch(`/admin/users/${id}`, data)
    const user = response.data.user || response.data
    // تحويل _id إلى id
    return {
      ...user,
      id: user._id || user.id,
      _id: undefined,
    }
  },

  // تحديث دور المستخدم
  updateRole: async (id: string, role: string): Promise<User> => {
    const response = await apiClient.patch(`/admin/users/${id}/role`, { role })
    const user = response.data.user || response.data
    // تحويل _id إلى id
    return {
      ...user,
      id: user._id || user.id,
      _id: undefined,
    }
  },

  // تحديث حالة المستخدم
  updateStatus: async (id: string, status: string): Promise<User> => {
    if (!id) {
      throw new Error('User ID is required')
    }
    
    const response = await apiClient.patch(`/admin/users/${id}/status`, { status })
    // Backend يرجع { user: ..., message: ..., reason: ... }
    const user = response.data?.user || response.data
    if (!user) {
      throw new Error('No user data in response')
    }
    // تحويل _id إلى id
    const userId = user._id?.toString() || user.id?.toString()
    return {
      ...user,
      id: userId || user._id || user.id,
    }
  },

  // حذف مستخدم (وضع علامة للحذف)
  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/admin/users/${id}`)
  },

  // حذف نهائي للمستخدم (Hard Delete)
  deleteHard: async (
    id: string, 
    payload?: { 
      reason?: string; 
      purgeRelated?: boolean; 
      anonymize?: boolean 
    }
  ): Promise<{ success: boolean; message: string; userId: string }> => {
    if (!id) {
      throw new Error('User ID is required')
    }
    
    const response = await apiClient.delete(`/admin/users/${id}`, { 
      data: payload || {} 
    })
    return response.data
  },
}

