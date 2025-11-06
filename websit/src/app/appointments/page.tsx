'use client';

import React, { Suspense } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Calendar, Clock, User, MapPin, Plus, Video, MessageSquare, CalendarCheck } from 'lucide-react';
import { Loading } from '@/components/ui/Loading';
import { appointmentsService, type Appointment } from '@/lib/api/appointments';
import { useAuth } from '@/lib/contexts/auth-context';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { useRouter } from 'next/navigation';

function AppointmentsContent() {
  const router = useRouter();
  const { user } = useAuth();

  const { data: appointmentsData, isLoading } = useQuery({
    queryKey: ['appointments', user?.id, user?.role],
    queryFn: () => {
      if (user?.role === 'PATIENT') {
        return appointmentsService.getPatientAppointments(parseInt(user.id));
      } else if (user?.role === 'DOCTOR') {
        return appointmentsService.getDoctorAppointments(parseInt(user.id));
      }
      return appointmentsService.getAppointments();
    },
  });

  // Handle both array and paginated response
  const appointments: Appointment[] = Array.isArray(appointmentsData) 
    ? appointmentsData 
    : (appointmentsData as any)?.appointments || [];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Loading text="جاري تحميل المواعيد..." />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">المواعيد</h1>
            <p className="text-gray-600">إدارة مواعيدك الطبية</p>
          </div>
          <Button
            onClick={() => router.push('/appointments/new')}
            className="gradient-medical text-white hover:opacity-90 shadow-md"
          >
            <Plus className="w-4 h-4 mr-2" />
            حجز موعد جديد
          </Button>
        </div>

        {/* Filters */}
        <div className="mb-6 flex flex-wrap gap-2">
          <button className="px-4 py-2 rounded-full bg-primary-50 text-primary-600 font-medium text-sm">
            الكل
          </button>
          <button className="px-4 py-2 rounded-full bg-gray-100 text-gray-700 font-medium text-sm hover:bg-gray-200">
            القادمة
          </button>
          <button className="px-4 py-2 rounded-full bg-gray-100 text-gray-700 font-medium text-sm hover:bg-gray-200">
            السابقة
          </button>
        </div>

        {/* المواعيد */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {appointments?.map((appointment: Appointment) => {
            const appointmentType = (appointment as any).type || 'IN_PERSON';
            const typeIcon = appointmentType === 'VIDEO' ? Video : appointmentType === 'CHAT' ? MessageSquare : CalendarCheck;
            const TypeIcon = typeIcon;
            
            return (
              <Card key={appointment.id} className="p-6 hover:shadow-lg transition-shadow border-2 border-gray-100">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                      appointmentType === 'VIDEO' ? 'bg-secondary-100' :
                      appointmentType === 'CHAT' ? 'bg-primary-50' :
                      'bg-primary-100'
                    }`}>
                      <TypeIcon className={`w-6 h-6 ${
                        appointmentType === 'VIDEO' ? 'text-secondary-600' :
                        appointmentType === 'CHAT' ? 'text-primary-500' :
                        'text-primary-600'
                      }`} />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900">
                        {user?.role === 'PATIENT' 
                          ? `د. ${appointment.doctor?.user?.profile?.firstName || ''} ${appointment.doctor?.user?.profile?.lastName || ''}`
                          : `${appointment.patient?.profile?.firstName || ''} ${appointment.patient?.profile?.lastName || ''}`
                        }
                      </h3>
                      <p className="text-sm text-gray-600">
                        {user?.role === 'PATIENT' 
                          ? appointment.doctor?.specialization 
                          : 'مريض'
                        }
                      </p>
                    </div>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    appointment.status === 'CONFIRMED' 
                      ? 'bg-success-100 text-success-700'
                      : appointment.status === 'PENDING_CONFIRM'
                      ? 'bg-warning-100 text-warning-700'
                      : appointment.status === 'COMPLETED'
                      ? 'bg-primary-100 text-primary-700'
                      : appointment.status === 'REJECTED' || appointment.status === 'CANCELLED' || appointment.status === 'NO_SHOW'
                      ? 'bg-error-100 text-error-700'
                      : 'bg-gray-100 text-gray-700'
                  }`}>
                    {appointment.status === 'CONFIRMED' ? 'مؤكد' : 
                     appointment.status === 'PENDING_CONFIRM' ? 'في الانتظار' :
                     appointment.status === 'COMPLETED' ? 'مكتمل' :
                     appointment.status === 'CANCELLED' ? 'ملغي' :
                     appointment.status === 'REJECTED' ? 'مرفوض' :
                     appointment.status === 'NO_SHOW' ? 'لم يحضر' : 'غير محدد'}
                  </span>
                </div>

                <div className="space-y-3 mb-4">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Calendar className="w-4 h-4 text-primary-500" />
                    <span>{new Date(appointment.appointmentDate || (appointment as any).startAt).toLocaleDateString('ar-SA', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Clock className="w-4 h-4 text-secondary-500" />
                    <span>{appointment.appointmentTime || new Date((appointment as any).startAt).toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                  {appointment.clinic && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <MapPin className="w-4 h-4 text-success-500" />
                      <span>{appointment.clinic.name}</span>
                    </div>
                  )}
                </div>

                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex-1 border-2 border-primary-500 text-primary-600 hover:bg-primary-50"
                    onClick={() => router.push(`/appointments/${appointment.id}`)}
                  >
                    تفاصيل
                  </Button>
                  {(appointmentType === 'VIDEO' || appointmentType === 'CHAT') && appointment.status === 'CONFIRMED' && (
                    <Button 
                      size="sm" 
                      className="flex-1 gradient-medical text-white hover:opacity-90"
                      onClick={() => router.push(`/consultations/${(appointment as any)._id || appointment.id}`)}
                    >
                      {appointmentType === 'VIDEO' ? 'ابدأ الفيديو' : 'ابدأ المحادثة'}
                    </Button>
                  )}
                </div>
              </Card>
            );
          })}
        </div>

        {appointments?.length === 0 && (
          <Card className="p-12 text-center gradient-medical-light border-2 border-primary-100">
            <div className="w-20 h-20 mx-auto mb-6 bg-white rounded-full flex items-center justify-center shadow-lg">
              <Calendar className="w-10 h-10 text-primary-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">لا توجد مواعيد</h3>
            <p className="text-gray-600 mb-6">لم يتم حجز أي مواعيد بعد. ابدأ بحجز موعدك الأول الآن!</p>
            <Button
              onClick={() => router.push('/appointments/new')}
              className="gradient-medical text-white hover:opacity-90 shadow-md"
              size="lg"
            >
              <Plus className="w-5 h-5 ml-2" />
              حجز موعد جديد
            </Button>
          </Card>
        )}
      </div>
    </div>
  );
}

export default function AppointmentsPage() {
  return (
    <ProtectedRoute>
      <Suspense fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-500"></div>
        </div>
      }>
        <AppointmentsContent />
      </Suspense>
    </ProtectedRoute>
  );
}
