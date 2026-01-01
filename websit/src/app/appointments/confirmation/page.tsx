'use client';

import React, { Suspense, useEffect, useRef } from 'react';
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
import { paymentsService } from '@/lib/api/payments';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { Loading } from '@/components/ui/Loading';
import { useAuth } from '@/lib/contexts/auth-context';

function ConfirmationContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const appointmentId = searchParams.get('id');
  const hasRedirectedRef = useRef(false);
  
  // #region agent log
  useEffect(() => {
    const currentUrl = typeof window !== 'undefined' ? window.location.href : 'N/A';
    const searchParamsStr = typeof window !== 'undefined' ? window.location.search : 'N/A';
    const pathname = typeof window !== 'undefined' ? window.location.pathname : 'N/A';
    fetch('http://127.0.0.1:7246/ingest/e8220b3a-738c-43f7-9083-e1ee47743b54',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'appointments/confirmation/page.tsx:31',message:'Confirmation page mounted',data:{appointmentId,hasUser:!!user,userRole:user?.role,userId:user?.id,currentUrl,searchParams:searchParamsStr,pathname,allSearchParams:Object.fromEntries(searchParams.entries())},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'H2'})}).catch(()=>{});
  }, [appointmentId, user, searchParams]);
  // #endregion

  const { data: appointment, isLoading, error, refetch } = useQuery({
    queryKey: ['appointment', appointmentId, user?.role],
    queryFn: async () => {
      // #region agent log
      fetch('http://127.0.0.1:7246/ingest/e8220b3a-738c-43f7-9083-e1ee47743b54',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'appointments/confirmation/page.tsx:40',message:'Query function called - fetching appointment',data:{appointmentId,userRole:user?.role,userId:user?.id,hasUser:!!user},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'H2'})}).catch(()=>{});
      // #endregion
      if (!appointmentId) {
        // #region agent log
        fetch('http://127.0.0.1:7246/ingest/e8220b3a-738c-43f7-9083-e1ee47743b54',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'appointments/confirmation/page.tsx:43',message:'No appointmentId - returning null',data:{appointmentId},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'H2'})}).catch(()=>{});
        // #endregion
        return null;
      }
      try {
        const result = await appointmentsService.getAppointment(appointmentId, user?.role as 'PATIENT' | 'DOCTOR' | undefined);
        // #region agent log
        fetch('http://127.0.0.1:7246/ingest/e8220b3a-738c-43f7-9083-e1ee47743b54',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'appointments/confirmation/page.tsx:48',message:'Appointment fetched successfully',data:{appointmentId,hasAppointment:!!result,appointmentStatus:result?.status,paymentStatus:result?.paymentStatus,requiresPayment:result?.requiresPayment,appointmentIdFromData:result?.id},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'H2'})}).catch(()=>{});
        // #endregion
        return result;
      } catch (err: any) {
        // #region agent log
        fetch('http://127.0.0.1:7246/ingest/e8220b3a-738c-43f7-9083-e1ee47743b54',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'appointments/confirmation/page.tsx:53',message:'Error fetching appointment',data:{appointmentId,error:err?.message,errorStack:err?.stack,statusCode:err?.response?.status},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'H2'})}).catch(()=>{});
        // #endregion
        throw err;
      }
    },
    enabled: !!appointmentId,
    retry: 2, // إعادة المحاولة مرتين
    retryDelay: 1000, // انتظار ثانية بين المحاولات
  });

  // #region agent log
  useEffect(() => {
    fetch('http://127.0.0.1:7246/ingest/e8220b3a-738c-43f7-9083-e1ee47743b54',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'appointments/confirmation/page.tsx:42',message:'Query state changed',data:{appointmentId,isLoading,hasAppointment:!!appointment,appointmentIdFromData:appointment?.id,error:error?.message,userRole:user?.role},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'I'})}).catch(()=>{});
  }, [appointment, isLoading, error, appointmentId, user?.role]);
  // #endregion

  // جلب حالة الدفع الفعلية
  const { data: payment, refetch: refetchPayment } = useQuery({
    queryKey: ['payment', appointmentId],
    queryFn: async () => {
      if (!appointmentId) return null;
      try {
        return await paymentsService.getPaymentByAppointment(appointmentId);
      } catch (error) {
        return null;
      }
    },
    enabled: !!appointmentId && !!appointment && appointment.requiresPayment,
    refetchInterval: false, // لا نريد refetch تلقائي مستمر
  });

  // حالة التحقق من الدفع
  const [isVerifyingPayment, setIsVerifyingPayment] = React.useState(false);

  // ✅ التحقق من الدفع مع إعادة المحاولة الذكية
  useEffect(() => {
    // منع إعادة التوجيه المتكررة
    if (hasRedirectedRef.current) {
      return;
    }

    // #region agent log
    fetch('http://127.0.0.1:7246/ingest/e8220b3a-738c-43f7-9083-e1ee47743b54',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'appointments/confirmation/page.tsx:60',message:'Payment check effect triggered',data:{hasAppointment:!!appointment,requiresPayment:appointment?.requiresPayment,paymentStatus:appointment?.paymentStatus,actualPaymentStatus:payment?.status,appointmentId,appointmentStatus:appointment?.status,hasRedirected:hasRedirectedRef.current},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'H5'})}).catch(()=>{});
    // #endregion
    
    // التحقق من حالة الدفع الفعلية أولاً
    const actualPaymentStatus = payment?.status || appointment?.paymentStatus;
    
    // إذا كان الدفع مكتمل، لا نعيد التوجيه
    if (actualPaymentStatus === 'COMPLETED') {
      setIsVerifyingPayment(false);
      return;
    }
    
    // إذا كان الدفع معلق، نحاول إعادة التحقق مرة واحدة قبل إعادة التوجيه
    if (appointment && appointment.requiresPayment && actualPaymentStatus === 'PENDING' && !hasRedirectedRef.current) {
      setIsVerifyingPayment(true);
      
      // إعادة محاولة التحقق من الدفع بعد ثانيتين (يعطي الباك-إند وقت لتحديث البيانات)
      let finalTimeoutId: NodeJS.Timeout | null = null;
      
      const verifyTimeout = setTimeout(async () => {
        try {
          // إعادة جلب بيانات الدفع والموعد
          const [paymentResult, appointmentResult] = await Promise.all([
            refetchPayment(),
            refetch()
          ]);
          
          // التحقق من النتائج بعد إعادة الجلب
          const updatedPayment = paymentResult.data;
          const updatedAppointment = appointmentResult.data;
          const updatedStatus = updatedPayment?.status || updatedAppointment?.paymentStatus;
          
          if (updatedStatus === 'COMPLETED') {
            // الدفع مكتمل، لا حاجة لإعادة التوجيه
            setIsVerifyingPayment(false);
            return;
          }
          
          // إذا كانت لا تزال PENDING بعد إعادة الجلب، انتظر قليلاً ثم أعد التوجيه
          if (updatedStatus === 'PENDING' && !hasRedirectedRef.current) {
            finalTimeoutId = setTimeout(() => {
              if (!hasRedirectedRef.current) {
                // #region agent log
                fetch('http://127.0.0.1:7246/ingest/e8220b3a-738c-43f7-9083-e1ee47743b54',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'appointments/confirmation/page.tsx:64',message:'Redirecting back to payment page after verification timeout',data:{appointmentId,appointmentIdFromData:appointment.id,requiresPayment:appointment.requiresPayment,paymentStatus:updatedStatus,redirectUrl:`/appointments/${typeof appointment.id === 'string' ? appointment.id : String(appointment.id)}/payment`},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'H5'})}).catch(()=>{});
                // #endregion
                hasRedirectedRef.current = true;
                setIsVerifyingPayment(false);
                const id = typeof appointment.id === 'string' ? appointment.id : String(appointment.id);
                router.push(`/appointments/${id}/payment`);
              }
            }, 2000); // انتظار ثانيتين إضافيتين بعد إعادة الجلب
          } else {
            setIsVerifyingPayment(false);
          }
        } catch (error) {
          setIsVerifyingPayment(false);
          // في حالة الخطأ، أعد التوجيه لصفحة الدفع
          if (!hasRedirectedRef.current) {
            hasRedirectedRef.current = true;
            const id = typeof appointment.id === 'string' ? appointment.id : String(appointment.id);
            router.push(`/appointments/${id}/payment`);
          }
        }
      }, 2000); // انتظار ثانيتين قبل إعادة المحاولة
      
      return () => {
        clearTimeout(verifyTimeout);
        if (finalTimeoutId) {
          clearTimeout(finalTimeoutId);
        }
      };
    }
  }, [appointment, payment, router, appointmentId, refetch, refetchPayment]);

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

  if (error || (!isLoading && !appointment)) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md">
          <AlertCircleIcon className="w-16 h-16 text-error-600 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">حدث خطأ</h1>
          <p className="text-gray-600 mb-4">
            {error ? 'لم نتمكن من تحميل تفاصيل الموعد. قد يكون الموعد قيد المعالجة.' : 'الموعد غير موجود'}
          </p>
          <div className="flex gap-4 justify-center">
            <Button 
              onClick={() => refetch()} 
              variant="outline"
              className="border-2 border-primary-500 text-primary-600 hover:bg-primary-50"
            >
              إعادة المحاولة
            </Button>
            <Link href="/appointments">
              <Button className="gradient-medical text-white hover:opacity-90">
                العودة للمواعيد
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // التأكد من وجود appointment قبل الاستخدام
  if (!appointment) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
        <Loading text="جاري تحميل تفاصيل الموعد..." />
      </div>
    );
  }

  const isConfirmed = appointment.status === 'CONFIRMED';
  const appointmentType = (appointment as any).type || 'IN_PERSON';
  const actualPaymentStatus = payment?.status || appointment?.paymentStatus;
  const isPaymentPending = appointment?.requiresPayment && actualPaymentStatus === 'PENDING';

  // عرض حالة التحقق من الدفع
  if (isVerifyingPayment || (isPaymentPending && !hasRedirectedRef.current)) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="w-20 h-20 mx-auto mb-6 bg-primary-100 rounded-full flex items-center justify-center shadow-lg animate-pulse">
            <ClockIcon className="w-10 h-10 text-primary-600 animate-spin" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-3">جاري التحقق من الدفع...</h1>
          <p className="text-gray-600 mb-6">
            يرجى الانتظار قليلاً بينما نتحقق من حالة الدفع
          </p>
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div className="bg-primary-600 h-2.5 rounded-full animate-pulse" style={{ width: '60%' }}></div>
          </div>
        </div>
      </div>
    );
  }

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





