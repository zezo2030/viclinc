'use client';

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { specialtyService } from '@/lib/api/specialties';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { ArrowLeft, Users, Stethoscope, Calendar } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { getDepartmentImageUrl } from '@/lib/utils/image';

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
          {(specialty.logoUrl || specialty.icon) ? (
            <div className="w-20 h-20 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden flex-shrink-0">
              <img 
                src={getDepartmentImageUrl(specialty.logoUrl, specialty.icon)}
                alt={specialty.name}
                className="w-full h-full object-cover"
                onError={(e) => {
                  // Fallback to placeholder if image fails to load
                  const target = e.target as HTMLImageElement;
                  if (target.src !== '/service.jpg') {
                    target.src = '/service.jpg';
                  } else {
                    // If placeholder also fails, hide the image and show icon
                    target.style.display = 'none';
                    const parent = target.parentElement;
                    if (parent) {
                      parent.innerHTML = `
                        <svg class="w-12 h-12 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                        </svg>
                      `;
                    }
                  }
                }}
              />
            </div>
          ) : (
            <div className="w-20 h-20 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <svg className="w-12 h-12 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
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
                {(specialty as any).doctors.map((doctor: any) => {
                  // Handle different data structures from backend
                  // Backend returns: doctor.name (from DoctorProfile) or doctor.userId.name (from User)
                  // Also check for doctor.user?.profile?.firstName/lastName (for compatibility)
                  let doctorName = 'غير محدد';
                  
                  if (doctor.name) {
                    // From DoctorProfile.name
                    doctorName = doctor.name;
                  } else if (doctor.userId?.name) {
                    // From populated User.name
                    doctorName = doctor.userId.name;
                  } else if (doctor.user?.profile) {
                    // From user.profile structure (if exists)
                    const firstName = doctor.user.profile.firstName || '';
                    const lastName = doctor.user.profile.lastName || '';
                    if (firstName || lastName) {
                      doctorName = `${firstName} ${lastName}`.trim();
                    }
                  } else if (doctor.user?.name) {
                    // From user.name (direct)
                    doctorName = doctor.user.name;
                  }
                  
                  // Get specialization/bio information
                  const specialization = doctor.bio || doctor.specialization || 'غير محدد';
                  const yearsOfExperience = doctor.yearsOfExperience ? `${doctor.yearsOfExperience} سنوات خبرة` : null;
                  
                  return (
                    <div 
                      key={doctor._id || doctor.id} 
                      className="border rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
                      onClick={() => {
                        if (doctor._id || doctor.id) {
                          router.push(`/doctors/${doctor._id || doctor.id}`);
                        }
                      }}
                    >
                      <h3 className="font-medium text-gray-900 mb-1">
                        {doctorName}
                      </h3>
                      {specialization && specialization !== 'غير محدد' && (
                        <p className="text-sm text-gray-600 mb-1">{specialization}</p>
                      )}
                      {yearsOfExperience && (
                        <p className="text-xs text-gray-500">{yearsOfExperience}</p>
                      )}
                    </div>
                  );
                })}
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
                {(specialty as any).services.map((service: any, index: number) => {
                  // Handle both string and object formats
                  const serviceName = typeof service === 'string' ? service : service?.name || 'خدمة غير معروفة';
                  const serviceDescription = typeof service === 'object' ? service?.description : null;
                  const servicePrice = typeof service === 'object' ? service?.defaultPrice : null;
                  
                  return (
                    <div key={service?._id || service?.id || index} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                      <h3 className="font-medium text-gray-900 mb-1">{serviceName}</h3>
                      {serviceDescription && (
                        <p className="text-sm text-gray-600 mb-2">{serviceDescription}</p>
                      )}
                      {servicePrice !== null && servicePrice !== undefined && (
                        <p className="text-sm font-semibold text-primary-600">
                          {servicePrice === 0 ? 'مجاني' : `${servicePrice} ريال`}
                        </p>
                      )}
                    </div>
                  );
                })}
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