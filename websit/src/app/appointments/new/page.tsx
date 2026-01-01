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
import { servicesApi, ServiceApi } from '@/lib/api/services';
import { useAuth } from '@/lib/contexts/auth-context';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';

function NewAppointmentContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();
  
  // التأكد من أن weekStart يبدأ من اليوم الحالي وليس تاريخ قديم
  const getTodayDate = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return today.toISOString().split('T')[0];
  };
  
  const [selectedDoctor, setSelectedDoctor] = useState<any>(null);
  const [selectedService, setSelectedService] = useState<ServiceApi | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedSlot, setSelectedSlot] = useState<{ startTime: string; endTime: string } | null>(null);
  const [appointmentType, setAppointmentType] = useState<'IN_PERSON' | 'VIDEO' | 'CHAT'>('IN_PERSON');
  const [reason, setReason] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [weekStart, setWeekStart] = useState<string>(getTodayDate());

  // Get URL parameters
  const doctorId = searchParams.get('doctorId');
  const specialtyId = searchParams.get('specialtyId');
  const typeParam = searchParams.get('type') as 'IN_PERSON' | 'VIDEO' | 'CHAT' | null;
  
  // Set appointment type from URL parameter
  useEffect(() => {
    if (typeParam && ['IN_PERSON', 'VIDEO', 'CHAT'].includes(typeParam)) {
      setAppointmentType(typeParam);
    }
  }, [typeParam]);

  // جلب بيانات الطبيب المحدد مباشرة إذا كان doctorId موجود
  const { data: doctorData, isLoading: doctorLoading } = useQuery({
    queryKey: ['doctor', doctorId],
    queryFn: () => {
      if (doctorId) {
        return doctorsService.getDoctor(doctorId);
      }
      return null;
    },
    enabled: !!doctorId, // فقط إذا كان doctorId موجود
  });

  // جلب الأطباء فقط إذا لم يكن doctorId موجود (للاختيار الحر)
  const { data: doctors, isLoading: doctorsLoading } = useQuery({
    queryKey: ['doctors', specialtyId],
    queryFn: () => doctorsService.getDoctors(),
    enabled: !doctorId, // فقط إذا لم يكن doctorId موجود
  });

  // تعيين الطبيب المحدد عند جلب بياناته
  useEffect(() => {
    if (doctorData) {
      setSelectedDoctor(doctorData);
      // إعادة تعيين الخدمة والتاريخ عند تغيير الطبيب
      setSelectedService(null);
      setSelectedDate('');
      setSelectedSlot(null);
      // إعادة تعيين weekStart إلى اليوم الحالي
      setWeekStart(getTodayDate());
    }
  }, [doctorData]);

  // جلب الخدمات المتاحة
  const { data: services, isLoading: servicesLoading } = useQuery({
    queryKey: ['services', selectedDoctor?.departmentId || selectedDoctor?.department?.id],
    queryFn: () => servicesApi.getAll(selectedDoctor?.departmentId || selectedDoctor?.department?.id),
    enabled: !!selectedDoctor,
  });

  // جلب التوفر عند اختيار الطبيب والخدمة
  const { data: availability, isLoading: availabilityLoading } = useQuery({
    queryKey: ['availability', selectedDoctor?._id || selectedDoctor?.id, selectedService?._id || selectedService?.id, weekStart],
    queryFn: () => {
      if (!selectedDoctor || !selectedService) return null;
      const doctorIdValue = selectedDoctor._id || selectedDoctor.id;
      const serviceIdValue = selectedService._id || selectedService.id;
      if (!doctorIdValue || !serviceIdValue) return null;
      return doctorsService.getDoctorAvailability(doctorIdValue, serviceIdValue, weekStart);
    },
    enabled: !!selectedDoctor && !!selectedService && !!(selectedDoctor._id || selectedDoctor.id) && !!(selectedService._id || selectedService.id),
  });

  // استخراج التواريخ المتاحة من الفتحات مع تصفية التواريخ القديمة
  const availableDates = React.useMemo(() => {
    if (!availability?.availableSlots) return [];
    const datesSet = new Set<string>();
    const today = new Date();
    today.setHours(0, 0, 0, 0); // إزالة الوقت للتحقق من التاريخ فقط
    
    availability.availableSlots.forEach((slot) => {
      const slotDate = new Date(slot.startTime);
      slotDate.setHours(0, 0, 0, 0); // إزالة الوقت للتحقق من التاريخ فقط
      
      // تصفية التواريخ القديمة - فقط التواريخ من اليوم فصاعداً
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

  const handleCreateAppointment = async () => {
    if (!selectedDoctor) {
      alert('يرجى اختيار طبيب');
      return;
    }
    if (!selectedService) {
      alert('يرجى اختيار الخدمة');
      return;
    }
    if (!selectedDate || !selectedSlot) {
      alert('يرجى اختيار التاريخ والوقت المتاح');
      return;
    }

    try {
      setIsCreating(true);
      
      // استخدام _id إذا كان موجود (MongoDB) أو id (number)
      const doctorIdValue = selectedDoctor._id || selectedDoctor.id;
      const serviceIdValue = selectedService._id || selectedService.id;
      
      // استخدام startAt (ISO string) مباشرة من selectedSlot
      const startAt = selectedSlot.startTime; // ISO string
      
      // #region agent log
      fetch('http://127.0.0.1:7246/ingest/e8220b3a-738c-43f7-9083-e1ee47743b54',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'appointments/new/page.tsx:141',message:'Creating appointment',data:{appointmentType,doctorId:doctorIdValue,serviceId:serviceIdValue,startAt},timestamp:Date.now(),sessionId:'debug-session',runId:'post-fix',hypothesisId:'PAYMENT_FIX'})}).catch(()=>{});
      // #endregion

      // إنشاء الموعد
      const appointment = await appointmentsService.createAppointment({
        doctorId: typeof doctorIdValue === 'string' ? doctorIdValue : String(doctorIdValue),
        serviceId: typeof serviceIdValue === 'string' ? serviceIdValue : String(serviceIdValue),
        startAt: startAt,
        type: appointmentType,
        metadata: reason.trim() ? { reason: reason.trim() } : undefined,
      });

      // #region agent log
      fetch('http://127.0.0.1:7246/ingest/e8220b3a-738c-43f7-9083-e1ee47743b54',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'appointments/new/page.tsx:150',message:'Appointment created successfully',data:{appointmentId:appointment.id,appointmentType,price:appointment.price,requiresPayment:appointment.requiresPayment,paymentStatus:appointment.paymentStatus,willRedirectToPayment:appointment.requiresPayment && appointment.paymentStatus === 'PENDING'},timestamp:Date.now(),sessionId:'debug-session',runId:'post-fix',hypothesisId:'PAYMENT_FIX'})}).catch(()=>{});
      // #endregion

      // ✅ التحقق من الدفع
      const appointmentId = typeof appointment.id === 'string' ? appointment.id : String(appointment.id);
      
      // #region agent log
      fetch('http://127.0.0.1:7246/ingest/e8220b3a-738c-43f7-9083-e1ee47743b54',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'appointments/new/page.tsx:152',message:'Before redirect',data:{appointmentId,requiresPayment:appointment.requiresPayment,paymentStatus:appointment.paymentStatus,redirectPath:appointment.requiresPayment && appointment.paymentStatus === 'PENDING' ? `/appointments/${appointmentId}/payment` : `/appointments/confirmation?id=${appointmentId}`},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
      // #endregion
      
      if (appointment.requiresPayment && appointment.paymentStatus === 'PENDING') {
        // إعادة التوجيه إلى صفحة الدفع
        router.push(`/appointments/${appointmentId}/payment`);
      } else {
        // إعادة التوجيه إلى صفحة التأكيد
        router.push(`/appointments/confirmation?id=${appointmentId}`);
      }
    } catch (error) {
      console.error('Error creating appointment:', error);
      alert('حدث خطأ في إنشاء الموعد');
    } finally {
      setIsCreating(false);
    }
  };

  if (doctorLoading || (doctorsLoading && !doctorId)) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto mb-4"></div>
            <p>{doctorId ? 'جاري تحميل بيانات الطبيب...' : 'جاري تحميل الأطباء...'}</p>
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
          <h1 className="text-3xl font-bold text-gray-900 mb-2">حجز موعد جديد</h1>
          <p className="text-gray-600">اختر طبيبك وحدد موعدك</p>
          
          {/* Appointment Type Selection */}
          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
            <button
              onClick={() => setAppointmentType('IN_PERSON')}
              className={`p-4 rounded-xl border-2 transition-all ${
                appointmentType === 'IN_PERSON'
                  ? 'border-primary-500 bg-primary-50 shadow-md'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <Calendar className={`w-6 h-6 mx-auto mb-2 ${appointmentType === 'IN_PERSON' ? 'text-primary-600' : 'text-gray-400'}`} />
              <div className="font-semibold text-gray-900">حجز عيادة</div>
              <div className="text-sm text-gray-600">موعد شخصي في العيادة</div>
            </button>
            <button
              onClick={() => setAppointmentType('VIDEO')}
              className={`p-4 rounded-xl border-2 transition-all ${
                appointmentType === 'VIDEO'
                  ? 'border-secondary-500 bg-secondary-50 shadow-md'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <svg className={`w-6 h-6 mx-auto mb-2 ${appointmentType === 'VIDEO' ? 'text-secondary-600' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              <div className="font-semibold text-gray-900">استشارة فيديو</div>
              <div className="text-sm text-gray-600">استشارة مباشرة عبر الفيديو</div>
            </button>
            <button
              onClick={() => setAppointmentType('CHAT')}
              className={`p-4 rounded-xl border-2 transition-all ${
                appointmentType === 'CHAT'
                  ? 'border-primary-400 bg-primary-50 shadow-md'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <svg className={`w-6 h-6 mx-auto mb-2 ${appointmentType === 'CHAT' ? 'text-primary-500' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              <div className="font-semibold text-gray-900">استشارة نصية</div>
              <div className="text-sm text-gray-600">محادثة نصية مع الطبيب</div>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* اختيار الطبيب */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">
              {doctorId ? 'الطبيب المحدد' : 'اختيار الطبيب'}
            </h2>
            
            {/* عرض قائمة الأطباء فقط إذا لم يكن doctorId محدد */}
            {!doctorId && (
              <div className="space-y-3 mb-4">
                {doctors?.map((doctor: any) => (
                  <Card
                    key={doctor.id || doctor._id}
                    className={`p-4 cursor-pointer transition-colors ${
                      selectedDoctor?.id === doctor.id || selectedDoctor?._id === doctor._id
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
                          {doctor.name || `${doctor.user?.profile?.firstName || ''} ${doctor.user?.profile?.lastName || ''}`.trim() || 'طبيب'}
                        </h3>
                        <p className="text-sm text-gray-600">{doctor.bio || doctor.specialization || doctor.specialty?.name || 'تخصص غير محدد'}</p>
                        <p className="text-xs text-gray-500">{doctor.departmentName || doctor.department?.name || doctor.clinic?.name || ''}</p>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}

            {/* عرض معلومات الطبيب المحدد */}
            {selectedDoctor && (
              <Card className="p-4 border-primary-500 bg-primary-50">
                <div className="flex items-center gap-3">
                  {selectedDoctor.photos && selectedDoctor.photos.length > 0 ? (
                    <img 
                      src={selectedDoctor.photos[0]} 
                      alt={selectedDoctor.name}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
                      <User className="w-6 h-6 text-primary-600" />
                    </div>
                  )}
                  <div className="flex-1">
                    <h3 className="font-semibold">
                      {selectedDoctor.name || `${selectedDoctor.user?.profile?.firstName || ''} ${selectedDoctor.user?.profile?.lastName || ''}`.trim() || 'طبيب'}
                    </h3>
                    <p className="text-sm text-gray-600">{selectedDoctor.bio || selectedDoctor.specialization || selectedDoctor.specialty?.name || 'تخصص غير محدد'}</p>
                    <p className="text-xs text-gray-500">
                      {selectedDoctor.departmentName || selectedDoctor.department?.name || ''}
                      {selectedDoctor.yearsOfExperience && ` • ${selectedDoctor.yearsOfExperience} سنوات خبرة`}
                    </p>
                  </div>
                </div>
              </Card>
            )}

            {/* رسالة إذا لم يكن هناك أطباء ولا طبيب محدد */}
            {!doctorId && !doctorsLoading && (!doctors || doctors.length === 0) && (
              <p className="text-gray-500 text-center py-4">لا توجد أطباء متاحين</p>
            )}
          </Card>

          {/* تفاصيل الموعد */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">تفاصيل الموعد</h2>
            
            <div className="space-y-4">
              {/* اختيار الخدمة */}
              {selectedDoctor && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    الخدمة <span className="text-red-500">*</span>
                  </label>
                  {servicesLoading ? (
                    <div className="text-center py-4">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-600 mx-auto"></div>
                      <p className="text-sm text-gray-500 mt-2">جاري تحميل الخدمات...</p>
                    </div>
                  ) : services && services.length > 0 ? (
                    <select
                      className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      value={selectedService?._id || selectedService?.id || ''}
                      onChange={(e) => {
                        const service = services.find(s => (s._id || s.id) === e.target.value);
                        setSelectedService(service || null);
                        setSelectedDate('');
                        setSelectedSlot(null);
                        // إعادة تعيين weekStart إلى اليوم الحالي عند تغيير الخدمة
                        setWeekStart(getTodayDate());
                      }}
                    >
                      <option value="">اختر الخدمة</option>
                      {services.map((service) => (
                        <option key={service._id || service.id} value={service._id || service.id}>
                          {service.name} {service.defaultDurationMin ? `(${service.defaultDurationMin} دقيقة)` : ''}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <p className="text-gray-500 text-sm">لا توجد خدمات متاحة</p>
                  )}
                </div>
              )}

              {/* اختيار التاريخ - حسب التواريخ المتاحة */}
              {selectedDoctor && selectedService && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    التاريخ <span className="text-red-500">*</span>
                  </label>
                  {availabilityLoading ? (
                    <div className="text-center py-4">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-600 mx-auto"></div>
                      <p className="text-sm text-gray-500 mt-2">جاري تحميل التواريخ المتاحة...</p>
                    </div>
                  ) : availableDates.length > 0 ? (
                    <div className="space-y-2">
                      <select
                        className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        value={selectedDate}
                        onChange={(e) => {
                          setSelectedDate(e.target.value);
                          setSelectedSlot(null);
                        }}
                      >
                        <option value="">اختر التاريخ</option>
                        {availableDates.map((date) => {
                          const dateObj = new Date(date);
                          const dayName = dateObj.toLocaleDateString('ar-SA', { weekday: 'long' });
                          const formattedDate = dateObj.toLocaleDateString('ar-SA');
                          return (
                            <option key={date} value={date}>
                              {dayName} - {formattedDate}
                            </option>
                          );
                        })}
                      </select>
                      {availableDates.length === 0 && (
                        <p className="text-sm text-gray-500">لا توجد تواريخ متاحة في هذا الأسبوع</p>
                      )}
                      {/* أزرار التنقل بين الأسابيع */}
                      <div className="flex gap-2 justify-between mt-2">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          disabled={(() => {
                            const today = new Date();
                            today.setHours(0, 0, 0, 0);
                            const weekStartDate = new Date(weekStart);
                            weekStartDate.setHours(0, 0, 0, 0);
                            // تعطيل الزر إذا كان الأسبوع الحالي هو اليوم أو قبل اليوم
                            return weekStartDate <= today;
                          })()}
                          onClick={() => {
                            const currentWeek = new Date(weekStart);
                            currentWeek.setDate(currentWeek.getDate() - 7);
                            // التأكد من عدم الانتقال إلى تاريخ قديم
                            const today = new Date();
                            today.setHours(0, 0, 0, 0);
                            const newWeekStart = currentWeek.toISOString().split('T')[0];
                            const newWeekStartDate = new Date(newWeekStart);
                            newWeekStartDate.setHours(0, 0, 0, 0);
                            
                            if (newWeekStartDate >= today) {
                              setWeekStart(newWeekStart);
                              setSelectedDate('');
                              setSelectedSlot(null);
                            } else {
                              // إذا كان التاريخ قديماً، استخدم اليوم كحد أدنى
                              setWeekStart(getTodayDate());
                              setSelectedDate('');
                              setSelectedSlot(null);
                            }
                          }}
                        >
                          الأسبوع السابق
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            const currentWeek = new Date(weekStart);
                            currentWeek.setDate(currentWeek.getDate() + 7);
                            setWeekStart(currentWeek.toISOString().split('T')[0]);
                            setSelectedDate('');
                            setSelectedSlot(null);
                          }}
                        >
                          الأسبوع التالي
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-4">
                      <p className="text-gray-500 text-sm mb-2">لا توجد تواريخ متاحة</p>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          const currentWeek = new Date(weekStart);
                          currentWeek.setDate(currentWeek.getDate() + 7);
                          setWeekStart(currentWeek.toISOString().split('T')[0]);
                        }}
                      >
                        عرض الأسبوع التالي
                      </Button>
                    </div>
                  )}
                </div>
              )}

              {/* عرض الفتحات المتاحة */}
              {selectedDate && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    الفتحات المتاحة <span className="text-red-500">*</span>
                  </label>
                  {(() => {
                    const slots = getSlotsForDate(selectedDate);
                    if (slots.length === 0) {
                      return (
                        <p className="text-gray-500 text-sm text-center py-4">
                          لا توجد فتحات متاحة في هذا التاريخ
                        </p>
                      );
                    }
                    return (
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                        {slots.map((slot, index) => {
                          const startTime = new Date(slot.startTime);
                          const endTime = new Date(slot.endTime);
                          const timeStr = `${startTime.toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' })} - ${endTime.toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' })}`;
                          const isSelected = selectedSlot?.startTime === slot.startTime;
                          
                          return (
                            <button
                              key={index}
                              type="button"
                              onClick={() => setSelectedSlot({ startTime: slot.startTime, endTime: slot.endTime })}
                              className={`p-3 border-2 rounded-md text-sm font-medium transition-colors ${
                                isSelected
                                  ? 'border-primary-500 bg-primary-50 text-primary-700'
                                  : 'border-gray-300 hover:border-primary-300 hover:bg-gray-50'
                              }`}
                            >
                              <Clock className="w-4 h-4 inline-block mr-1" />
                              {timeStr}
                            </button>
                          );
                        })}
                      </div>
                    );
                  })()}
                </div>
              )}

              {/* سبب الزيارة */}
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
            disabled={!selectedDoctor || !selectedService || !selectedDate || !selectedSlot || isCreating}
            className="gradient-medical text-white hover:opacity-90 shadow-md"
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
