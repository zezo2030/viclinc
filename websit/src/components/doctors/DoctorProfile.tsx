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

interface DoctorProfileProps {
  doctorId: number;
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
      <Card className="p-8 mb-8">
        <div className="flex flex-col md:flex-row gap-6">
          {/* Doctor Image */}
          <div className="flex-shrink-0">
            {doctor.user.profile.avatar ? (
              <img 
                src={doctor.user.profile.avatar} 
                alt={`د. ${doctor.user.profile.firstName} ${doctor.user.profile.lastName}`}
                className="w-32 h-32 rounded-full object-cover"
              />
            ) : (
              <div className="w-32 h-32 bg-gray-200 rounded-full flex items-center justify-center">
                <Briefcase className="w-16 h-16 text-gray-400" />
              </div>
            )}
          </div>

          {/* Doctor Info */}
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              د. {doctor.user.profile.firstName} {doctor.user.profile.lastName}
            </h1>
            <p className="text-xl text-gray-600 mb-4">{doctor.specialization}</p>
            
            {/* Rating */}
            <div className="flex items-center gap-2 mb-4">
              <div className="flex items-center gap-1">
                <Star className="w-5 h-5 text-yellow-400 fill-current" />
                <span className="text-lg font-semibold">{doctor.averageRating || 0}</span>
              </div>
              <span className="text-gray-500">({doctor.totalRatings || 0} تقييم)</span>
            </div>

            {/* Quick Info */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="flex items-center gap-2">
                <Briefcase className="w-5 h-5 text-gray-400" />
                <span>{doctor.experience} سنوات خبرة</span>
              </div>
              <div className="flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-gray-400" />
                <span>{doctor.consultationFee} ريال</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-5 h-5 text-gray-400" />
                <span>{doctor.clinic.name}</span>
              </div>
            </div>

            {/* Availability */}
            <div className="flex items-center gap-2">
              {doctor.isAvailable ? (
                <span className="text-green-600 flex items-center gap-1">
                  <CheckCircle className="w-5 h-5" />
                  متاح للاستشارات
                </span>
              ) : (
                <span className="text-gray-400">غير متاح حالياً</span>
              )}
            </div>
          </div>
        </div>
      </Card>

      {/* Booking Options */}
      <Card className="p-6 mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">خيارات الحجز</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="p-6 text-center cursor-pointer hover:shadow-lg transition-shadow">
            <Calendar className="w-12 h-12 mx-auto mb-3 text-primary-600" />
            <h3 className="text-lg font-semibold mb-2">حجز موعد</h3>
            <p className="text-sm text-gray-600 mb-4">احجز موعداً شخصياً في العيادة</p>
            <Button 
              className="w-full"
              onClick={() => router.push(`/appointments/new?doctorId=${doctor.id}`)}
            >
              احجز الآن
            </Button>
          </Card>
          
          <Card className="p-6 text-center cursor-pointer hover:shadow-lg transition-shadow">
            <Video className="w-12 h-12 mx-auto mb-3 text-primary-600" />
            <h3 className="text-lg font-semibold mb-2">استشارة فيديو</h3>
            <p className="text-sm text-gray-600 mb-4">استشارة مباشرة عبر الفيديو</p>
            <Button 
              className="w-full"
              onClick={() => router.push(`/consultations/new?doctorId=${doctor.id}&type=video`)}
            >
              ابدأ استشارة
            </Button>
          </Card>
          
          <Card className="p-6 text-center cursor-pointer hover:shadow-lg transition-shadow">
            <MessageSquare className="w-12 h-12 mx-auto mb-3 text-primary-600" />
            <h3 className="text-lg font-semibold mb-2">استشارة نصية</h3>
            <p className="text-sm text-gray-600 mb-4">محادثة نصية مع الطبيب</p>
            <Button 
              className="w-full"
              onClick={() => router.push(`/consultations/new?doctorId=${doctor.id}&type=chat`)}
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
            <div className="flex justify-between">
              <span className="text-gray-600">رقم الترخيص:</span>
              <span className="font-medium">{doctor.licenseNumber}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">التخصص:</span>
              <span className="font-medium">{doctor.specialty.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">القسم:</span>
              <span className="font-medium">{doctor.department.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">العيادة:</span>
              <span className="font-medium">{doctor.clinic.name}</span>
            </div>
            {doctor.clinic.address && (
              <div className="flex justify-between">
                <span className="text-gray-600">العنوان:</span>
                <span className="font-medium">{doctor.clinic.address}</span>
              </div>
            )}
          </div>
        </Card>

        {/* Schedule */}
        <Card className="p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">أوقات العمل</h2>
          {doctor.schedules.length > 0 ? (
            <div className="space-y-3">
              {doctor.schedules.map((schedule) => (
                <div key={schedule.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-gray-400" />
                    <span className="font-medium">{getDayName(schedule.dayOfWeek)}</span>
                  </div>
                  <span className="text-sm text-gray-600">
                    {formatScheduleTime(schedule.startTime)} - {formatScheduleTime(schedule.endTime)}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">لا توجد جداول عمل متاحة</p>
          )}
        </Card>
      </div>

      {/* Ratings Section */}
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
    </div>
  );
};
