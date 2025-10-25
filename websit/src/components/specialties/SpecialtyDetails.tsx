'use client';

import React from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useQuery } from '@tanstack/react-query';
import { specialtyService } from '@/lib/api/specialties';
import { Users, Calendar, Star, Briefcase, DollarSign, MapPin, CheckCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface SpecialtyDetailsProps {
  specialtyId: number;
}

export const SpecialtyDetails: React.FC<SpecialtyDetailsProps> = ({ specialtyId }) => {
  const router = useRouter();
  
  // الحصول على التخصص من API
  const { data: specialty, isLoading, error } = useQuery({
    queryKey: ['specialty', specialtyId],
    queryFn: () => specialtyService.getSpecialty(specialtyId),
    staleTime: 5 * 60 * 1000, // 5 دقائق
  });

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">جاري تحميل التخصص...</p>
        </div>
      </div>
    );
  }

  if (error || !specialty) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center py-20">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">التخصص غير موجود</h1>
          <Button onClick={() => router.push('/specialties')}>
            العودة إلى التخصصات
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Header Section */}
      <Card className="p-8 mb-8">
        <div className="flex items-start gap-6">
          {specialty.icon && (
            <img 
              src={specialty.icon} 
              alt={specialty.name}
              className="w-32 h-32 object-cover rounded-lg"
            />
          )}
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {specialty.name}
            </h1>
            {specialty.description && (
              <p className="text-lg text-gray-600 mb-4">
                {specialty.description}
              </p>
            )}
            <div className="flex items-center gap-2 text-gray-500">
              <Users className="w-5 h-5" />
              <span>{specialty.doctors.length} طبيب متخصص</span>
            </div>
          </div>
        </div>
      </Card>

      {/* Services Section */}
      <Card className="p-6 mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          الخدمات المقدمة
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {specialty.services.map((service, index) => (
            <div key={index} className="flex items-center gap-2">
              <div className="w-2 h-2 bg-primary-600 rounded-full"></div>
              <span className="text-gray-700">{service}</span>
            </div>
          ))}
        </div>
      </Card>

      {/* Doctors Section */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          الأطباء المتخصصون
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {specialty.doctors.map((doctor) => (
            <Card key={doctor.id} className="p-6 hover:shadow-lg transition-shadow">
              <div className="flex flex-col">
                {/* صورة الطبيب */}
                <div className="flex items-start gap-4 mb-4">
                  {(doctor as any).avatar ? (
                    <img 
                      src={(doctor as any).avatar} 
                      alt={`د. ${doctor.user.profile.firstName} ${doctor.user.profile.lastName}`}
                      className="w-20 h-20 rounded-full object-cover" 
                    />
                  ) : (
                    <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center">
                      <Users className="w-10 h-10 text-gray-400" />
                    </div>
                  )}
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">
                      د. {doctor.user.profile.firstName} {doctor.user.profile.lastName}
                    </h3>
                    <p className="text-sm text-gray-500 mb-2">
                      {doctor.specialization}
                    </p>
                    {/* التقييم */}
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 text-yellow-400 fill-current" />
                      <span className="text-sm font-medium">{(doctor as any).averageRating || 0}</span>
                      <span className="text-xs text-gray-500">({(doctor as any).totalRatings || 0} تقييم)</span>
                    </div>
                  </div>
                </div>
                
                {/* معلومات إضافية */}
                <div className="grid grid-cols-2 gap-3 mb-4 text-sm">
                  <div className="flex items-center gap-2">
                    <Briefcase className="w-4 h-4 text-gray-400" />
                    <span>{(doctor as any).experience || 0} سنوات خبرة</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-gray-400" />
                    <span>{(doctor as any).consultationFee || 0} ريال</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-gray-400" />
                    <span className="truncate">{(doctor as any).clinic?.name || 'غير محدد'}</span>
                  </div>
                  <div>
                    {(doctor as any).isAvailable ? (
                      <span className="text-green-600 flex items-center gap-1">
                        <CheckCircle className="w-4 h-4" /> متاح
                      </span>
                    ) : (
                      <span className="text-gray-400">غير متاح</span>
                    )}
                  </div>
                </div>

                {/* الأزرار */}
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    className="flex-1"
                    onClick={() => router.push(`/doctors/${doctor.id}`)}
                  >
                    عرض الملف الشخصي
                  </Button>
                  <Button 
                    className="flex-1"
                    onClick={() => router.push(`/appointments/new?doctorId=${doctor.id}&specialtyId=${specialty.id}`)}
                  >
                    <Calendar className="w-4 h-4 mr-2" />
                    حجز موعد
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};