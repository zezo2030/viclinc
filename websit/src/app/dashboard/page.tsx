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
  const { data: consultationsData } = useQuery({
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

  // Handle both array and paginated/object response
  const consultations = Array.isArray(consultationsData) 
    ? consultationsData 
    : (consultationsData as any)?.consultations || (consultationsData as any)?.data || [];

  // الحصول على المواعيد
  const { data: appointmentsData } = useQuery({
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
  const appointments = Array.isArray(appointmentsData) 
    ? appointmentsData 
    : (appointmentsData as any)?.appointments || [];

  // تحويل المواعيد إلى التنسيق المطلوب
  const formattedAppointments = appointments?.map((appointment: any) => {
    // Safe access to doctor profile data
    const doctorProfile = appointment.doctor?.user?.profile;
    const firstName = doctorProfile?.firstName || '';
    const lastName = doctorProfile?.lastName || '';
    const doctorName = firstName || lastName 
      ? `د. ${firstName} ${lastName}`.trim()
      : 'غير محدد';
    
    // Safe extraction of specialty name - handle both string and object cases
    let specialtyName = 'غير محدد';
    if (appointment.doctor?.specialization) {
      // If specialization is a string, use it directly
      specialtyName = typeof appointment.doctor.specialization === 'string' 
        ? appointment.doctor.specialization 
        : (appointment.doctor.specialization as any)?.name || 'غير محدد';
    } else if (appointment.specialty) {
      // If specialty exists, extract name property
      specialtyName = typeof appointment.specialty === 'string'
        ? appointment.specialty
        : (appointment.specialty as any)?.name || 'غير محدد';
    }
    
    return {
      id: appointment.id.toString(),
      doctor: doctorName,
      specialty: specialtyName,
      date: new Date(appointment.appointmentDate).toLocaleDateString('ar-SA'),
      time: appointment.appointmentTime,
      location: appointment.clinic?.name || appointment.clinic?.address || 'مستشفى الرياض التخصصي',
      phone: (appointment.clinic as any)?.phone || '',
      status: appointment.status.toLowerCase() as 'pending_confirm' | 'confirmed' | 'cancelled' | 'completed' | 'no_show' | 'rejected',
    };
  }) || [];

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
              value={formattedAppointments.filter((a: any) => a.status === 'confirmed' || a.status === 'pending_confirm').length.toString()}
              icon={Calendar}
              color="blue"
              trend={`${formattedAppointments.length} إجمالي المواعيد`}
            />
            <StatsCard
              title="الاستشارات النشطة"
              value={(consultations?.filter((c: any) => c.status === 'IN_PROGRESS' || c.status === 'ACTIVE').length || 0).toString()}
              icon={Video}
              color="green"
              trend="جارية الآن"
            />
            <StatsCard
              title="المواعيد المؤكدة"
              value={formattedAppointments.filter((a: any) => a.status === 'confirmed').length.toString()}
              icon={MessageSquare}
              color="orange"
              trend="هذا الشهر"
            />
            <StatsCard
              title="الاستشارات المكتملة"
              value={(consultations?.filter((c: any) => c.status === 'COMPLETED').length || 0).toString()}
              icon={Users}
              color="purple"
              trend="إجمالي"
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
