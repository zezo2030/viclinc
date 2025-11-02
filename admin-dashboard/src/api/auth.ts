import apiClient from './client'
import type { ApiResponse } from '../types'

// Types
export interface LoginRequest {
  email: string
  password: string
}

export interface LoginResponse {
  access_token: string
  user: {
    id: string
    email: string
    name: string
    phone: string
    role: 'ADMIN' | 'DOCTOR' | 'PATIENT'
  }
}

export interface RegisterPatientRequest {
  name: string
  email: string
  phone: string
  password: string
}

// API Methods
export const authApi = {
  // تسجيل الدخول
  login: async (data: LoginRequest): Promise<LoginResponse> => {
    // تنظيف البيانات قبل الإرسال
    const cleanedData = {
      email: data.email.trim().toLowerCase(),
      password: data.password.trim()
    }
    
    console.log('authApi.login - Request data:', { 
      email: cleanedData.email, 
      passwordLength: cleanedData.password.length,
      originalEmail: data.email,
      originalPasswordLength: data.password.length
    })
    console.log('authApi.login - API URL:', '/auth/login')
    
    try {
      const response = await apiClient.post<any>('/auth/login', cleanedData)
      
      console.log('authApi.login - Full response:', response)
      console.log('authApi.login - Response status:', response.status)
      console.log('authApi.login - Response data:', response.data)
    
      // Backend يعيد الاستجابة مباشرة بدون wrapper: { access_token, user }
      const responseData = response.data
      
      // التحقق من وجود wrapper (response.data.data) - للتوافق مع أنظمة أخرى
      if (responseData?.data && responseData.data.access_token) {
        console.log('authApi.login - Found wrapper format, using data.data')
        return responseData.data as LoginResponse
      }
      
      // الاستجابة المباشرة من Backend (response.data)
      if (responseData?.access_token && responseData?.user) {
        console.log('authApi.login - Found direct format, using response.data')
        return {
          access_token: responseData.access_token,
          user: responseData.user
        } as LoginResponse
      }
      
      // في حالة فشل الحصول على البيانات
      console.error('authApi.login - Invalid response structure:', responseData)
      throw new Error('استجابة غير صحيحة من الخادم: البيانات المطلوبة غير موجودة')
    } catch (error: any) {
      console.error('authApi.login - Error occurred:', {
        message: error.message,
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        code: error.code
      })
      
      // إذا كان 401، نعطي رسالة أوضح
      if (error.response?.status === 401) {
        const errorMessage = error.response?.data?.message || 'البريد الإلكتروني أو كلمة المرور غير صحيحة'
        throw new Error(errorMessage)
      }
      
      // إعادة رمي الخطأ
      throw error
    }
  },

  // تسجيل مريض جديد
  registerPatient: async (data: RegisterPatientRequest): Promise<LoginResponse> => {
    const response = await apiClient.post<ApiResponse<LoginResponse>>(
      '/auth/register/patient',
      data
    )
    return response.data.data
  },

  // تسجيل الخروج
  logout: async (): Promise<void> => {
    localStorage.removeItem('access_token')
    localStorage.removeItem('user')
  },

  // الحصول على المستخدم الحالي
  getCurrentUser: async () => {
    const response = await apiClient.get('/auth/me')
    return response.data
  },
}

