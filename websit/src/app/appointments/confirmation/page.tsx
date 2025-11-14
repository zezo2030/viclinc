'use client';

import React, { Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import {
  CheckCircleIcon,
  CalendarIcon,
  ClockIcon,
  UserIcon,
  MapPinIcon,
  FileTextIcon,
  DownloadIcon,
  HomeIcon,
  ShareIcon,
  AlertCircleIcon,
} from 'lucide-react';
import { appointmentsService } from '@/lib/api/appointments';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { Loading } from '@/components/ui/Loading';

function ConfirmationContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const appointmentId = searchParams.get('id');

  const { data: appointment, isLoading, error } = useQuery({
    queryKey: ['appointment', appointmentId],
    queryFn: () => appointmentId ? appointmentsService.getAppointment(parseInt(appointmentId)) : null,
    enabled: !!appointmentId,
  });

  if (!appointmentId) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircleIcon className="w-16 h-16 text-error-600 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">معرف الموعد غير موجود</h1>
          <p className="text-gray-600 mb-6">يرجى التأكد من الرابط وحاول مرة أخرى</p>
          <Link href="/appointments">
            <Button className="gradient-medical text-white hover:opacity-90">
              العودة للمواعيد
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
        <Loading text="جاري تحميل تفاصيل الموعد..." />
      </div>
    );
  }

  if (error || !appointment) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircleIcon className="w-16 h-16 text-error-600 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">حدث خطأ</h1>
          <p className="text-gray-600 mb-6">لم نتمكن من تحميل تفاصيل الموعد</p>
          <Link href="/appointments">
            <Button className="gradient-medical text-white hover:opacity-90">
              العودة للمواعيد
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const isConfirmed = appointment.status === 'CONFIRMED';
  const appointmentType = (appointment as any).type || 'IN_PERSON';

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 py-12">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Success Header */}
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <div className="w-20 h-20 mx-auto mb-6 bg-success-100 rounded-full flex items-center justify-center shadow-lg">
            <CheckCircleIcon className="w-10 h-10 text-success-600" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-3">تم تأكيد الموعد بنجاح!</h1>
          <p className="text-xl text-gray-600">
            لقد تم تسجيل موعدك وسيتم إرسال تفاصيله إلى بريدك الإلكتروني
          </p>
        </motion.div>

        {/* Appointment Details */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="space-y-6 mb-12"
        >
          {/* Status Card */}
          <Card className={`p-6 border-2 ${isConfirmed ? 'border-success-200 bg-success-50' : 'border-warning-200 bg-warning-50'}`}>
            <div className="flex items-center gap-3 mb-4">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center ${isConfirmed ? 'bg-success-100' : 'bg-warning-100'}`}>
                <CheckCircleIcon className={`w-6 h-6 ${isConfirmed ? 'text-success-600' : 'text-warning-600'}`} />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">حالة الموعد</h3>
                <p className={`font-semibold ${isConfirmed ? 'text-success-700' : 'text-warning-700'}`}>
                  {isConfirmed ? 'مؤكد' : 'قيد المراجعة'}
                </p>
              </div>
            </div>
            {!isConfirmed && (
              <p className="text-sm text-gray-700">
                سيتم تأكيد الموعد من قبل الطبيب خلال 24 ساعة. سنرسل لك إشعار بالتأكيد.
              </p>
            )}
          </Card>

          {/* Appointment Info */}
          <Card className="p-6 border-2 border-gray-100 space-y-4">
            <h3 className="text-xl font-bold text-gray-900 mb-6">تفاصيل الموعد</h3>

            {/* Doctor Info */}
            <div className="flex items-start gap-4 pb-4 border-b border-gray-200">
              <div className="w-12 h-12 rounded-full gradient-medical-light flex items-center justify-center flex-shrink-0">
                <UserIcon className="w-6 h-6 text-primary-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-gray-600 mb-1">الطبيب</p>
                <p className="text-lg font-bold text-gray-900">
                  د. {appointment.doctor?.user?.profile?.firstName} {appointment.doctor?.user?.profile?.lastName}
                </p>
                <p className="text-sm text-gray-600">
                  {appointment.doctor?.specialization || appointment.specialty?.name}
                </p>
              </div>
            </div>

            {/* Date and Time */}
            <div className="grid grid-cols-2 gap-4 pb-4 border-b border-gray-200">
              <div className="flex items-start gap-3">
                <CalendarIcon className="w-5 h-5 text-primary-600 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-600 mb-1">التاريخ</p>
                  <p className="font-semibold text-gray-900">
                    {new Date(appointment.appointmentDate || (appointment as any).startAt).toLocaleDateString('ar-SA', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <ClockIcon className="w-5 h-5 text-secondary-600 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-600 mb-1">الوقت</p>
                  <p className="font-semibold text-gray-900">
                    {appointment.appointmentTime || new Date((appointment as any).startAt).toLocaleTimeString('ar-SA', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
              </div>
            </div>

            {/* Location (for in-person) */}
            {appointmentType === 'IN_PERSON' && appointment.clinic && (
              <div className="flex items-start gap-3 pb-4 border-b border-gray-200">
                <MapPinIcon className="w-5 h-5 text-success-600 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-600 mb-1">المكان</p>
                  <p className="font-semibold text-gray-900">{appointment.clinic.name}</p>
                  <p className="text-sm text-gray-600">{appointment.clinic.address}</p>
                </div>
              </div>
            )}

            {/* Appointment Type */}
            <div className="flex items-start gap-3">
              <FileTextIcon className="w-5 h-5 text-warning-600 mt-0.5" />
              <div>
                <p className="text-sm text-gray-600 mb-1">نوع الموعد</p>
                <p className="font-semibold text-gray-900">
                  {appointmentType === 'IN_PERSON' ? 'موعد عيادة'
                    : appointmentType === 'VIDEO' ? 'استشارة فيديو'
                    : 'استشارة نصية'}
                </p>
              </div>
            </div>
          </Card>

          {/* Important Notes */}
          <Card className="p-6 bg-blue-50 border-2 border-blue-200">
            <h4 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
              <AlertCircleIcon className="w-5 h-5 text-blue-600" />
              ملاحظات مهمة
            </h4>
            <ul className="space-y-2 text-sm text-gray-700">
              <li>• يرجى الحضور قبل موعدك بـ 15 دقيقة</li>
              <li>• إذا لم تستطع الحضور، يرجى إلغاء الموعد مسبقاً</li>
              <li>• سيتم إرسال تذكير لك قبل 24 ساعة من الموعد</li>
              <li>• احضر بطاقة هويتك وأي مستندات طبية مهمة</li>
            </ul>
          </Card>
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6"
        >
          <Link href="/appointments" className="col-span-1">
            <Button className="w-full border-2 border-primary-500 text-primary-600 hover:bg-primary-50">
              <HomeIcon className="w-4 h-4 ml-2" />
              عودة للمواعيد
            </Button>
          </Link>

          <Button className="w-full border-2 border-gray-300 text-gray-700 hover:bg-gray-100">
            <DownloadIcon className="w-4 h-4 ml-2" />
            تحميل الملخص
          </Button>

          <Button className="w-full gradient-medical text-white hover:opacity-90">
            <ShareIcon className="w-4 h-4 ml-2" />
            مشاركة الموعد
          </Button>
        </motion.div>

        {/* Consultation Link */}
        {(appointmentType === 'VIDEO' || appointmentType === 'CHAT') && isConfirmed && (
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.5 }}
            className="text-center"
          >
            <Link href={`/consultations/${appointment.id}`}>
              <Button size="lg" className="gradient-medical text-white hover:opacity-90 shadow-lg">
                {appointmentType === 'VIDEO' ? 'ابدأ جلسة الفيديو' : 'ابدأ المحادثة'}
              </Button>
            </Link>
          </motion.div>
        )}
      </div>
    </div>
  );
}

export default function ConfirmationPage() {
  return (
    <ProtectedRoute>
      <Suspense fallback={<Loading text="جاري التحميل..." />}>
        <ConfirmationContent />
      </Suspense>
    </ProtectedRoute>
  );
}





