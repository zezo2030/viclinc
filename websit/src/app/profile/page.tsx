'use client';

import React from 'react';
import { ProtectedRoute } from '@/components/auth';
import { useAuth } from '@/lib/contexts/auth-context';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { resolveMediaUrl } from '@/lib/utils/image';

export default function ProfilePage() {
  const { user } = useAuth();
  const avatarUrl = resolveMediaUrl(user?.avatar);
  const initials = user?.name?.charAt(0) || user?.email?.charAt(0) || 'U';

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              الملف الشخصي
            </h1>
            <p className="text-gray-600">
              إدارة معلومات حسابك الشخصية وإعداداتك
            </p>
          </div>

          <div className="flex flex-col items-center text-center mb-12">
            <div className="w-28 h-28 rounded-full border-4 border-white shadow-lg overflow-hidden bg-gradient-to-br from-primary-100 to-primary-200 flex items-center justify-center">
              {avatarUrl ? (
                <img src={avatarUrl} alt={user?.name || 'الصورة الشخصية'} className="w-full h-full object-cover" />
              ) : (
                <span className="text-3xl font-semibold text-primary-700">{initials}</span>
              )}
            </div>
            <h2 className="mt-4 text-2xl font-semibold text-gray-900">{user?.name || 'مستخدم'}</h2>
            <p className="text-gray-500">{user?.email}</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* معلومات الحساب */}
            <Card className="p-6 border-2 border-gray-100">
              <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <div className="w-10 h-10 rounded-full gradient-medical-light flex items-center justify-center">
                  <svg className="w-5 h-5 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                معلومات الحساب
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    الاسم الكامل
                  </label>
                  <Input
                    type="text"
                    defaultValue={user?.name || ''}
                    disabled
                    className="bg-gray-50"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    البريد الإلكتروني
                  </label>
                  <Input
                    type="email"
                    defaultValue={user?.email}
                    disabled
                    className="bg-gray-50"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    رقم الهاتف
                  </label>
                  <Input
                    type="tel"
                    defaultValue={user?.phone || ''}
                    disabled
                    className="bg-gray-50"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    الدور
                  </label>
                  <Input
                    type="text"
                    defaultValue={user?.role?.toLowerCase() || ''}
                    disabled
                    className="bg-gray-50 capitalize"
                  />
                </div>
              </div>
            </Card>

            {/* إعدادات الأمان */}
            <Card className="p-6 border-2 border-gray-100">
              <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <div className="w-10 h-10 rounded-full gradient-medical-light flex items-center justify-center">
                  <svg className="w-5 h-5 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                إعدادات الأمان
              </h3>
              <div className="space-y-3">
                <Button variant="outline" className="w-full justify-start border-2 border-primary-200 text-primary-600 hover:bg-primary-50">
                  تغيير كلمة المرور
                </Button>
                <Button variant="outline" className="w-full justify-start border-2 border-secondary-200 text-secondary-600 hover:bg-secondary-50">
                  تفعيل المصادقة الثنائية
                </Button>
                <Button variant="outline" className="w-full justify-start border-2 border-gray-200 text-gray-600 hover:bg-gray-50">
                  إدارة الأجهزة المتصلة
                </Button>
              </div>
            </Card>
          </div>

          {/* سجل النشاط */}
          <Card className="mt-8 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              سجل النشاط الأخير
            </h3>
            <div className="text-center text-gray-500 py-8">
              <p>لا توجد أنشطة حديثة</p>
            </div>
          </Card>
        </div>
      </div>
    </ProtectedRoute>
  );
}
