import axios from 'axios'
import type { AxiosError, AxiosResponse, InternalAxiosRequestConfig } from 'axios'
import { API_URL } from '@/utils/constants'

// إنشاء Axios instance
const apiClient = axios.create({
  baseURL: API_URL,
  timeout: 30000, // 30 seconds
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
})

// Request interceptor
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // إضافة التوكن إلى كل طلب
    const token = localStorage.getItem('access_token')
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`
    }

    // إضافة اللغة
    const language = localStorage.getItem('language') || 'ar'
    if (config.headers) {
      config.headers['Accept-Language'] = language
    }

    return config
  },
  (error: AxiosError) => {
    return Promise.reject(error)
  }
)

// Response interceptor
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    return response
  },
  async (error: AxiosError) => {
    // معالجة الأخطاء
    if (error.response) {
      const { status } = error.response

      switch (status) {
        case 401:
          // Unauthorized - تنظيف البيانات فقط، لا نعيد التوجيه هنا
          // لأن login page سيتعامل مع ذلك
          // لا نستخدم window.location.href لأنها تسبب refresh كامل
          const currentPath = window.location.pathname
          if (currentPath !== '/login') {
            // فقط إذا لم نكن في صفحة login، ننظف البيانات
            localStorage.removeItem('access_token')
            localStorage.removeItem('user')
            // نستخدم navigate بدلاً من window.location.href
            // لكن في interceptor لا يمكننا استخدام navigate مباشرة
            // لذا نستخدم event custom
            window.dispatchEvent(new CustomEvent('auth:logout'))
          }
          break

        case 403:
          // Forbidden - ليس لديك صلاحية
          console.error('ليس لديك صلاحية للوصول لهذا المورد')
          break

        case 404:
          // Not Found
          console.error('المورد غير موجود')
          break

        case 500:
          // Server Error
          console.error('خطأ في الخادم')
          break

        default:
          console.error('حدث خطأ غير متوقع')
      }
    } else if (error.request) {
      // لا يوجد استجابة من الخادم
      const errorMessage = `لا يمكن الاتصال بالخادم. تأكد من أن الخادم الخلفي يعمل على ${API_URL}`
      console.error(errorMessage)
      // إضافة رسالة خطأ مفصلة للـ error object
      if (error.message === 'Network Error') {
        ;(error as any).userMessage = errorMessage
      }
    } else {
      // خطأ في إعداد الطلب
      console.error('خطأ في إعداد الطلب:', error.message)
    }

    return Promise.reject(error)
  }
)

export default apiClient

