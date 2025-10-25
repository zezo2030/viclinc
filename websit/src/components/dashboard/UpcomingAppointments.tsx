'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Calendar, Clock, User, MapPin, Phone } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Appointment {
  id: string;
  doctor: string;
  specialty: string;
  date: string;
  time: string;
  location?: string;
  phone?: string;
  status: 'confirmed' | 'pending' | 'cancelled';
}

interface UpcomingAppointmentsProps {
  appointments: Appointment[];
  className?: string;
}

const statusColors = {
  confirmed: 'bg-green-100 text-green-800 border-green-200',
  pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  cancelled: 'bg-red-100 text-red-800 border-red-200',
};

const statusLabels = {
  confirmed: 'مؤكد',
  pending: 'في الانتظار',
  cancelled: 'ملغي',
};

export const UpcomingAppointments: React.FC<UpcomingAppointmentsProps> = ({
  appointments,
  className,
}) => {
  if (appointments.length === 0) {
    return (
      <Card className={cn('h-full', className)}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-blue-600" />
            المواعيد القادمة
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 mb-4">لا توجد مواعيد قادمة</p>
            <Button className="bg-blue-600 hover:bg-blue-700">
              حجز موعد جديد
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn('h-full', className)}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="w-5 h-5 text-blue-600" />
          المواعيد القادمة
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {appointments.map((appointment) => (
            <div
              key={appointment.id}
              className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-all duration-200"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900 mb-1">
                    {appointment.doctor}
                  </h4>
                  <p className="text-sm text-gray-600 mb-2">
                    {appointment.specialty}
                  </p>
                </div>
                <span className={cn(
                  'px-2 py-1 text-xs font-medium rounded-full border',
                  statusColors[appointment.status]
                )}>
                  {statusLabels[appointment.status]}
                </span>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Calendar className="w-4 h-4" />
                  <span>{appointment.date}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Clock className="w-4 h-4" />
                  <span>{appointment.time}</span>
                </div>
                {appointment.location && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <MapPin className="w-4 h-4" />
                    <span>{appointment.location}</span>
                  </div>
                )}
                {appointment.phone && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Phone className="w-4 h-4" />
                    <span>{appointment.phone}</span>
                  </div>
                )}
              </div>

              <div className="flex gap-2 mt-4">
                <Button size="sm" variant="outline" className="flex-1">
                  تعديل
                </Button>
                <Button size="sm" variant="outline" className="text-red-600 border-red-300 hover:bg-red-50">
                  إلغاء
                </Button>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6">
          <Button className="w-full bg-blue-600 hover:bg-blue-700">
            عرض جميع المواعيد
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
