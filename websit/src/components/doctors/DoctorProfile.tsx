'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { doctorsService } from '@/lib/api/doctors';
import { DoctorProfile as DoctorProfileType } from '@/types';
import { 
  Star, 
  Briefcase, 
  DollarSign, 
  MapPin, 
  CheckCircle, 
  Calendar, 
  Video, 
  MessageSquare,
  Clock,
  Award,
  Phone,
  Mail,
  ArrowLeft
} from 'lucide-react';
import { RatingSummary } from './RatingSummary';
import { RatingsList } from './RatingsList';
import { getDepartmentImageUrl } from '@/lib/utils/image';

interface DoctorProfileProps {
  doctorId: number | string;
}

export const DoctorProfile: React.FC<DoctorProfileProps> = ({ doctorId }) => {
  const router = useRouter();
  const [doctor, setDoctor] = useState<DoctorProfileType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDoctor = async () => {
      try {
        setLoading(true);
        setError(null);
        const doctorData = await doctorsService.getDoctor(doctorId);
        if (!doctorData) {
          setError('الطبيب غير موجود');
          return;
        }
        console.log('Doctor data received:', doctorData);
        setDoctor(doctorData as any);
      } catch (err) {
        console.error('Error fetching doctor:', err);
        setError('حدث خطأ في تحميل بيانات الطبيب');
      } finally {
        setLoading(false);
      }
    };

    if (doctorId) {
      fetchDoctor();
    }
  }, [doctorId]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      </div>
    );
  }

  if (error || !doctor) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            {error || 'الطبيب غير موجود'}
          </h1>
          <Button onClick={() => router.push('/specialties')}>
            العودة إلى التخصصات
          </Button>
        </div>
      </div>
    );
  }

  const formatScheduleTime = (date: Date) => {
    return new Intl.DateTimeFormat('ar-SA', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    }).format(date);
  };

  const getDayName = (dayOfWeek: number) => {
    const days = ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];
    return days[dayOfWeek];
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Back Button */}
      <Button 
        variant="outline" 
        onClick={() => router.back()}
        className="mb-6"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        العودة
      </Button>

      {/* Header Section */}
      <Card className="p-8 mb-8 gradient-medical-light border-2 border-primary-100">
        <div className="flex flex-col md:flex-row gap-6">
          {/* Doctor Image */}
          <div className="flex-shrink-0">
            {doctor.photos && doctor.photos.length > 0 ? (
              <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-white shadow-lg">
                <img 
                  src={doctor.photos[0]} 
                  alt={doctor.name || 'طبيب'}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                    (e.target as HTMLImageElement).nextElementSibling?.classList.remove('hidden');
                  }}
                />
              </div>
            ) : null}
            <div className={`w-32 h-32 rounded-full gradient-medical-light flex items-center justify-center border-4 border-white shadow-lg ${doctor.photos && doctor.photos.length > 0 ? 'hidden' : ''}`}>
              <Briefcase className="w-16 h-16 text-primary-500" />
            </div>
          </div>

          {/* Doctor Info */}
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {doctor.name || 'طبيب'}
            </h1>
            {doctor.bio && (
              <p className="text-xl text-gray-600 mb-4">{doctor.bio}</p>
            )}
            
            {/* Rating */}
            {(doctor.averageRating || doctor.totalRatings) && (
              <div className="flex items-center gap-3 mb-4">
                <div className="flex items-center gap-1 bg-yellow-50 px-3 py-1 rounded-full">
                  <Star className="w-5 h-5 text-yellow-400 fill-current" />
                  <span className="text-lg font-bold text-gray-900">{doctor.averageRating || 0}</span>
                </div>
                <span className="text-gray-600">({doctor.totalRatings || 0} تقييم)</span>
              </div>
            )}

            {/* Quick Info */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              {doctor.yearsOfExperience && (
                <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-lg shadow-sm">
                  <Briefcase className="w-5 h-5 text-primary-500" />
                  <span className="font-medium">{doctor.yearsOfExperience} سنوات خبرة</span>
                </div>
              )}
              {doctor.consultationFee && (
                <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-lg shadow-sm">
                  <DollarSign className="w-5 h-5 text-success-500" />
                  <span className="font-medium text-primary-600">{doctor.consultationFee} ريال</span>
                </div>
              )}
              {doctor.departmentName && (
                <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-lg shadow-sm">
                  <MapPin className="w-5 h-5 text-secondary-500" />
                  <span className="font-medium">{doctor.departmentName}</span>
                </div>
              )}
            </div>

            {/* Availability */}
            <div className="flex items-center gap-2">
              {doctor.status === 'APPROVED' ? (
                <span className="text-success-600 flex items-center gap-2 bg-success-50 px-4 py-2 rounded-full font-semibold">
                  <CheckCircle className="w-5 h-5" />
                  متاح للاستشارات
                </span>
              ) : (
                <span className="text-gray-400 bg-gray-100 px-4 py-2 rounded-full">غير متاح حالياً</span>
              )}
            </div>
          </div>
        </div>
      </Card>

      {/* Booking Options */}
      <Card className="p-6 mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">خيارات الحجز</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="p-6 text-center cursor-pointer hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 border-2 border-primary-100">
            <div className="w-16 h-16 rounded-full bg-primary-100 flex items-center justify-center mx-auto mb-4">
              <Calendar className="w-8 h-8 text-primary-600" />
            </div>
            <h3 className="text-lg font-bold mb-2 text-gray-900">حجز موعد</h3>
            <p className="text-sm text-gray-600 mb-4">احجز موعداً شخصياً في العيادة</p>
            <Button 
              className="w-full gradient-medical text-white hover:opacity-90"
              onClick={() => router.push(`/appointments/new?doctorId=${doctor._id || doctor.id}&type=IN_PERSON`)}
            >
              احجز الآن
            </Button>
          </Card>
          
          <Card className="p-6 text-center cursor-pointer hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 border-2 border-secondary-100">
            <div className="w-16 h-16 rounded-full bg-secondary-100 flex items-center justify-center mx-auto mb-4">
              <Video className="w-8 h-8 text-secondary-600" />
            </div>
            <h3 className="text-lg font-bold mb-2 text-gray-900">استشارة فيديو</h3>
            <p className="text-sm text-gray-600 mb-4">استشارة مباشرة عبر الفيديو</p>
            <Button 
              className="w-full bg-secondary-500 text-white hover:bg-secondary-600"
              onClick={() => router.push(`/appointments/new?doctorId=${doctor._id || doctor.id}&type=VIDEO`)}
            >
              ابدأ استشارة
            </Button>
          </Card>
          
          <Card className="p-6 text-center cursor-pointer hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 border-2 border-primary-100">
            <div className="w-16 h-16 rounded-full bg-primary-50 flex items-center justify-center mx-auto mb-4">
              <MessageSquare className="w-8 h-8 text-primary-500" />
            </div>
            <h3 className="text-lg font-bold mb-2 text-gray-900">استشارة نصية</h3>
            <p className="text-sm text-gray-600 mb-4">محادثة نصية مع الطبيب</p>
            <Button 
              className="w-full border-2 border-primary-500 text-primary-600 hover:bg-primary-50"
              onClick={() => router.push(`/appointments/new?doctorId=${doctor._id || doctor.id}&type=CHAT`)}
            >
              ابدأ محادثة
            </Button>
          </Card>
        </div>
      </Card>

      {/* Doctor Details */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Professional Info */}
        <Card className="p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">المعلومات المهنية</h2>
          <div className="space-y-3">
            {doctor.licenseNumber && (
              <div className="flex justify-between">
                <span className="text-gray-600">رقم الترخيص:</span>
                <span className="font-medium">{doctor.licenseNumber}</span>
              </div>
            )}
            {doctor.departmentName && (
              <div className="flex justify-between items-center">
                <span className="text-gray-600">القسم:</span>
                <span className="font-medium">{doctor.departmentName}</span>
              </div>
            )}
            {doctor.bio && (
              <div className="flex justify-between">
                <span className="text-gray-600">السيرة الذاتية:</span>
                <span className="font-medium">{doctor.bio}</span>
              </div>
            )}
          </div>
        </Card>

        {/* Services */}
        <Card className="p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">الخدمات المتاحة</h2>
          {doctor.services && doctor.services.length > 0 ? (
            <div className="space-y-3">
              {doctor.services.map((service: any, index: number) => (
                <div key={service.serviceId || index} className="flex items-center justify-between border-b pb-2">
                  <span className="font-medium">{service.serviceName || 'خدمة'}</span>
                  {service.customPrice && (
                    <span className="text-sm text-primary-600 font-semibold">
                      {service.customPrice} ريال
                    </span>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">لا توجد خدمات متاحة</p>
          )}
        </Card>
      </div>

      {/* Ratings Section - Only show if ratings exist */}
      {(doctor.ratings && doctor.ratings.length > 0) && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Rating Summary */}
          <div className="lg:col-span-1">
            <RatingSummary ratings={doctor.ratings} />
          </div>

          {/* Ratings List */}
          <div className="lg:col-span-2">
            <RatingsList ratings={doctor.ratings} />
          </div>
        </div>
      )}
    </div>
  );
};
