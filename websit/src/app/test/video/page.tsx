'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { VideoCall } from '@/components/consultation/VideoCall';
import { appointmentsService } from '@/lib/api/appointments';
import { doctorsService } from '@/lib/api/doctors';
import { servicesApi } from '@/lib/api/services';
import { useAuth } from '@/lib/contexts/auth-context';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { Loading } from '@/components/ui/Loading';
import { Video, User, Calendar, AlertCircle, CheckCircle } from 'lucide-react';

function VideoTestContent() {
  const router = useRouter();
  const { user } = useAuth();
  const [testMode, setTestMode] = useState(true);
  const [selectedDoctor, setSelectedDoctor] = useState<any>(null);
  const [selectedService, setSelectedService] = useState<any>(null);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedSlot, setSelectedSlot] = useState<any>(null);
  const [appointmentId, setAppointmentId] = useState<string>('');
  const [useExistingAppointment, setUseExistingAppointment] = useState(false);
  const [isCreatingAppointment, setIsCreatingAppointment] = useState(false);
  const [createdAppointmentId, setCreatedAppointmentId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [weekStart, setWeekStart] = useState<string>(() => {
    const today = new Date();
    const dayOfWeek = today.getDay();
    const diff = today.getDate() - dayOfWeek;
    const weekStartDate = new Date(today.setDate(diff));
    weekStartDate.setHours(0, 0, 0, 0);
    return weekStartDate.toISOString();
  });

  // جلب الأطباء
  const { data: doctors, isLoading: doctorsLoading } = useQuery({
    queryKey: ['doctors'],
    queryFn: () => doctorsService.getDoctors(),
  });

  // جلب الخدمات عند اختيار الطبيب
  const { data: services, isLoading: servicesLoading } = useQuery({
    queryKey: ['services', selectedDoctor?.departmentId || selectedDoctor?.department?.id],
    queryFn: () => servicesApi.getAll(selectedDoctor?.departmentId || selectedDoctor?.department?.id),
    enabled: !!selectedDoctor,
  });

  // جلب المواعيد المتاحة عند اختيار الطبيب والخدمة
  const { data: availability, isLoading: availabilityLoading } = useQuery({
    queryKey: ['availability', selectedDoctor?.id, selectedService?._id || selectedService?.id, weekStart],
    queryFn: () => {
      if (!selectedDoctor || !selectedService) return null;
      const doctorIdValue = selectedDoctor.id;
      const serviceIdValue = selectedService._id || selectedService.id;
      if (!doctorIdValue || !serviceIdValue) return null;
      return doctorsService.getDoctorAvailability(doctorIdValue, serviceIdValue, weekStart);
    },
    enabled: !!selectedDoctor && !!selectedService && !!(selectedDoctor.id) && !!(selectedService._id || selectedService.id),
  });

  // استخراج التواريخ المتاحة من الفتحات
  const availableDates = React.useMemo(() => {
    if (!availability?.availableSlots) return [];
    const datesSet = new Set<string>();
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    availability.availableSlots.forEach((slot) => {
      const slotDate = new Date(slot.startTime);
      slotDate.setHours(0, 0, 0, 0);
      
      if (slotDate >= today) {
        const date = new Date(slot.startTime).toISOString().split('T')[0];
        datesSet.add(date);
      }
    });
    return Array.from(datesSet).sort();
  }, [availability]);

  // الحصول على الفتحات المتاحة لتاريخ محدد
  const getSlotsForDate = (date: string) => {
    if (!availability?.availableSlots) return [];
    return availability.availableSlots
      .filter((slot) => {
        const slotDate = new Date(slot.startTime).toISOString().split('T')[0];
        return slotDate === date;
      })
      .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());
  };

  // إنشاء موعد تجريبي
  const createTestAppointment = async () => {
    if (!selectedDoctor || !selectedService) {
      setError('يرجى اختيار طبيب وخدمة');
      return;
    }

    if (!selectedDate || !selectedSlot) {
      setError('يرجى اختيار التاريخ والوقت المتاح');
      return;
    }

    try {
      setIsCreatingAppointment(true);
      setError(null);

      const doctorIdValue = selectedDoctor.id;
      const serviceIdValue = (selectedService as any)._id || selectedService.id;
      
      // استخدام التاريخ والوقت المحددين من الفتحة المتاحة
      const startAt = selectedSlot.startTime; // ISO string من الفتحة المتاحة
      
      const appointment = await appointmentsService.createAppointment({
        doctorId: typeof doctorIdValue === 'string' ? doctorIdValue : String(doctorIdValue),
        serviceId: typeof serviceIdValue === 'string' ? serviceIdValue : String(serviceIdValue),
        startAt: startAt,
        type: 'VIDEO',
        metadata: { isTestAppointment: true, testMode: true },
      });

      // في وضع الاختبار، لا نحتاج لتأكيد الموعد - يمكن بدء الجلسة مباشرة
      setCreatedAppointmentId(appointment.id.toString());
    } catch (err: any) {
      console.error('Error creating test appointment:', err);
      setError(err?.response?.data?.message || err?.message || 'فشل في إنشاء الموعد التجريبي');
    } finally {
      setIsCreatingAppointment(false);
    }
  };

  const startTest = () => {
    if (!appointmentId.trim()) {
      setError('يرجى إدخال معرف الموعد');
      return;
    }
    setError(null);
    setCreatedAppointmentId(appointmentId.trim());
  };

  const activeAppointmentId = createdAppointmentId || appointmentId;

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center gap-2">
            <Video className="w-8 h-8 text-primary-600" />
            اختبار مكالمات الفيديو
          </h1>
          <p className="text-gray-600">
            اختبار مكالمات الفيديو بدون الحاجة لانتظار موعد - وضع الاختبار مفعّل تلقائياً
          </p>
        </div>

        {/* Test Mode Info */}
        <Card className="p-6 mb-6 bg-blue-50 border-blue-200">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
            <div>
              <h3 className="font-semibold text-blue-900 mb-1">وضع الاختبار مفعّل</h3>
              <p className="text-sm text-blue-700">
                في هذا الوضع، يمكنك بدء مكالمات الفيديو مباشرة بدون الحاجة لانتظار 10 دقائق قبل الموعد.
                هذا الوضع مخصص للاختبار والتطوير فقط.
              </p>
            </div>
          </div>
        </Card>

        {!activeAppointmentId ? (
          <div className="space-y-6">
            {/* Toggle between create and use existing */}
            <Card className="p-6">
              <div className="flex gap-4 mb-6">
                <Button
                  variant={!useExistingAppointment ? 'default' : 'outline'}
                  onClick={() => setUseExistingAppointment(false)}
                  className="flex-1"
                >
                  إنشاء موعد تجريبي جديد
                </Button>
                <Button
                  variant={useExistingAppointment ? 'default' : 'outline'}
                  onClick={() => setUseExistingAppointment(true)}
                  className="flex-1"
                >
                  استخدام موعد موجود
                </Button>
              </div>

              {!useExistingAppointment ? (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    إنشاء موعد تجريبي
                  </h3>

                  {/* Select Doctor */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      اختر الطبيب
                    </label>
                    {doctorsLoading ? (
                      <Loading text="جاري تحميل الأطباء..." />
                    ) : (
                      <select
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                        value={selectedDoctor ? String(selectedDoctor.id) : ''}
                        onChange={(e) => {
                          const selectedId = e.target.value;
                          const doctor = doctors?.find((d) => String(d.id) === selectedId);
                          setSelectedDoctor(doctor || null);
                          setSelectedService(null);
                        }}
                      >
                        <option value="">-- اختر طبيب --</option>
                        {doctors?.map((doctor) => (
                          <option
                            key={doctor.id}
                            value={String(doctor.id)}
                          >
                            {doctor.user?.profile?.firstName} {doctor.user?.profile?.lastName} - {doctor.specialization}
                          </option>
                        ))}
                      </select>
                    )}
                  </div>

                  {/* Select Service */}
                  {selectedDoctor && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        اختر الخدمة
                      </label>
                      {servicesLoading ? (
                        <Loading text="جاري تحميل الخدمات..." />
                      ) : (
                        <select
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                          value={selectedService?._id || selectedService?.id || ''}
                          onChange={(e) => {
                            const service = services?.find(
                              (s) => String(s._id || s.id) === e.target.value
                            );
                            setSelectedService(service || null);
                            setSelectedDate('');
                            setSelectedSlot(null);
                          }}
                        >
                          <option value="">-- اختر خدمة --</option>
                          {services?.map((service) => {
                            const serviceId = service._id || service.id;
                            return (
                              <option
                                key={serviceId}
                                value={String(serviceId)}
                              >
                                {service.name} - {(service as any).price || 0} ريال
                              </option>
                            );
                          })}
                        </select>
                      )}
                    </div>
                  )}

                  {/* Select Date */}
                  {selectedDoctor && selectedService && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        اختر التاريخ
                      </label>
                      {availabilityLoading ? (
                        <Loading text="جاري تحميل التواريخ المتاحة..." />
                      ) : availableDates.length === 0 ? (
                        <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                          <p className="text-sm text-yellow-700">
                            لا توجد مواعيد متاحة حالياً. يرجى المحاولة لاحقاً.
                          </p>
                        </div>
                      ) : (
                        <select
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                          value={selectedDate}
                          onChange={(e) => {
                            setSelectedDate(e.target.value);
                            setSelectedSlot(null);
                          }}
                        >
                          <option value="">-- اختر تاريخ --</option>
                          {availableDates.map((date) => {
                            const dateObj = new Date(date);
                            const formattedDate = dateObj.toLocaleDateString('ar-SA', {
                              weekday: 'long',
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
                            });
                            return (
                              <option key={date} value={date}>
                                {formattedDate}
                              </option>
                            );
                          })}
                        </select>
                      )}
                    </div>
                  )}

                  {/* Select Time Slot */}
                  {selectedDate && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        اختر الوقت
                      </label>
                      {getSlotsForDate(selectedDate).length === 0 ? (
                        <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                          <p className="text-sm text-yellow-700">
                            لا توجد أوقات متاحة في هذا التاريخ.
                          </p>
                        </div>
                      ) : (
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                          {getSlotsForDate(selectedDate).map((slot, index) => {
                            const slotTime = new Date(slot.startTime);
                            const timeString = slotTime.toLocaleTimeString('ar-SA', {
                              hour: '2-digit',
                              minute: '2-digit',
                            });
                            const isSelected = selectedSlot?.startTime === slot.startTime;
                            return (
                              <button
                                key={index}
                                type="button"
                                onClick={() => setSelectedSlot(slot)}
                                className={`p-3 rounded-lg border-2 transition-all ${
                                  isSelected
                                    ? 'border-primary-500 bg-primary-50 text-primary-700 font-semibold'
                                    : 'border-gray-200 hover:border-gray-300 bg-white'
                                }`}
                              >
                                {timeString}
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  )}

                  <Button
                    onClick={createTestAppointment}
                    disabled={!selectedDoctor || !selectedService || !selectedDate || !selectedSlot || isCreatingAppointment}
                    className="w-full bg-primary-600 hover:bg-primary-700 text-white"
                  >
                    {isCreatingAppointment ? 'جاري الإنشاء...' : 'إنشاء موعد تجريبي وبدء الاختبار'}
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    استخدام موعد موجود
                  </h3>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      معرف الموعد (Appointment ID)
                    </label>
                    <Input
                      type="text"
                      placeholder="أدخل معرف الموعد"
                      value={appointmentId}
                      onChange={(e) => setAppointmentId(e.target.value)}
                      className="w-full"
                    />
                  </div>

                  <Button
                    onClick={startTest}
                    disabled={!appointmentId.trim()}
                    className="w-full bg-primary-600 hover:bg-primary-700 text-white"
                  >
                    بدء الاختبار
                  </Button>
                </div>
              )}

              {error && (
                <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              )}
            </Card>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Success Message */}
            <Card className="p-6 bg-green-50 border-green-200">
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                <div className="flex-1">
                  <h3 className="font-semibold text-green-900 mb-1">
                    جاهز للاختبار
                  </h3>
                  <p className="text-sm text-green-700 mb-2">
                    معرف الموعد: <strong>{activeAppointmentId}</strong>
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setCreatedAppointmentId(null);
                      setAppointmentId('');
                      setError(null);
                    }}
                    className="mt-2"
                  >
                    إنشاء موعد جديد
                  </Button>
                </div>
              </div>
            </Card>

            {/* Video Call Component */}
            <Card className="p-6">
              <VideoCall
                consultationId={activeAppointmentId}
                userId={user?.id || '0'}
                userRole={user?.role as 'PATIENT' | 'DOCTOR' | undefined}
                testMode={true}
                onCallEnd={() => {
                  // يمكن إضافة منطق إضافي هنا
                }}
              />
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}

export default function VideoTestPage() {
  return (
    <ProtectedRoute>
      <VideoTestContent />
    </ProtectedRoute>
  );
}

