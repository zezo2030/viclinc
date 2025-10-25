'use client';

import React from 'react';
import { ProtectedRoute } from '@/components/auth';
import { useAuth } from '@/lib/contexts/auth-context';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { StatsCard } from '@/components/dashboard/StatsCard';
import { UpcomingAppointments } from '@/components/dashboard/UpcomingAppointments';
import { QuickActions } from '@/components/dashboard/QuickActions';
import { RecentActivity } from '@/components/dashboard/RecentActivity';
import { SpecialtiesOverview } from '@/components/dashboard/SpecialtiesOverview';
import { Calendar, MessageSquare, Bell, TrendingUp, Video, Users } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { consultationService } from '@/lib/api/consultations';
import { appointmentsService } from '@/lib/api/appointments';

export default function DashboardPage() {
  const { user, logout } = useAuth();

  // الحصول على الاستشارات
  const { data: consultations } = useQuery({
    queryKey: ['consultations', user?.id, user?.role],
    queryFn: () => {
      if (user?.role === 'PATIENT') {
        return consultationService.getConsultations(parseInt(user.id));
      } else if (user?.role === 'DOCTOR') {
        return consultationService.getConsultations(undefined, parseInt(user.id));
      }
      return consultationService.getConsultations();
    },
  });

  // الحصول على المواعيد
  const { data: appointments } = useQuery({
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

  // تحويل المواعيد إلى التنسيق المطلوب
  const formattedAppointments = appointments?.map(appointment => ({
    id: appointment.id.toString(),
    doctor: `د. ${appointment.doctor?.user?.profile?.firstName || ''} ${appointment.doctor?.user?.profile?.lastName || ''}`,
    specialty: appointment.doctor?.specialization || '',
    date: new Date(appointment.appointmentDate).toLocaleDateString('ar-SA'),
    time: appointment.appointmentTime,
    location: 'مستشفى الرياض التخصصي', // TODO: إضافة clinic data
    phone: '', // TODO: إضافة phone data
    status: appointment.status.toLowerCase() as 'confirmed' | 'pending' | 'cancelled',
  })) || [];

  // النشاط الأخير (يمكن تحسينه لاحقاً)
  const recentActivities = [
    {
      id: '1',
      type: 'appointment' as const,
      title: 'تم تأكيد الموعد',
      description: 'تم تأكيد موعد جديد',
      time: 'منذ ساعتين',
      status: 'completed' as const,
    },
    {
      id: '2',
      type: 'message' as const,
      title: 'رسالة جديدة',
      description: 'رسالة جديدة من الطبيب',
      time: 'منذ 4 ساعات',
      status: 'pending' as const,
    },
  ];

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        {/* Header محسّن */}
        <DashboardHeader user={user} onLogout={logout} />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* بطاقات الإحصائيات */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatsCard
              title="المواعيد القادمة"
              value={formattedAppointments.length.toString()}
              icon={Calendar}
              color="blue"
              trend="+1 هذا الأسبوع"
            />
            <StatsCard
              title="الاستشارات النشطة"
              value={consultations?.filter(c => c.status === 'IN_PROGRESS').length || 0}
              icon={Video}
              color="green"
              trend="جارية الآن"
            />
            <StatsCard
              title="الرسائل الجديدة"
              value="5"
              icon={MessageSquare}
              color="orange"
              trend="+2 اليوم"
            />
            <StatsCard
              title="الاستشارات المكتملة"
              value={consultations?.filter(c => c.status === 'COMPLETED').length || 0}
              icon={Users}
              color="purple"
              trend="هذا الشهر"
            />
          </div>

          {/* المحتوى الرئيسي */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* المواعيد القادمة */}
            <div className="lg:col-span-2">
              <UpcomingAppointments appointments={formattedAppointments} />
            </div>

            {/* الإجراءات السريعة */}
            <div>
              <QuickActions />
            </div>
          </div>

          {/* التخصصات المتاحة */}
          <div className="mt-8">
            <SpecialtiesOverview />
          </div>

          {/* النشاط الأخير */}
          <div className="mt-8">
            <RecentActivity activities={recentActivities} />
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
