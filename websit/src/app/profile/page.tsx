'use client';

import React from 'react';
import { ProtectedRoute } from '@/components/auth';
import { useAuth } from '@/lib/contexts/auth-context';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';

export default function ProfilePage() {
  const { user } = useAuth();

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">
              الملف الشخصي
            </h1>
            <p className="mt-2 text-gray-600">
              إدارة معلومات حسابك الشخصية
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* معلومات الحساب */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
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
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                إعدادات الأمان
              </h3>
              <div className="space-y-4">
                <Button variant="outline" className="w-full justify-start">
                  تغيير كلمة المرور
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  تفعيل المصادقة الثنائية
                </Button>
                <Button variant="outline" className="w-full justify-start">
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
