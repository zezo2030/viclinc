'use client';

import React, { Suspense, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import {
  VideoIcon,
  MessageSquareIcon,
  ClockIcon,
  PhoneOffIcon,
  SettingsIcon,
  HelpCircleIcon,
  DownloadIcon,
  ShareIcon,
} from 'lucide-react';
import { consultationService, type Consultation, type Message as APIMessage } from '@/lib/api/consultations';
import { useAuth } from '@/lib/contexts/auth-context';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { Loading } from '@/components/ui/Loading';
import { VideoCall } from '@/components/consultation/VideoCall';
import { ChatInterface } from '@/components/consultation/ChatInterface';

// Type for ChatInterface messages
interface ChatMessage {
  id: string;
  sender: 'user' | 'doctor';
  senderName: string;
  avatar?: string;
  content: string;
  timestamp: Date;
  attachments?: { id: string; name: string; size: number; url: string }[];
  isRead: boolean;
}

// Convert API messages to ChatInterface format
function convertMessages(
  apiMessages: APIMessage[],
  currentUserId: number,
  doctorId?: number
): ChatMessage[] {
  return apiMessages.map((msg) => {
    // Determine if sender is doctor by comparing senderId with doctorId
    const isDoctor = doctorId ? msg.senderId === doctorId : false;
    const senderName = msg.sender?.profile
      ? `${msg.sender.profile.firstName} ${msg.sender.profile.lastName}`
      : 'مستخدم';
    
    return {
      id: msg.id.toString(),
      sender: isDoctor ? 'doctor' : 'user',
      senderName,
      content: msg.message,
      timestamp: new Date(msg.createdAt),
      attachments: msg.fileUrl
        ? [
            {
              id: msg.id.toString(),
              name: msg.fileUrl.split('/').pop() || 'ملف',
              size: 0,
              url: msg.fileUrl,
            },
          ]
        : undefined,
      isRead: msg.isRead,
    };
  });
}

function ConsultationContent() {
  const router = useRouter();
  const params = useParams();
  const { user } = useAuth();
  const consultationId = params.id as string;
  const [consultationType, setConsultationType] = useState<'video' | 'chat'>('video');
  const [isCallActive, setIsCallActive] = useState(false);
  const [callDuration, setCallDuration] = useState(0);

  const { data: consultation, isLoading, error } = useQuery({
    queryKey: ['consultation', consultationId],
    queryFn: () => {
      return consultationService.getConsultation(consultationId);
    },
    enabled: !!consultationId,
    retry: 1,
  });

  const { data: messages } = useQuery({
    queryKey: ['consultation-messages', consultationId],
    queryFn: () => {
      return consultationService.getConsultationMessages(consultationId);
    },
    enabled: !!consultationId && consultationType === 'chat',
    retry: 1,
  });

  // Convert API messages to ChatInterface format
  const chatMessages = messages && user?.id && consultation
    ? convertMessages(
        messages,
        typeof user.id === 'string' ? parseInt(user.id) || 0 : user.id,
        typeof consultation.appointment?.doctorId === 'string'
          ? parseInt(consultation.appointment.doctorId) || 0
          : consultation.appointment?.doctorId
      )
    : [];

  if (isLoading) {
    return <Loading text="جاري تحميل الاستشارة..." />;
  }

  if (error || !consultation) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">حدث خطأ</h1>
          <p className="text-gray-600 mb-6">لم نتمكن من تحميل الاستشارة</p>
          <Link href="/consultations">
            <Button className="gradient-medical text-white hover:opacity-90">
              العودة للاستشارات
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const isVideoType = consultation.type === 'VIDEO';
  const canJoin = consultation.status === 'COMPLETED' || consultation.status === 'IN_PROGRESS';
  const doctorName = consultation.appointment?.doctor?.profile
    ? `د. ${consultation.appointment.doctor.profile.firstName} ${consultation.appointment.doctor.profile.lastName}`
    : 'الطبيب';
  const doctorSpecialization = (consultation.appointment?.doctor as any)?.specialization || 'متخصص';

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-white shadow-md border-b-2 border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {isVideoType ? 'جلسة فيديو' : 'استشارة نصية'}
              </h1>
              <p className="text-sm text-gray-600">{doctorName}</p>
            </div>
            <div className="flex items-center gap-2">
              {isCallActive && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="flex items-center gap-2 bg-success-100 text-success-700 px-4 py-2 rounded-full font-semibold"
                >
                  <span className="w-2 h-2 bg-success-600 rounded-full animate-pulse"></span>
                  جارية الآن {callDuration > 0 && `${Math.floor(callDuration / 60)}:${String(callDuration % 60).padStart(2, '0')}`}
                </motion.div>
              )}
              <Button
                size="sm"
                variant="outline"
                className="border-error-500 text-error-600 hover:bg-error-50"
                onClick={() => {
                  setIsCallActive(false);
                  router.push('/consultations');
                }}
              >
                <PhoneOffIcon className="w-4 h-4 ml-2" />
                إنهاء الاستشارة
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Video/Chat Area */}
          <div className="lg:col-span-3">
            {isVideoType ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-black rounded-2xl overflow-hidden shadow-xl min-h-96"
              >
                <VideoCall
                  consultationId={consultationId}
                  userId={user?.id || '0'}
                  userRole={user?.role as 'PATIENT' | 'DOCTOR' | undefined}
                  onCallEnd={() => setIsCallActive(false)}
                />
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="h-96"
              >
                <ChatInterface
                  consultationId={consultationId}
                  doctorName={doctorName}
                  userName={user?.name || 'أنت'}
                  isDoctor={user?.role === 'DOCTOR'}
                  initialMessages={chatMessages}
                />
              </motion.div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            {/* Consultation Info */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card className="p-6 border-2 border-gray-100">
                <h3 className="font-bold text-gray-900 mb-4">معلومات الاستشارة</h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <ClockIcon className="w-5 h-5 text-primary-600" />
                    <span className="text-sm text-gray-700">
                      {new Date(consultation.appointment?.appointmentDate || '').toLocaleDateString('ar-SA')}
                    </span>
                  </div>
                  <div className="p-3 bg-primary-50 rounded-lg text-sm">
                    <p className="font-semibold text-primary-900 mb-2">الحالة</p>
                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${
                      consultation.status === 'IN_PROGRESS'
                        ? 'bg-success-200 text-success-800'
                        : consultation.status === 'COMPLETED'
                        ? 'bg-blue-200 text-blue-800'
                        : 'bg-warning-200 text-warning-800'
                    }`}>
                      {consultation.status === 'IN_PROGRESS' ? 'جارية'
                        : consultation.status === 'COMPLETED' ? 'مكتملة'
                        : 'مجدولة'}
                    </span>
                  </div>
                </div>
              </Card>
            </motion.div>

            {/* Actions */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="space-y-2"
            >
              <Button
                variant="outline"
                className="w-full border-2 border-gray-300 justify-start"
              >
                <DownloadIcon className="w-4 h-4 ml-2" />
                حفظ الجلسة
              </Button>
              <Button
                variant="outline"
                className="w-full border-2 border-gray-300 justify-start"
              >
                <ShareIcon className="w-4 h-4 ml-2" />
                مشاركة
              </Button>
              <Button
                variant="outline"
                className="w-full border-2 border-gray-300 justify-start"
              >
                <SettingsIcon className="w-4 h-4 ml-2" />
                الإعدادات
              </Button>
              <Button
                variant="outline"
                className="w-full border-2 border-gray-300 justify-start"
              >
                <HelpCircleIcon className="w-4 h-4 ml-2" />
                مساعدة
              </Button>
            </motion.div>

            {/* Doctor Info */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
            >
              <Card className="p-6 border-2 border-gray-100 text-center">
                <div className="w-16 h-16 mx-auto mb-3 rounded-full gradient-medical-light flex items-center justify-center">
                  <span className="text-2xl">👨‍⚕️</span>
                </div>
                <h4 className="font-bold text-gray-900 mb-1">{doctorName}</h4>
                <p className="text-sm text-gray-600 mb-4">
                  {doctorSpecialization}
                </p>
                <Button className="w-full border-2 border-primary-500 text-primary-600 hover:bg-primary-50 text-sm">
                  الملف الشخصي
                </Button>
              </Card>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ConsultationPage() {
  return (
    <ProtectedRoute>
      <Suspense fallback={<Loading text="جاري التحميل..." />}>
        <ConsultationContent />
      </Suspense>
    </ProtectedRoute>
  );
}
