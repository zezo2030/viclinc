'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { ArrowLeft, Calendar, Clock, User, MapPin } from 'lucide-react';
import { appointmentsService } from '@/lib/api/appointments';
import { doctorsService } from '@/lib/api/doctors';
import { useAuth } from '@/lib/contexts/auth-context';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';

function NewAppointmentContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();
  
  const [selectedDoctor, setSelectedDoctor] = useState<any>(null);
  const [appointmentDate, setAppointmentDate] = useState('');
  const [appointmentTime, setAppointmentTime] = useState('');
  const [reason, setReason] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  // Get URL parameters
  const doctorId = searchParams.get('doctorId');
  const specialtyId = searchParams.get('specialtyId');

  // جلب الأطباء
  const { data: doctors, isLoading: doctorsLoading } = useQuery({
    queryKey: ['doctors', specialtyId],
    queryFn: () => doctorsService.getDoctors(),
  });

  // جلب بيانات الطبيب المحدد
  useEffect(() => {
    if (doctorId && doctors) {
      const doctor = doctors.find(d => d.id === parseInt(doctorId));
      if (doctor) {
        setSelectedDoctor(doctor);
      }
    }
  }, [doctorId, doctors]);

  const handleCreateAppointment = async () => {
    if (!selectedDoctor) {
      alert('يرجى اختيار طبيب');
      return;
    }
    if (!appointmentDate || !appointmentTime) {
      alert('يرجى اختيار التاريخ والوقت');
      return;
    }

    try {
      setIsCreating(true);
      
      await appointmentsService.createAppointment({
        patientId: parseInt(user?.id || '0'),
        doctorId: selectedDoctor.id,
        clinicId: selectedDoctor.clinic?.id || 1,
        specialtyId: selectedDoctor.specialty?.id || 1,
        departmentId: selectedDoctor.department?.id || 1,
        appointmentDate: appointmentDate,
        appointmentTime: appointmentTime,
        reason: reason.trim() || undefined,
      });

      router.push('/dashboard');
    } catch (error) {
      console.error('Error creating appointment:', error);
      alert('حدث خطأ في إنشاء الموعد');
    } finally {
      setIsCreating(false);
    }
  };

  if (doctorsLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto mb-4"></div>
            <p>جاري تحميل الأطباء...</p>
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
          <Button
            variant="outline"
            onClick={() => router.back()}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            العودة
          </Button>
          <h1 className="text-3xl font-bold text-gray-900">حجز موعد جديد</h1>
          <p className="text-gray-600 mt-2">اختر طبيبك وحدد موعدك</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* اختيار الطبيب */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">اختيار الطبيب</h2>
            
            {!doctorId && (
              <div className="space-y-3 mb-4">
                {doctors?.map((doctor) => (
                  <Card
                    key={doctor.id}
                    className={`p-4 cursor-pointer transition-colors ${
                      selectedDoctor?.id === doctor.id
                        ? 'border-primary-500 bg-primary-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => setSelectedDoctor(doctor)}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
                        <User className="w-6 h-6 text-primary-600" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold">
                          {doctor.user?.profile?.firstName} {doctor.user?.profile?.lastName}
                        </h3>
                        <p className="text-sm text-gray-600">{doctor.specialty?.name}</p>
                        <p className="text-xs text-gray-500">{doctor.clinic?.name}</p>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}

            {selectedDoctor && (
              <Card className="p-4 border-primary-500 bg-primary-50">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
                    <User className="w-6 h-6 text-primary-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold">
                      {selectedDoctor.user?.profile?.firstName} {selectedDoctor.user?.profile?.lastName}
                    </h3>
                    <p className="text-sm text-gray-600">{selectedDoctor.specialty?.name}</p>
                    <p className="text-xs text-gray-500">{selectedDoctor.clinic?.name}</p>
                  </div>
                </div>
              </Card>
            )}
          </Card>

          {/* تفاصيل الموعد */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">تفاصيل الموعد</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  التاريخ
                </label>
                <Input
                  type="date"
                  value={appointmentDate}
                  onChange={(e) => setAppointmentDate(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  الوقت
                </label>
                <Input
                  type="time"
                  value={appointmentTime}
                  onChange={(e) => setAppointmentTime(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  سبب الزيارة (اختياري)
                </label>
                <textarea
                  className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  rows={3}
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="اكتب سبب زيارتك للطبيب..."
                />
              </div>
            </div>
          </Card>
        </div>

        {/* أزرار الإجراء */}
        <div className="mt-8 flex gap-4 justify-end">
          <Button
            variant="outline"
            onClick={() => router.back()}
          >
            إلغاء
          </Button>
          <Button
            onClick={handleCreateAppointment}
            disabled={!selectedDoctor || !appointmentDate || !appointmentTime || isCreating}
            className="bg-primary-600 hover:bg-primary-700"
          >
            {isCreating ? 'جاري الحجز...' : 'تأكيد الحجز'}
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function NewAppointmentPage() {
  return (
    <ProtectedRoute requiredRole="PATIENT">
      <Suspense fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-500"></div>
        </div>
      }>
        <NewAppointmentContent />
      </Suspense>
    </ProtectedRoute>
  );
}
