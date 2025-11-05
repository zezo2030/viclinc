// تنظيف API_BASE_URL من /v1 في النهاية إذا كان موجوداً
const getBaseURL = (): string => {
  const url = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
  // إزالة /v1 من النهاية إذا كان موجوداً
  return url.replace(/\/v1\/?$/, '');
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
    // إضافة /v1 prefix إذا لم يكن موجوداً
    let normalizedEndpoint = endpoint;
    if (!normalizedEndpoint.startsWith('/v1/')) {
      normalizedEndpoint = normalizedEndpoint.startsWith('/') 
        ? `/v1${normalizedEndpoint}` 
        : `/v1/${normalizedEndpoint}`;
    }
    const url = `${this.baseURL}${normalizedEndpoint}`;

    // الحصول على التوكن
    const token = getAuthToken();

    // إعداد headers مع إضافة JWT token إذا كان موجوداً
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    };

    // إضافة Authorization header إذا كان التوكن موجوداً
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const config: RequestInit = {
      headers,
      credentials: 'include', // مهم لإرسال واستقبال cookies
      ...options,
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

  async post<T>(endpoint: string, data: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async put<T>(endpoint: string, data: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async patch<T>(endpoint: string, data: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }
}

export const apiClient = new ApiClient(API_BASE_URL);
