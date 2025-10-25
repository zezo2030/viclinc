'use client';

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { specialtyService } from '@/lib/api/specialties';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { ArrowLeft, Users, Stethoscope, Calendar } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface SpecialtyDetailsProps {
  specialtyId: string;
}

export const SpecialtyDetails: React.FC<SpecialtyDetailsProps> = ({ specialtyId }) => {
  const router = useRouter();

  const { data: specialty, isLoading, error } = useQuery({
    queryKey: ['specialty', specialtyId],
    queryFn: () => specialtyService.getSpecialty(specialtyId),
    staleTime: 5 * 60 * 1000, // 5 دقائق
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">جاري تحميل تفاصيل التخصص...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600 mb-4">حدث خطأ في تحميل تفاصيل التخصص</p>
        <button 
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
        >
          إعادة المحاولة
        </button>
      </div>
    );
  }

  if (!specialty) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">التخصص غير موجود</p>
        <Button 
          onClick={() => router.push('/specialties')}
          className="mt-4"
        >
          العودة إلى التخصصات
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-8">
        <Button
          variant="outline"
          onClick={() => router.push('/specialties')}
          className="mb-4"
        >
          <ArrowLeft className="w-4 h-4 ml-2" />
          العودة إلى التخصصات
        </Button>
        
        <div className="flex items-center space-x-4 space-x-reverse">
          {specialty.icon && (
            <div className="w-20 h-20">
              <img 
                src={specialty.icon.startsWith('/') ? specialty.icon : `/${specialty.icon}`}
                alt={specialty.name}
                className="w-full h-full object-cover rounded-lg"
              />
            </div>
          )}
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{specialty.name}</h1>
            {specialty.description && (
              <p className="text-lg text-gray-600 mt-2">{specialty.description}</p>
            )}
          </div>
        </div>
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Department Info */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">معلومات القسم</h2>
            <div className="space-y-3">
              <div>
                <span className="font-medium text-gray-700">اسم القسم:</span>
                <span className="mr-2 text-gray-900">{specialty.name}</span>
              </div>
              {specialty.description && (
                <div>
                  <span className="font-medium text-gray-700">الوصف:</span>
                  <p className="mr-2 text-gray-900 mt-1">{specialty.description}</p>
                </div>
              )}
              <div>
                <span className="font-medium text-gray-700">الحالة:</span>
                <span className={`mr-2 px-2 py-1 rounded-full text-sm ${
                  specialty.isActive 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
                }`}>
                  {specialty.isActive ? 'نشط' : 'غير نشط'}
                </span>
              </div>
            </div>
          </Card>

          {/* Doctors Section */}
          <Card className="p-6">
            <div className="flex items-center mb-4">
              <Users className="w-5 h-5 text-primary-600 ml-2" />
              <h2 className="text-xl font-semibold text-gray-900">الأطباء</h2>
            </div>
            {(specialty as any).doctors && (specialty as any).doctors.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {(specialty as any).doctors.map((doctor: any) => (
                  <div key={doctor.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                    <h3 className="font-medium text-gray-900">
                      {doctor.user.profile.firstName} {doctor.user.profile.lastName}
                    </h3>
                    <p className="text-sm text-gray-600">{doctor.specialization}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-8">لا يوجد أطباء متاحين حالياً</p>
            )}
          </Card>

          {/* Services Section */}
          <Card className="p-6">
            <div className="flex items-center mb-4">
              <Stethoscope className="w-5 h-5 text-primary-600 ml-2" />
              <h2 className="text-xl font-semibold text-gray-900">الخدمات</h2>
            </div>
            {(specialty as any).services && (specialty as any).services.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {(specialty as any).services.map((service: any, index: number) => (
                  <div key={index} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                    <h3 className="font-medium text-gray-900">{service}</h3>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-8">لا توجد خدمات متاحة حالياً</p>
            )}
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">إجراءات سريعة</h3>
            <div className="space-y-3">
              <Button 
                className="w-full justify-start"
                onClick={() => router.push(`/appointments/new?specialtyId=${specialtyId}`)}
              >
                <Calendar className="w-4 h-4 ml-2" />
                حجز موعد
              </Button>
              <Button 
                variant="outline" 
                className="w-full justify-start"
                onClick={() => router.push('/doctors')}
              >
                <Users className="w-4 h-4 ml-2" />
                عرض جميع الأطباء
              </Button>
            </div>
          </Card>

          {/* Contact Info */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">معلومات الاتصال</h3>
            <div className="space-y-2 text-sm text-gray-600">
              <p>📞 01234567890</p>
              <p>📧 info@clinic.com</p>
              <p>📍 العنوان، المدينة، البلد</p>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};