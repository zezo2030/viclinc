'use client';

import React from 'react';
import { useAuth } from '@/lib/contexts/auth-context';
import { AuthModal } from './AuthModal';

interface ProtectedRouteProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  requiredRole?: 'PATIENT' | 'DOCTOR';
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  fallback,
  requiredRole
}) => {
  const { isAuthenticated, isLoading, user } = useAuth();
  const [showAuthModal, setShowAuthModal] = React.useState(false);

  // إظهار loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  // التحقق من المصادقة
  if (!isAuthenticated) {
    if (fallback) {
      return <>{fallback}</>;
    }

    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full space-y-8 p-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              يرجى تسجيل الدخول
            </h2>
            <p className="text-gray-600 mb-8">
              تحتاج إلى تسجيل الدخول للوصول إلى هذا المحتوى
            </p>
            <button
              onClick={() => setShowAuthModal(true)}
              className="bg-primary-600 hover:bg-primary-700 text-white font-medium py-2 px-4 rounded-md transition-colors"
            >
              تسجيل الدخول
            </button>
          </div>
        </div>

        <AuthModal
          isOpen={showAuthModal}
          onClose={() => setShowAuthModal(false)}
          defaultMode="login"
        />
      </div>
    );
  }

  // التحقق من الدور المطلوب
  if (requiredRole && user?.role !== requiredRole) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full space-y-8 p-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              غير مسموح
            </h2>
            <p className="text-gray-600 mb-8">
              لا تملك صلاحية الوصول إلى هذا المحتوى
            </p>
            <button
              onClick={() => window.history.back()}
              className="bg-gray-600 hover:bg-gray-700 text-white font-medium py-2 px-4 rounded-md transition-colors"
            >
              العودة
            </button>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};
