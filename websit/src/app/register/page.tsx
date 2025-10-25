'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/contexts/auth-context';
import { RegisterForm } from '@/components/auth/RegisterForm';

export default function RegisterPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    // إعادة توجيه إلى dashboard إذا كان المستخدم مصادق بالفعل
    if (isAuthenticated) {
      router.push('/dashboard');
    }
  }, [isAuthenticated, router]);

  const handleRegisterSuccess = () => {
    router.push('/dashboard');
  };

  if (isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900">
            تسجيل مريض جديد
          </h2>
          <p className="mt-2 text-gray-600">
            سجل الآن للحصول على استشارات طبية
          </p>
          <p className="mt-1 text-sm text-gray-500">
            أو{' '}
            <a
              href="/login"
              className="text-primary-600 hover:text-primary-500 font-medium"
            >
              تسجيل الدخول
            </a>
          </p>
        </div>

        <RegisterForm onSuccess={handleRegisterSuccess} />
      </div>
    </div>
  );
}
