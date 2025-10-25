'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { ArrowLeft, Video, MessageSquare, Calendar, Clock, User } from 'lucide-react';
import { consultationService } from '@/lib/api/consultations';
import { appointmentsService } from '@/lib/api/appointments';
import { useAuth } from '@/lib/contexts/auth-context';

function NewConsultationContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const [selectedAppointment, setSelectedAppointment] = useState<number | null>(null);
  const [consultationType, setConsultationType] = useState<'VIDEO' | 'CHAT'>('VIDEO');
  const [notes, setNotes] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  // Get URL parameters
  const doctorId = searchParams.get('doctorId');
  const type = searchParams.get('type');

  // Set initial consultation type from URL parameter
  useEffect(() => {
    if (type === 'video' || type === 'VIDEO') {
      setConsultationType('VIDEO');
    } else if (type === 'chat' || type === 'CHAT') {
      setConsultationType('CHAT');
    }
  }, [type]);

  // الحصول على المواعيد المتاحة
  const { data: appointments, isLoading } = useQuery({
    queryKey: ['appointments', user?.id, user?.role, doctorId],
    queryFn: () => {
      if (user?.role === 'PATIENT') {
        return appointmentsService.getPatientAppointments(parseInt(user.id));
      } else if (user?.role === 'DOCTOR') {
        return appointmentsService.getDoctorAppointments(parseInt(user.id));
      }
      return appointmentsService.getAppointments();
    },
  });

  // فلترة المواعيد المؤكدة فقط
  let availableAppointments = appointments?.filter(
    appointment => appointment.status === 'CONFIRMED'
  ) || [];

  // Filter by doctorId if provided
  if (doctorId) {
    availableAppointments = availableAppointments.filter(
      appointment => appointment.doctor?.id === parseInt(doctorId)
    );
  }

  const handleCreateConsultation = async () => {
    if (!selectedAppointment) {
      alert('يرجى اختيار موعد');
      return;
    }

    try {
      setIsCreating(true);
      
      await consultationService.createConsultation({
        appointmentId: selectedAppointment,
        type: consultationType,
        notes: notes.trim() || undefined,
      });

      router.push('/consultations');
    } catch (error) {
      console.error('Error creating consultation:', error);
      alert('حدث خطأ في إنشاء الاستشارة');
    } finally {
      setIsCreating(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto mb-4"></div>
            <p>جاري تحميل المواعيد...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-4 mb-4">
            <Button
              onClick={() => router.back()}
              variant="outline"
              size="sm"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              العودة
            </Button>
            <h1 className="text-3xl font-bold text-gray-900">
              إنشاء استشارة جديدة
            </h1>
          </div>
          <p className="text-gray-600">
            اختر موعداً وأنشئ استشارة طبية افتراضية
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* اختيار الموعد */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-6">اختيار الموعد</h2>
            
            {availableAppointments.length === 0 ? (
              <div className="text-center py-8">
                <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  لا توجد مواعيد متاحة
                </h3>
                <p className="text-gray-600 mb-6">
                  يجب أن يكون لديك مواعيد مؤكدة لإنشاء استشارة
                </p>
                <Button
                  onClick={() => router.push('/appointments/new')}
                  className="bg-primary-600 hover:bg-primary-700 text-white"
                >
                  حجز موعد جديد
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {availableAppointments.map((appointment) => (
                  <div
                    key={appointment.id}
                    className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                      selectedAppointment === appointment.id
                        ? 'border-primary-500 bg-primary-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => setSelectedAppointment(appointment.id)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="flex items-center space-x-2">
                          <User className="w-4 h-4 text-gray-600" />
                          <span className="font-medium">
                            {user?.role === 'PATIENT' 
                              ? `${appointment.doctor?.user?.profile?.firstName || ''} ${appointment.doctor?.user?.profile?.lastName || ''}`
                              : `${appointment.patient?.profile?.firstName || ''} ${appointment.patient?.profile?.lastName || ''}`
                            }
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center space-x-2 text-sm text-gray-600">
                          <Calendar className="w-4 h-4" />
                          <span>
                            {new Date(appointment.appointmentDate).toLocaleDateString('ar-SA')}
                          </span>
                        </div>
                        <div className="flex items-center space-x-2 text-sm text-gray-600">
                          <Clock className="w-4 h-4" />
                          <span>
                            {new Date(appointment.appointmentTime).toLocaleTimeString('ar-SA')}
                          </span>
                        </div>
                      </div>
                    </div>
                    {appointment.reason && (
                      <p className="text-sm text-gray-600 mt-2">
                        السبب: {appointment.reason}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* إعدادات الاستشارة */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-6">إعدادات الاستشارة</h2>
            
            <div className="space-y-6">
              {/* نوع الاستشارة */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  نوع الاستشارة
                </label>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    type="button"
                    onClick={() => setConsultationType('VIDEO')}
                    className={`p-4 border rounded-lg text-center transition-colors ${
                      consultationType === 'VIDEO'
                        ? 'border-primary-500 bg-primary-50 text-primary-700'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <Video className="w-6 h-6 mx-auto mb-2" />
                    <div className="font-medium">مكالمة فيديو</div>
                    <div className="text-sm text-gray-600">مكالمة مرئية مباشرة</div>
                  </button>
                  
                  <button
                    type="button"
                    onClick={() => setConsultationType('CHAT')}
                    className={`p-4 border rounded-lg text-center transition-colors ${
                      consultationType === 'CHAT'
                        ? 'border-primary-500 bg-primary-50 text-primary-700'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <MessageSquare className="w-6 h-6 mx-auto mb-2" />
                    <div className="font-medium">دردشة</div>
                    <div className="text-sm text-gray-600">رسائل نصية</div>
                  </button>
                </div>
              </div>

              {/* ملاحظات */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  ملاحظات (اختياري)
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="أضف أي ملاحظات حول الاستشارة..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                  rows={4}
                  maxLength={500}
                />
                <div className="mt-1 text-xs text-gray-500">
                  {notes.length}/500 حرف
                </div>
              </div>

              {/* أزرار الإجراءات */}
              <div className="flex space-x-4 pt-6">
                <Button
                  onClick={() => router.back()}
                  variant="outline"
                  className="flex-1"
                  disabled={isCreating}
                >
                  إلغاء
                </Button>
                <Button
                  onClick={handleCreateConsultation}
                  className="flex-1 bg-primary-600 hover:bg-primary-700 text-white"
                  disabled={!selectedAppointment || isCreating}
                >
                  {isCreating ? (
                    <div className="flex items-center space-x-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>جاري الإنشاء...</span>
                    </div>
                  ) : (
                    'إنشاء الاستشارة'
                  )}
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default function NewConsultationPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto mb-4"></div>
            <p>جاري التحميل...</p>
          </div>
        </div>
      </div>
    }>
      <NewConsultationContent />
    </Suspense>
  );
}
