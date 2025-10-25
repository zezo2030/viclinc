import { apiClient } from './client';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  phone: string;
  role?: 'PATIENT' | 'DOCTOR';
}

export interface AuthResponse {
  access_token: string;
  user: {
    id: string;
    email: string;
    name?: string;
    phone?: string;
    role: string;
  };
}

export interface User {
  id: string;
  email: string;
  name?: string;  // الاسم الكامل (firstName + lastName)
  firstName?: string;
  lastName?: string;
  role: string;
  phone?: string;
  createdAt?: string;
  updatedAt?: string;
}

export const authApi = {
  // تسجيل الدخول
  login: async (credentials: LoginRequest): Promise<AuthResponse> => {
    return apiClient.post<AuthResponse>('/auth/login', credentials);
  },

  // تسجيل مستخدم جديد
  register: async (userData: RegisterRequest): Promise<User> => {
    return apiClient.post<User>('/auth/register/patient', userData);
  },

  // التحقق من صحة التوكن
  verifyToken: async (): Promise<User> => {
    return apiClient.get<User>('/auth/profile');
  },

  // تحديث بيانات المستخدم
  updateProfile: async (userData: Partial<User>): Promise<User> => {
    return apiClient.put<User>('/auth/profile', userData);
  },

  // تغيير كلمة المرور
  changePassword: async (data: {
    currentPassword: string;
    newPassword: string;
  }): Promise<{ message: string }> => {
    return apiClient.put<{ message: string }>('/auth/change-password', data);
  },

  // طلب إعادة تعيين كلمة المرور
  requestPasswordReset: async (email: string): Promise<{ message: string }> => {
    return apiClient.post<{ message: string }>('/auth/forgot-password', { email });
  },

  // إعادة تعيين كلمة المرور
  resetPassword: async (data: {
    token: string;
    newPassword: string;
  }): Promise<{ message: string }> => {
    return apiClient.post<{ message: string }>('/auth/reset-password', data);
  },
};
