// تنظيف API_BASE_URL من /v1 في النهاية إذا كان موجوداً
const getBaseURL = (): string => {
  // Use nginx proxy in production (when running in Docker), direct API in development
  const url = process.env.NEXT_PUBLIC_API_URL || (typeof window !== 'undefined' && window.location.origin === 'http://localhost' ? 'http://localhost/api' : 'http://localhost:3000');
  // إزالة /v1 من النهاية إذا كان موجوداً
  return url.replace(/\/v1\/?$/, '').replace(/\/api\/?$/, '/api');
};

const API_BASE_URL = getBaseURL();

// دالة للحصول على JWT token من localStorage
const getAuthToken = (): string | null => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('auth_token');
  }
  return null;
};

class ApiClient {
  private baseURL: string;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
  }

  async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    // إذا كان baseURL يحتوي على /api، لا نضيف /v1 (nginx سيقوم بـ rewrite)
    // إذا كان baseURL يحتوي على localhost:3000، نضيف /v1
    let normalizedEndpoint = endpoint;
    const isUsingNginxProxy = this.baseURL.includes('/api');
    
    if (!isUsingNginxProxy) {
      // Development mode: add /v1 prefix
      if (!normalizedEndpoint.startsWith('/v1/')) {
        normalizedEndpoint = normalizedEndpoint.startsWith('/') 
          ? `/v1${normalizedEndpoint}` 
          : `/v1/${normalizedEndpoint}`;
      }
    } else {
      // Production mode with nginx: use endpoint as-is (nginx will rewrite /api/* to /v1/*)
      if (!normalizedEndpoint.startsWith('/')) {
        normalizedEndpoint = `/${normalizedEndpoint}`;
      }
    }
    const url = `${this.baseURL}${normalizedEndpoint}`;

    // الحصول على التوكن
    const token = getAuthToken();

    // إعداد headers مع إضافة JWT token إذا كان موجوداً
    const providedHeaders =
      options.headers instanceof Headers
        ? Object.fromEntries(options.headers.entries())
        : ((options.headers as Record<string, string>) || {});

    const isFormDataBody = typeof FormData !== 'undefined' && options.body instanceof FormData;

    const headers: Record<string, string> = {
      ...providedHeaders,
    };

    const contentTypeKey = Object.keys(headers).find((key) => key.toLowerCase() === 'content-type');

    if (isFormDataBody) {
      // اترك المتصفح يحدد Content-Type عندما نرسل FormData
      if (contentTypeKey) {
        delete headers[contentTypeKey];
      }
    } else if (!contentTypeKey) {
      headers['Content-Type'] = 'application/json';
    }

    // إضافة Authorization header إذا كان التوكن موجوداً
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const config: RequestInit = {
      credentials: 'include', // مهم لإرسال واستقبال cookies
      ...options,
      headers,
    };

    try {
      const response = await fetch(url, config);

      // التعامل مع حالة 401 (غير مصرح)
      if (response.status === 401) {
        // مسح التوكن إذا كان غير صالح
        if (typeof window !== 'undefined') {
          localStorage.removeItem('auth_token');
          localStorage.removeItem('auth_user');
          // إطلاق event للـ logout
          window.dispatchEvent(new CustomEvent('auth:logout'));
        }
        throw new Error('غير مصرح - يرجى تسجيل الدخول مرة أخرى');
      }

      if (!response.ok) {
        const errorText = await response.text();
        console.error('API Error:', response.status, errorText);
        throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  async get<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'GET' });
  }

  async post<T>(endpoint: string, data?: any, options?: { headers?: Record<string, string> }): Promise<T> {
    const isFormData = typeof FormData !== 'undefined' && data instanceof FormData;
    const body = isFormData ? data : data !== undefined ? JSON.stringify(data) : undefined;
    return this.request<T>(endpoint, {
      method: 'POST',
      body,
      headers: options?.headers,
    });
  }

  async put<T>(endpoint: string, data?: any): Promise<T> {
    const isFormData = typeof FormData !== 'undefined' && data instanceof FormData;
    const body = isFormData ? data : data !== undefined ? JSON.stringify(data) : undefined;
    return this.request<T>(endpoint, {
      method: 'PUT',
      body,
    });
  }

  async patch<T>(endpoint: string, data?: any): Promise<T> {
    const isFormData = typeof FormData !== 'undefined' && data instanceof FormData;
    const body = isFormData ? data : data !== undefined ? JSON.stringify(data) : undefined;
    return this.request<T>(endpoint, {
      method: 'PATCH',
      body,
    });
  }

  async delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }
}

export const apiClient = new ApiClient(API_BASE_URL);
