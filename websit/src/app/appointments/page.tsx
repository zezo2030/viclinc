'use client';

import React, { Suspense } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Calendar, Clock, User, MapPin, Plus } from 'lucide-react';
import { appointmentsService } from '@/lib/api/appointments';
import { useAuth } from '@/lib/contexts/auth-context';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { useRouter } from 'next/navigation';

function AppointmentsContent() {
  const router = useRouter();
  const { user } = useAuth();

  const { data: appointments, isLoading } = useQuery({
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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">المواعيد</h1>
            <p className="text-gray-600 mt-2">إدارة مواعيدك الطبية</p>
          </div>
          <Button
            onClick={() => router.push('/appointments/new')}
            className="bg-primary-600 hover:bg-primary-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            حجز موعد جديد
          </Button>
        </div>

        {/* المواعيد */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {appointments?.map((appointment) => (
            <Card key={appointment.id} className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                  <User className="w-5 h-5 text-primary-600" />
                </div>
                <div>
                  <h3 className="font-semibold">
                    {user?.role === 'PATIENT' 
                      ? appointment.doctor?.user?.profile?.firstName + ' ' + appointment.doctor?.user?.profile?.lastName
                      : appointment.patient?.profile?.firstName + ' ' + appointment.patient?.profile?.lastName
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

              <div className="space-y-2 mb-4">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Calendar className="w-4 h-4" />
                  <span>{new Date(appointment.appointmentDate).toLocaleDateString('ar-SA')}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Clock className="w-4 h-4" />
                  <span>{appointment.appointmentTime}</span>
                </div>
                {appointment.clinic && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <MapPin className="w-4 h-4" />
                    <span>{appointment.clinic.name}</span>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  appointment.status === 'CONFIRMED' 
                    ? 'bg-green-100 text-green-800'
                    : appointment.status === 'SCHEDULED'
                    ? 'bg-yellow-100 text-yellow-800'
                    : 'bg-red-100 text-red-800'
                }`}>
                  {appointment.status === 'CONFIRMED' ? 'مؤكد' : 
                   appointment.status === 'SCHEDULED' ? 'مجدول' : 'ملغي'}
                </span>
                <Button variant="outline" size="sm">
                  تفاصيل
                </Button>
              </div>
            </Card>
          ))}
        </div>

        {appointments?.length === 0 && (
          <Card className="p-8 text-center">
            <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">لا توجد مواعيد</h3>
            <p className="text-gray-600 mb-4">لم يتم حجز أي مواعيد بعد</p>
            <Button
              onClick={() => router.push('/appointments/new')}
              className="bg-primary-600 hover:bg-primary-700"
            >
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
