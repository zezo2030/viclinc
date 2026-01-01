'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Loading } from '@/components/ui/Loading';
import { ArrowLeft, CreditCard, CheckCircle, XCircle, AlertCircle, RefreshCw } from 'lucide-react';
import { appointmentsService } from '@/lib/api/appointments';
import { paymentsService, Payment } from '@/lib/api/payments';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { useAuth } from '@/lib/contexts/auth-context';

function PaymentContent() {
  const router = useRouter();
  const params = useParams();
  const { user } = useAuth();
  const appointmentId = params.id as string;
  
  const [paymentUrl, setPaymentUrl] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // جلب بيانات الموعد
  const { data: appointment, isLoading: appointmentLoading, error: appointmentError, refetch: refetchAppointment } = useQuery({
    queryKey: ['appointment', appointmentId, user?.role],
    queryFn: () => {
      // Backend يعيد string ID (MongoDB ObjectId)
      return appointmentsService.getAppointment(appointmentId, user?.role as 'PATIENT' | 'DOCTOR' | undefined);
    },
    enabled: !!appointmentId,
    retry: 2, // إعادة المحاولة مرتين
    retryDelay: 1000, // انتظار ثانية بين المحاولات
  });

  // جلب حالة الدفع
  const { data: payment, isLoading: paymentLoading, refetch: refetchPayment } = useQuery({
    queryKey: ['payment', appointmentId],
    queryFn: async () => {
      // #region agent log
      fetch('http://127.0.0.1:7246/ingest/e8220b3a-738c-43f7-9083-e1ee47743b54',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'appointments/[id]/payment/page.tsx:39',message:'Fetching payment status',data:{appointmentId},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'H1'})}).catch(()=>{});
      // #endregion
      try {
        const result = await paymentsService.getPaymentByAppointment(appointmentId);
        // #region agent log
        fetch('http://127.0.0.1:7246/ingest/e8220b3a-738c-43f7-9083-e1ee47743b54',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'appointments/[id]/payment/page.tsx:42',message:'Payment status fetched',data:{appointmentId,paymentStatus:result?.status,hasPayment:!!result,paymentId:result?.id,previousStatus:payment?.status,statusChanged:result?.status !== payment?.status},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'H1'})}).catch(()=>{});
        // #endregion
        return result;
      } catch (error: any) {
        // #region agent log
        fetch('http://127.0.0.1:7246/ingest/e8220b3a-738c-43f7-9083-e1ee47743b54',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'appointments/[id]/payment/page.tsx:48',message:'Error fetching payment status',data:{appointmentId,error:error?.message,errorStack:error?.stack},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'H1'})}).catch(()=>{});
        // #endregion
        throw error;
      }
    },
    enabled: !!appointmentId,
    refetchInterval: (query) => {
      // إعادة التحقق كل 3 ثوانٍ إذا كان الدفع قيد الانتظار
      const paymentData = query.state.data as Payment | null | undefined;
      const interval = paymentData?.status === 'PENDING' ? 3000 : false;
      // #region agent log
      fetch('http://127.0.0.1:7246/ingest/e8220b3a-738c-43f7-9083-e1ee47743b54',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'appointments/[id]/payment/page.tsx:57',message:'Refetch interval check',data:{appointmentId,paymentStatus:paymentData?.status,interval,willRefetch:!!interval},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'H1'})}).catch(()=>{});
      // #endregion
      return interval;
    },
  });

  // إنشاء نية دفع
  const createPaymentIntentMutation = useMutation({
    mutationFn: () => paymentsService.createPaymentIntent(appointmentId),
    onSuccess: async (data) => {
      setIsProcessing(true);
      // إعادة جلب معلومات الدفع للحصول على URL
      const paymentInfo = await refetchPayment();
      
      if (paymentInfo.data) {
        // الحصول على URL من metadata
        const paylinkUrl = paymentInfo.data.metadata?.paylinkInvoiceUrl || 
                          `https://paylink.sa/pay/${data.intentId}`;
        setPaymentUrl(paylinkUrl);
        // فتح صفحة الدفع في نافذة جديدة
        window.open(paylinkUrl, '_blank');
      } else {
        // إذا لم يكن URL متوفراً، نستخدم intentId لبناء URL
        const paylinkUrl = `https://paylink.sa/pay/${data.intentId}`;
        setPaymentUrl(paylinkUrl);
        window.open(paylinkUrl, '_blank');
      }
      setIsProcessing(false);
    },
    onError: (error: any) => {
      console.error('Error creating payment intent:', error);
      setIsProcessing(false);
      alert('حدث خطأ في إنشاء نية الدفع. يرجى المحاولة مرة أخرى.');
    },
  });

  // التحقق من حالة الدفع
  useEffect(() => {
    // #region agent log
    fetch('http://127.0.0.1:7246/ingest/e8220b3a-738c-43f7-9083-e1ee47743b54',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'appointments/[id]/payment/page.tsx:79',message:'Payment status check effect triggered',data:{paymentStatus:payment?.status,appointmentId,hasPayment:!!payment,paymentId:payment?.id,isCompleted:payment?.status === 'COMPLETED',isPending:payment?.status === 'PENDING',isFailed:payment?.status === 'FAILED'},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'H1'})}).catch(()=>{});
    // #endregion
    
    if (payment?.status === 'COMPLETED') {
      // #region agent log
      fetch('http://127.0.0.1:7246/ingest/e8220b3a-738c-43f7-9083-e1ee47743b54',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'appointments/[id]/payment/page.tsx:85',message:'Payment completed - before redirect',data:{appointmentId,redirectUrl:`/appointments/confirmation?id=${appointmentId}`,paymentId:payment?.id,paymentStatus:payment?.status,userRole:user?.role,isAuthenticated:!!user,currentPath:typeof window !== 'undefined' ? window.location.pathname : 'N/A'},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'H1'})}).catch(()=>{});
      // #endregion
      
      // الدفع مكتمل - إعادة التوجيه إلى صفحة التأكيد
      try {
        const redirectPath = `/appointments/confirmation?id=${appointmentId}`;
        // #region agent log
        fetch('http://127.0.0.1:7246/ingest/e8220b3a-738c-43f7-9083-e1ee47743b54',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'appointments/[id]/payment/page.tsx:91',message:'Calling router.push',data:{appointmentId,redirectPath},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'H4'})}).catch(()=>{});
        // #endregion
        router.push(redirectPath);
        // #region agent log
        fetch('http://127.0.0.1:7246/ingest/e8220b3a-738c-43f7-9083-e1ee47743b54',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'appointments/[id]/payment/page.tsx:94',message:'Router.push called successfully',data:{appointmentId,redirectPath},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'H4'})}).catch(()=>{});
        // #endregion
      } catch (error: any) {
        // #region agent log
        fetch('http://127.0.0.1:7246/ingest/e8220b3a-738c-43f7-9083-e1ee47743b54',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'appointments/[id]/payment/page.tsx:97',message:'Redirect error',data:{appointmentId,error:error?.message,errorStack:error?.stack,errorName:error?.name},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'H4'})}).catch(()=>{});
        // #endregion
        console.error('Redirect error:', error);
      }
    } else if (payment?.status && payment.status !== 'PENDING') {
      // #region agent log
      fetch('http://127.0.0.1:7246/ingest/e8220b3a-738c-43f7-9083-e1ee47743b54',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'appointments/[id]/payment/page.tsx:103',message:'Payment status is not COMPLETED',data:{appointmentId,paymentStatus:payment?.status,isCompleted:false},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'H1'})}).catch(()=>{});
      // #endregion
    }
  }, [payment?.status, appointmentId, router, payment, user]);

  // جلب URL الدفع من Paylink عند وجود payment pending
  useEffect(() => {
    if (payment && payment.status === 'PENDING' && payment.intentId && !paymentUrl) {
      // بناء URL Paylink
      const paylinkUrl = payment.metadata?.paylinkInvoiceUrl || 
                        `https://paylink.sa/pay/${payment.intentId}`;
      setPaymentUrl(paylinkUrl);
    }
  }, [payment, paymentUrl]);

  if (appointmentLoading || paymentLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loading text="جاري تحميل معلومات الدفع..." />
      </div>
    );
  }

  if (appointmentError || (!appointmentLoading && !appointment)) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="p-8 text-center max-w-md">
          <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">الموعد غير موجود</h2>
          <p className="text-gray-600 mb-6">
            {appointmentError ? 'لم نتمكن من تحميل تفاصيل الموعد. قد يكون الموعد قيد المعالجة.' : 'يرجى التأكد من الرابط وحاول مرة أخرى'}
          </p>
          <div className="flex gap-4 justify-center">
            <Button 
              onClick={() => refetchAppointment()} 
              variant="outline"
              className="border-2 border-primary-500 text-primary-600 hover:bg-primary-50"
            >
              إعادة المحاولة
            </Button>
            <Button onClick={() => router.push('/appointments')}>
              العودة للمواعيد
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  // التأكد من وجود appointment قبل الاستخدام
  if (!appointment) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loading text="جاري تحميل معلومات الدفع..." />
      </div>
    );
  }

  // التحقق من أن الموعد يتطلب دفعاً
  if (!appointment.requiresPayment) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="p-8 text-center max-w-md">
          <AlertCircle className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">هذا الموعد لا يتطلب دفعاً</h2>
          <p className="text-gray-600 mb-6">يمكنك متابعة الموعد مباشرة</p>
          <Button onClick={() => router.push(`/appointments/confirmation?id=${appointmentId}`)}>
            عرض الموعد
          </Button>
        </Card>
      </div>
    );
  }

  const amount = appointment.price || 0;
  const isPaid = payment?.status === 'COMPLETED';
  const isPending = payment?.status === 'PENDING';
  const isFailed = payment?.status === 'FAILED';

  // تنسيق التاريخ والوقت
  const formatDateTime = (dateString?: string): { date: string; time: string } => {
    if (!dateString) {
      return { date: 'غير محدد', time: 'غير محدد' };
    }
    const date = new Date(dateString);
    return {
      date: date.toLocaleDateString('ar-SA', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      }),
      time: date.toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' })
    };
  };

  const dateTime = formatDateTime(appointment.startAt);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
          <h1 className="text-3xl font-bold text-gray-900 mb-2">إتمام الدفع</h1>
          <p className="text-gray-600">يرجى إتمام عملية الدفع لتأكيد حجز الموعد</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* تفاصيل الموعد */}
          <Card className="lg:col-span-2 p-6">
            <h2 className="text-xl font-semibold mb-4">تفاصيل الموعد</h2>
            <div className="space-y-4">
              <div className="flex justify-between items-start">
                <span className="text-gray-600">نوع الموعد:</span>
                <span className="font-semibold text-right">
                  {appointment.type === 'VIDEO' ? 'استشارة فيديو' : 
                   appointment.type === 'CHAT' ? 'استشارة نصية' : 
                   'حجز عيادة'}
                </span>
              </div>
              <div className="flex justify-between items-start">
                <span className="text-gray-600">التاريخ:</span>
                <span className="font-semibold text-right">{dateTime.date}</span>
              </div>
              <div className="flex justify-between items-start">
                <span className="text-gray-600">الوقت:</span>
                <span className="font-semibold text-right">{dateTime.time}</span>
              </div>
              {appointment.doctor && (
                <div className="flex justify-between items-start">
                  <span className="text-gray-600">الطبيب:</span>
                  <span className="font-semibold text-right">
                    {appointment.doctor.name || 
                     `${appointment.doctor.user?.profile?.firstName || ''} ${appointment.doctor.user?.profile?.lastName || ''}`.trim() || 
                     'طبيب'}
                  </span>
                </div>
              )}
              {appointment.service && (
                <div className="flex justify-between items-start">
                  <span className="text-gray-600">الخدمة:</span>
                  <span className="font-semibold text-right">{appointment.service.name}</span>
                </div>
              )}
              {appointment.duration && (
                <div className="flex justify-between items-start">
                  <span className="text-gray-600">المدة:</span>
                  <span className="font-semibold text-right">{appointment.duration} دقيقة</span>
                </div>
              )}
            </div>
          </Card>

          {/* معلومات الدفع */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">معلومات الدفع</h2>
            
            {/* حالة الدفع */}
            {isPaid && (
              <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center gap-2 text-green-700">
                  <CheckCircle className="w-5 h-5" />
                  <span className="font-semibold">تم الدفع بنجاح</span>
                </div>
                <p className="text-sm text-green-600 mt-2">سيتم إعادة توجيهك تلقائياً...</p>
              </div>
            )}

            {isPending && !isPaid && (
              <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="flex items-center gap-2 text-yellow-700">
                  <AlertCircle className="w-5 h-5" />
                  <span className="font-semibold">في انتظار الدفع</span>
                </div>
                <p className="text-sm text-yellow-600 mt-2">يرجى إتمام عملية الدفع</p>
              </div>
            )}

            {isFailed && (
              <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-center gap-2 text-red-700">
                  <XCircle className="w-5 h-5" />
                  <span className="font-semibold">فشل الدفع</span>
                </div>
                {payment?.failureReason && (
                  <p className="text-sm text-red-600 mt-2">{payment.failureReason}</p>
                )}
              </div>
            )}

            {/* المبلغ */}
            <div className="mb-6">
              <div className="flex justify-between items-center mb-2">
                <span className="text-gray-600">المبلغ:</span>
                <span className="text-2xl font-bold text-primary-600">
                  {amount.toFixed(2)} ر.س
                </span>
              </div>
            </div>

            {/* أزرار الإجراء */}
            {!isPaid && (
              <div className="space-y-3">
                {!payment || isFailed ? (
                  <Button
                    onClick={() => createPaymentIntentMutation.mutate()}
                    disabled={createPaymentIntentMutation.isPending || isProcessing}
                    className="w-full gradient-medical text-white hover:opacity-90"
                  >
                    <CreditCard className="w-4 h-4 mr-2" />
                    {createPaymentIntentMutation.isPending || isProcessing ? 'جاري الإنشاء...' : 'الدفع الآن'}
                  </Button>
                ) : isPending && paymentUrl ? (
                  <>
                    <Button
                      onClick={() => window.open(paymentUrl, '_blank')}
                      className="w-full gradient-medical text-white hover:opacity-90"
                    >
                      <CreditCard className="w-4 h-4 mr-2" />
                      فتح صفحة الدفع
                    </Button>
                    <Button
                      onClick={() => refetchPayment()}
                      variant="outline"
                      className="w-full"
                    >
                      <RefreshCw className="w-4 h-4 mr-2" />
                      التحقق من حالة الدفع
                    </Button>
                  </>
                ) : (
                  <Button
                    onClick={() => createPaymentIntentMutation.mutate()}
                    disabled={createPaymentIntentMutation.isPending || isProcessing}
                    className="w-full gradient-medical text-white hover:opacity-90"
                  >
                    <CreditCard className="w-4 h-4 mr-2" />
                    {createPaymentIntentMutation.isPending || isProcessing ? 'جاري الإنشاء...' : 'الدفع الآن'}
                  </Button>
                )}
              </div>
            )}

            {isPaid && (
              <Button
                onClick={() => router.push(`/appointments/confirmation?id=${appointmentId}`)}
                className="w-full gradient-medical text-white hover:opacity-90"
              >
                عرض الموعد
              </Button>
            )}
          </Card>
        </div>

        {/* تعليمات الدفع */}
        {isPending && paymentUrl && (
          <Card className="mt-8 p-6 bg-blue-50 border border-blue-200">
            <h3 className="font-semibold text-blue-900 mb-2">تعليمات الدفع:</h3>
            <ul className="list-disc list-inside text-blue-800 space-y-1 text-sm">
              <li>سيتم فتح صفحة الدفع في نافذة جديدة</li>
              <li>بعد إتمام الدفع، سيتم تحديث حالة الموعد تلقائياً</li>
              <li>يمكنك الضغط على "التحقق من حالة الدفع" للتأكد من اكتمال العملية</li>
              <li>إذا لم يتم تحديث الحالة تلقائياً، اضغط على زر "التحقق من حالة الدفع"</li>
            </ul>
          </Card>
        )}
      </div>
    </div>
  );
}

export default function PaymentPage() {
  return (
    <ProtectedRoute requiredRole="PATIENT">
      <Suspense fallback={<Loading text="جاري التحميل..." />}>
        <PaymentContent />
      </Suspense>
    </ProtectedRoute>
  );
}

