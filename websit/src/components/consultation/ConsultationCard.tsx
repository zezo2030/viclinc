'use client';

import React from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Calendar, Clock, User, Video, MessageSquare, CheckCircle, XCircle } from 'lucide-react';
import { Consultation } from '@/lib/api/consultations';

interface ConsultationCardProps {
  consultation: Consultation;
  onJoin?: (consultationId: number) => void;
  onView?: (consultationId: number) => void;
  onRate?: (consultationId: number) => void;
  showActions?: boolean;
}

export const ConsultationCard: React.FC<ConsultationCardProps> = ({
  consultation,
  onJoin,
  onView,
  onRate,
  showActions = true,
}) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'SCHEDULED':
        return 'bg-blue-100 text-blue-800';
      case 'IN_PROGRESS':
        return 'bg-yellow-100 text-yellow-800';
      case 'COMPLETED':
        return 'bg-green-100 text-green-800';
      case 'CANCELLED':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'SCHEDULED':
        return 'مجدولة';
      case 'IN_PROGRESS':
        return 'جارية';
      case 'COMPLETED':
        return 'مكتملة';
      case 'CANCELLED':
        return 'ملغية';
      default:
        return status;
    }
  };

  const getTypeIcon = (type: string) => {
    return type === 'VIDEO' ? <Video className="w-4 h-4" /> : <MessageSquare className="w-4 h-4" />;
  };

  const getTypeLabel = (type: string) => {
    return type === 'VIDEO' ? 'مكالمة فيديو' : 'دردشة';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ar-SA', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('ar-SA', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const canJoin = consultation.status === 'SCHEDULED' || consultation.status === 'IN_PROGRESS';
  const canRate = consultation.status === 'COMPLETED';

  return (
    <Card className="p-6 hover:shadow-lg transition-shadow">
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            {getTypeIcon(consultation.type)}
            <span className="font-medium">{getTypeLabel(consultation.type)}</span>
          </div>
          <Badge className={getStatusColor(consultation.status)}>
            {getStatusLabel(consultation.status)}
          </Badge>
        </div>

        {/* معلومات الاستشارة */}
        <div className="space-y-2">
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <Calendar className="w-4 h-4" />
            <span>{formatDate(consultation.appointment.appointmentDate)}</span>
          </div>
          
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <Clock className="w-4 h-4" />
            <span>{formatTime(consultation.appointment.appointmentTime)}</span>
          </div>

          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <User className="w-4 h-4" />
            <span>
              {consultation.appointment.doctor.profile.firstName} {consultation.appointment.doctor.profile.lastName}
            </span>
          </div>
        </div>

        {/* ملاحظات */}
        {consultation.notes && (
          <div className="bg-gray-50 p-3 rounded-lg">
            <p className="text-sm text-gray-700">
              <strong>ملاحظات:</strong> {consultation.notes}
            </p>
          </div>
        )}

        {/* مدة الاستشارة */}
        {consultation.duration && (
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <Clock className="w-4 h-4" />
            <span>المدة: {consultation.duration} دقيقة</span>
          </div>
        )}

        {/* عدد الرسائل */}
        {consultation.messages && consultation.messages.length > 0 && (
          <div className="text-sm text-gray-600">
            <span>{consultation.messages.length} رسالة</span>
          </div>
        )}

        {/* أزرار الإجراءات */}
        {showActions && (
          <div className="flex space-x-2 pt-4 border-t">
            {canJoin && (
              <Button
                onClick={() => onJoin?.(consultation.id)}
                className="bg-primary-600 hover:bg-primary-700 text-white"
                size="sm"
              >
                {consultation.status === 'SCHEDULED' ? 'انضمام' : 'متابعة'}
              </Button>
            )}

            <Button
              onClick={() => onView?.(consultation.id)}
              variant="outline"
              size="sm"
            >
              عرض التفاصيل
            </Button>

            {canRate && (
              <Button
                onClick={() => onRate?.(consultation.id)}
                variant="outline"
                size="sm"
                className="text-green-600 border-green-600 hover:bg-green-50"
              >
                <CheckCircle className="w-4 h-4 mr-1" />
                تقييم
              </Button>
            )}
          </div>
        )}

        {/* حالة الاستشارة */}
        <div className="flex items-center space-x-2 text-xs text-gray-500">
          {consultation.status === 'COMPLETED' && (
            <>
              <CheckCircle className="w-3 h-3 text-green-500" />
              <span>تمت بنجاح</span>
            </>
          )}
          {consultation.status === 'CANCELLED' && (
            <>
              <XCircle className="w-3 h-3 text-red-500" />
              <span>ملغية</span>
            </>
          )}
          {consultation.status === 'IN_PROGRESS' && (
            <>
              <div className="w-3 h-3 bg-yellow-500 rounded-full animate-pulse" />
              <span>جارية الآن</span>
            </>
          )}
        </div>
      </div>
    </Card>
  );
};
