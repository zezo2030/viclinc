'use client';

import React, { Suspense } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import {
  CalendarIcon,
  ClockIcon,
  UserIcon,
  MapPinIcon,
  FileTextIcon,
  ArrowLeft,
  AlertCircleIcon,
  CreditCard,
  Video,
  MessageSquare,
} from 'lucide-react';
import { appointmentsService } from '@/lib/api/appointments';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { Loading } from '@/components/ui/Loading';
import { useAuth } from '@/lib/contexts/auth-context';

function AppointmentDetailsContent() {
  const router = useRouter();
  const params = useParams();
  const { user } = useAuth();
  const appointmentId = params.id as string;

  const { data: appointment, isLoading, error } = useQuery({
    queryKey: ['appointment', appointmentId, user?.role],
    queryFn: () => appointmentId ? appointmentsService.getAppointment(appointmentId, user?.role as 'PATIENT' | 'DOCTOR' | undefined) : null,
    enabled: !!appointmentId,
  });

  // ✅ التحقق من الدفع وإعادة التوجيه إذا لزم الأمر
  React.useEffect(() => {
    if (appointment && appointment.requiresPayment && appointment.paymentStatus === 'PENDING') {
      // إعادة التوجيه إلى صفحة الدفع
      const id = typeof appointment.id === 'string' ? appointment.id : String(appointment.id);
      router.push(`/appointments/${id}/payment`);
    }
  }, [appointment, router]);

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
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="outline"
            onClick={() => router.back()}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            العودة
          </Button>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">تفاصيل الموعد</h1>
        </div>

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
                <AlertCircleIcon className={`w-6 h-6 ${isConfirmed ? 'text-success-600' : 'text-warning-600'}`} />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">حالة الموعد</h3>
                <p className={`font-semibold ${isConfirmed ? 'text-success-700' : 'text-warning-700'}`}>
                  {isConfirmed ? 'مؤكد' : 
                   appointment.status === 'PENDING_CONFIRM' ? 'قيد المراجعة' :
                   appointment.status === 'COMPLETED' ? 'مكتمل' :
                   appointment.status === 'CANCELLED' ? 'ملغي' :
                   appointment.status === 'REJECTED' ? 'مرفوض' :
                   appointment.status === 'NO_SHOW' ? 'لم يحضر' : 'غير محدد'}
                </p>
              </div>
            </div>
            {!isConfirmed && appointment.status === 'PENDING_CONFIRM' && (
              <p className="text-sm text-gray-700">
                سيتم تأكيد الموعد من قبل الطبيب خلال 24 ساعة. سنرسل لك إشعار بالتأكيد.
              </p>
            )}
          </Card>

          {/* Appointment Info */}
          <Card className="p-6 border-2 border-gray-100 space-y-4">
            <h3 className="text-xl font-bold text-gray-900 mb-6">تفاصيل الموعد</h3>

            {/* Doctor/Patient Info */}
            <div className="flex items-start gap-4 pb-4 border-b border-gray-200">
              <div className="w-12 h-12 rounded-full gradient-medical-light flex items-center justify-center flex-shrink-0">
                <UserIcon className="w-6 h-6 text-primary-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-gray-600 mb-1">
                  {user?.role === 'PATIENT' ? 'الطبيب' : 'المريض'}
                </p>
                <p className="text-lg font-bold text-gray-900">
                  {user?.role === 'PATIENT' 
                    ? `د. ${appointment.doctor?.user?.profile?.firstName || ''} ${appointment.doctor?.user?.profile?.lastName || ''}`
                    : `${appointment.patient?.profile?.firstName || ''} ${appointment.patient?.profile?.lastName || ''}`
                  }
                </p>
                <p className="text-sm text-gray-600">
                  {user?.role === 'PATIENT' 
                    ? (appointment.doctor?.specialization || appointment.specialty?.name)
                    : appointment.patient?.profile?.phone
                  }
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
                    {appointment.appointmentDate || appointment.startAt
                      ? new Date(appointment.appointmentDate || appointment.startAt!).toLocaleDateString('ar-SA', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })
                      : 'غير محدد'}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <ClockIcon className="w-5 h-5 text-secondary-600 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-600 mb-1">الوقت</p>
                  <p className="font-semibold text-gray-900">
                    {appointment.appointmentTime 
                      ? appointment.appointmentTime
                      : appointment.startAt 
                        ? new Date(appointment.startAt).toLocaleTimeString('ar-SA', {
                            hour: '2-digit',
                            minute: '2-digit',
                          })
                        : 'غير محدد'}
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

            {/* Reason */}
            {appointment.reason && (
              <div className="pt-4 border-t border-gray-200">
                <p className="text-sm text-gray-600 mb-1">السبب</p>
                <p className="font-semibold text-gray-900">{appointment.reason}</p>
              </div>
            )}

            {/* Notes */}
            {appointment.notes && (
              <div className="pt-4 border-t border-gray-200">
                <p className="text-sm text-gray-600 mb-1">ملاحظات</p>
                <p className="text-gray-900">{appointment.notes}</p>
              </div>
            )}
          </Card>
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          className="flex flex-col sm:flex-row gap-4"
        >
          {appointment.requiresPayment && appointment.paymentStatus !== 'COMPLETED' && (
            <Button
              onClick={() => router.push(`/appointments/${appointmentId}/payment`)}
              className="flex-1 gradient-medical text-white hover:opacity-90"
            >
              <CreditCard className="w-4 h-4 ml-2" />
              إتمام الدفع
            </Button>
          )}
          
          {(appointmentType === 'VIDEO' || appointmentType === 'CHAT') && isConfirmed && (
            <Button
              onClick={() => router.push(`/consultations/${appointment.id}`)}
              className="flex-1 gradient-medical text-white hover:opacity-90"
            >
              {appointmentType === 'VIDEO' ? (
                <>
                  <Video className="w-4 h-4 ml-2" />
                  ابدأ جلسة الفيديو
                </>
              ) : (
                <>
                  <MessageSquare className="w-4 h-4 ml-2" />
                  ابدأ المحادثة
                </>
              )}
            </Button>
          )}
          
          <Link href="/appointments" className="flex-1">
            <Button variant="outline" className="w-full border-2 border-primary-500 text-primary-600 hover:bg-primary-50">
              العودة للمواعيد
            </Button>
          </Link>
        </motion.div>
      </div>
    </div>
  );
}

export default function AppointmentDetailsPage() {
  return (
    <ProtectedRoute>
      <Suspense fallback={<Loading text="جاري التحميل..." />}>
        <AppointmentDetailsContent />
      </Suspense>
    </ProtectedRoute>
  );
}

