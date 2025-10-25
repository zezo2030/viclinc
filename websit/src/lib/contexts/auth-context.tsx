'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authApi } from '../api/auth';
import { useIsClient } from '../utils/client-only';
import type { AuthContextType, User, LoginRequest, RegisterRequest } from '../../types';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const isClient = useIsClient();

  // التحقق من وجود token عند تحميل التطبيق
  useEffect(() => {
    if (!isClient) return;

    const initAuth = async () => {
      const storedToken = localStorage.getItem('auth_token');
      const storedUser = localStorage.getItem('auth_user');

      if (storedToken && storedUser) {
        try {
          const userData = JSON.parse(storedUser);
          setToken(storedToken);
          setUser(userData);
          // التحقق من صحة التوكن
          await authApi.verifyToken();
        } catch (error) {
          console.log('Token validation failed:', error);
          // مسح البيانات فقط إذا كان التوكن منتهي الصلاحية أو غير صالح
          if ((error as any).message?.includes('401') || (error as any).message?.includes('غير مصرح') || (error as any).message?.includes('Unauthorized')) {
            clearAuthData();
          }
        }
      } else {
        clearAuthData();
      }
      setIsLoading(false);
    };

    // الاستماع إلى logout events من API client
    const handleLogout = () => {
      clearAuthData();
    };

    window.addEventListener('auth:logout', handleLogout);
    initAuth();

    // تنظيف event listener
    return () => {
      window.removeEventListener('auth:logout', handleLogout);
    };
  }, [isClient]);

  // حفظ البيانات في localStorage وضبط cookie للتزامن
  const saveAuthData = (token: string, user: User) => {
    if (isClient) {
      localStorage.setItem('auth_token', token);
      localStorage.setItem('auth_user', JSON.stringify(user));
      
      // ضبط cookie للتزامن مع الباك إند
      document.cookie = `auth_token=${token}; path=/; max-age=${7 * 24 * 60 * 60}; SameSite=Lax`;
    }
    setToken(token);
    setUser(user);
  };

  // مسح البيانات من localStorage وcookies
  const clearAuthData = () => {
    if (isClient) {
      // مسح جميع البيانات المتعلقة بالمصادقة
      localStorage.removeItem('auth_token');
      localStorage.removeItem('auth_user');
      
      // مسح cookie أيضاً
      document.cookie = 'auth_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
      
      // مسح أي بيانات أخرى قد تكون محفوظة
      const keysToRemove = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && (key.startsWith('auth_') || key.startsWith('user_'))) {
          keysToRemove.push(key);
        }
      }
      keysToRemove.forEach(key => localStorage.removeItem(key));
    }
    setToken(null);
    setUser(null);
  };

  // تسجيل الدخول
  const login = async (credentials: LoginRequest): Promise<void> => {
    try {
      setIsLoading(true);
      const response = await authApi.login(credentials);
      saveAuthData(response.access_token, response.user);
    } catch (error) {
      setIsLoading(false);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // التسجيل
  const register = async (userData: RegisterRequest): Promise<void> => {
    try {
      setIsLoading(true);
      // إضافة role='PATIENT' تلقائياً
      const response = await authApi.register({ 
        name: `${userData.firstName} ${userData.lastName}`,
        email: userData.email,
        password: userData.password,
        phone: userData.phone || '',
        role: 'PATIENT'
      });
      // بعد التسجيل الناجح، قم بتسجيل الدخول التلقائي
      await login({ email: userData.email, password: userData.password });
    } catch (error) {
      setIsLoading(false);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // تسجيل الخروج
  const logout = (): void => {
    clearAuthData();
    
    // تأكيد إضافي لمسح البيانات
    if (isClient) {
      // إرسال event لإعلام المكونات الأخرى بتسجيل الخروج
      window.dispatchEvent(new CustomEvent('auth:logout'));
      
      // مسح sessionStorage أيضاً إذا كان مستخدماً
      sessionStorage.clear();
    }
  };

  const value: AuthContextType = {
    user,
    token,
    login,
    register,
    logout,
    isLoading,
    isAuthenticated: !!user && !!token,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Hook لاستخدام Auth Context
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
