import { apiClient } from './client';

export interface User {
  id: number;
  email: string;
  role: 'PATIENT' | 'DOCTOR';
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  profile?: {
    firstName: string;
    lastName: string;
    phone: string;
    address: string;
  };
  name?: string;
}

export interface CreateUserDto {
  email: string;
  password: string;
  role: 'PATIENT' | 'DOCTOR';
  firstName: string;
  lastName: string;
  phone: string;
  address: string;
}

export interface UpdateUserDto {
  email?: string;
  password?: string;
  role?: 'PATIENT' | 'DOCTOR';
  firstName?: string;
  lastName?: string;
  phone?: string;
  address?: string;
  isActive?: boolean;
}

export interface UsersQuery {
  page?: number;
  limit?: number;
  role?: string;
  isActive?: boolean;
  search?: string;
}

export const usersService = {
  // جلب جميع المستخدمين
  getUsers: (query: UsersQuery = {}): Promise<{ users: User[]; total: number; page: number; limit: number; totalPages: number }> => {
    const params = new URLSearchParams();
    if (query.page) params.append('page', query.page.toString());
    if (query.limit) params.append('limit', query.limit.toString());
    if (query.role) params.append('role', query.role);
    if (query.isActive !== undefined) params.append('isActive', query.isActive.toString());
    if (query.search) params.append('search', query.search);

    return apiClient.get(`/users?${params.toString()}`);
  },

  // جلب مستخدم واحد
  getUser: (id: number): Promise<User> => {
    return apiClient.get(`/users/${id}`);
  },

  // إنشاء مستخدم جديد
  createUser: (userData: CreateUserDto): Promise<User> => {
    return apiClient.post('/users', userData);
  },

  // تحديث مستخدم
  updateUser: (id: number, userData: UpdateUserDto): Promise<User> => {
    return apiClient.put(`/users/${id}`, userData);
  },

  // حذف مستخدم
  deleteUser: (id: number): Promise<{ success: boolean }> => {
    return apiClient.delete(`/users/${id}`);
  },

  // تفعيل/إلغاء تفعيل مستخدم
  toggleUserStatus: (id: number, isActive: boolean): Promise<User> => {
    return apiClient.patch(`/users/${id}/status`, { isActive });
  },

  // إحصائيات المستخدمين
  getUsersStats: (): Promise<{
    totalUsers: number;
    usersByRole: Array<{ role: string; count: number }>;
    activeUsers: number;
    inactiveUsers: number;
  }> => {
    return apiClient.get('/users/stats');
  },
};
