'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/contexts/auth-context';
import { LoginForm } from '@/components/auth/LoginForm';

export default function LoginPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    // إعادة توجيه إلى dashboard إذا كان المستخدم مصادق بالفعل
    if (isAuthenticated) {
      router.push('/dashboard');
    }
  }, [isAuthenticated, router]);

  const handleLoginSuccess = () => {
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
            تسجيل الدخول إلى حسابك
          </h2>
          <p className="mt-2 text-gray-600">
            أو{' '}
            <a
              href="/register"
              className="text-primary-600 hover:text-primary-500 font-medium"
            >
              إنشاء حساب جديد
            </a>
          </p>
        </div>

        <LoginForm onSuccess={handleLoginSuccess} />
      </div>
    </div>
  );
}
