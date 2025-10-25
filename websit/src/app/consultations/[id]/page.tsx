'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/Tabs';
import { VideoCall } from '@/components/consultation/VideoCall';
import { ChatInterface } from '@/components/consultation/ChatInterface';
import { FileUpload } from '@/components/consultation/FileUpload';
import { RatingModal } from '@/components/consultation/RatingModal';
import { 
  ArrowLeft, 
  User, 
  Calendar, 
  Clock, 
  Video, 
  MessageSquare,
  FileText,
  Star
} from 'lucide-react';
import { consultationService, Consultation } from '@/lib/api/consultations';
import { fileUploadService } from '@/lib/api/file-upload';
import { useAuth } from '@/lib/contexts/auth-context';
import { useRouter } from 'next/navigation';

export default function ConsultationDetailsPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user } = useAuth();
  const consultationId = parseInt(params.id as string);
  
  const [activeTab, setActiveTab] = useState<'video' | 'chat'>('video');
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);

  const { data: consultation, isLoading, error } = useQuery({
    queryKey: ['consultation', consultationId],
    queryFn: () => consultationService.getConsultation(consultationId),
  });

  useEffect(() => {
    // فتح نافذة التقييم إذا كان هناك معامل rate في URL
    if (searchParams.get('rate') === 'true') {
      setShowRatingModal(true);
    }
  }, [searchParams]);

  const handleFileSelect = (file: File) => {
    // يمكن إضافة منطق للتحقق من الملف قبل الرفع
    console.log('File selected:', file.name);
  };

  const handleFileUpload = async (file: File): Promise<string> => {
    try {
      // رفع الملف
      const uploadedFile = await fileUploadService.uploadFile(file);
      
      // إرسال الرابط في الدردشة
      if (consultation) {
        await consultationService.sendMessage(
          consultationId,
          `تم رفع ملف: ${file.name}`,
          'FILE',
          uploadedFile.url
        );
      }
      
      setUploadedFiles(prev => [...prev, file]);
      return uploadedFile.url;
    } catch (error) {
      console.error('Error uploading file:', error);
      throw error;
    }
  };

  const handleStartConsultation = async () => {
    if (!consultation) return;
    
    try {
      await consultationService.startConsultation(consultationId, {});
      // إعادة تحميل البيانات
      window.location.reload();
    } catch (error) {
      console.error('Error starting consultation:', error);
    }
  };

  const handleEndConsultation = async () => {
    if (!consultation) return;
    
    try {
      await consultationService.endConsultation(consultationId, {});
      // إعادة تحميل البيانات
      window.location.reload();
    } catch (error) {
      console.error('Error ending consultation:', error);
    }
  };

  const canJoin = consultation?.status === 'SCHEDULED' || consultation?.status === 'IN_PROGRESS';
  const canStart = consultation?.status === 'SCHEDULED' && user?.role === 'DOCTOR';
  const canEnd = consultation?.status === 'IN_PROGRESS' && user?.role === 'DOCTOR';
  const canRate = consultation?.status === 'COMPLETED' && user?.role === 'PATIENT';

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto mb-4"></div>
            <p>جاري تحميل الاستشارة...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !consultation) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center text-red-600">
            <p>حدث خطأ في تحميل الاستشارة</p>
            <Button onClick={() => router.back()} className="mt-4">
              العودة
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-4 mb-4">
            <Button
              onClick={() => router.back()}
              variant="outline"
              size="sm"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              العودة
            </Button>
            <h1 className="text-3xl font-bold text-gray-900">
              الاستشارة الطبية الافتراضية
            </h1>
          </div>

          {/* معلومات الاستشارة */}
          <Card className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="flex items-center space-x-3">
                <User className="w-6 h-6 text-gray-600" />
                <div>
                  <p className="text-sm text-gray-600">الطبيب</p>
                  <p className="font-medium">
                    {consultation.appointment.doctor.profile.firstName} {consultation.appointment.doctor.profile.lastName}
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <Calendar className="w-6 h-6 text-gray-600" />
                <div>
                  <p className="text-sm text-gray-600">التاريخ</p>
                  <p className="font-medium">
                    {new Date(consultation.appointment.appointmentDate).toLocaleDateString('ar-SA')}
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <Clock className="w-6 h-6 text-gray-600" />
                <div>
                  <p className="text-sm text-gray-600">الوقت</p>
                  <p className="font-medium">
                    {new Date(consultation.appointment.appointmentTime).toLocaleTimeString('ar-SA')}
                  </p>
                </div>
              </div>
            </div>

            {/* أزرار الإجراءات */}
            <div className="flex space-x-4 mt-6">
              {canStart && (
                <Button
                  onClick={handleStartConsultation}
                  className="bg-green-600 hover:bg-green-700 text-white"
                >
                  بدء الاستشارة
                </Button>
              )}

              {canEnd && (
                <Button
                  onClick={handleEndConsultation}
                  variant="destructive"
                >
                  إنهاء الاستشارة
                </Button>
              )}

              {canRate && (
                <Button
                  onClick={() => setShowRatingModal(true)}
                  variant="outline"
                  className="text-green-600 border-green-600 hover:bg-green-50"
                >
                  <Star className="w-4 h-4 mr-2" />
                  تقييم الاستشارة
                </Button>
              )}
            </div>
          </Card>
        </div>

        {/* المحتوى الرئيسي */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* منطقة الاستشارة */}
          <div className="lg:col-span-2">
            <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'video' | 'chat')}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="video" className="flex items-center space-x-2">
                  <Video className="w-4 h-4" />
                  <span>مكالمة فيديو</span>
                </TabsTrigger>
                <TabsTrigger value="chat" className="flex items-center space-x-2">
                  <MessageSquare className="w-4 h-4" />
                  <span>دردشة</span>
                </TabsTrigger>
              </TabsList>

              <TabsContent value="video" className="mt-6">
                {canJoin ? (
                  <VideoCall
                    consultationId={consultationId}
                    userId={user?.id ? parseInt(user.id) : 0}
                    onCallEnd={() => {
                      // يمكن إضافة منطق إضافي عند انتهاء المكالمة
                    }}
                  />
                ) : (
                  <Card className="p-6 text-center">
                    <Video className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      مكالمة الفيديو غير متاحة
                    </h3>
                    <p className="text-gray-600">
                      {consultation.status === 'SCHEDULED' 
                        ? 'الاستشارة لم تبدأ بعد'
                        : consultation.status === 'COMPLETED'
                        ? 'الاستشارة انتهت'
                        : 'لا يمكن الانضمام للمكالمة في هذه الحالة'
                      }
                    </p>
                  </Card>
                )}
              </TabsContent>

              <TabsContent value="chat" className="mt-6">
                <ChatInterface
                  consultationId={consultationId}
                  onFileUpload={handleFileUpload}
                />
              </TabsContent>
            </Tabs>
          </div>

          {/* الشريط الجانبي */}
          <div className="space-y-6">
            {/* معلومات الاستشارة */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">معلومات الاستشارة</h3>
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <div className={`w-3 h-3 rounded-full ${
                    consultation.status === 'IN_PROGRESS' ? 'bg-yellow-500' :
                    consultation.status === 'COMPLETED' ? 'bg-green-500' :
                    consultation.status === 'CANCELLED' ? 'bg-red-500' :
                    'bg-blue-500'
                  }`} />
                  <span className="text-sm">
                    {consultation.status === 'SCHEDULED' ? 'مجدولة' :
                     consultation.status === 'IN_PROGRESS' ? 'جارية' :
                     consultation.status === 'COMPLETED' ? 'مكتملة' :
                     'ملغية'}
                  </span>
                </div>

                <div className="flex items-center space-x-2">
                  {consultation.type === 'VIDEO' ? (
                    <Video className="w-4 h-4 text-blue-600" />
                  ) : (
                    <MessageSquare className="w-4 h-4 text-green-600" />
                  )}
                  <span className="text-sm">
                    {consultation.type === 'VIDEO' ? 'مكالمة فيديو' : 'دردشة'}
                  </span>
                </div>

                {consultation.duration && (
                  <div className="flex items-center space-x-2">
                    <Clock className="w-4 h-4 text-gray-600" />
                    <span className="text-sm">المدة: {consultation.duration} دقيقة</span>
                  </div>
                )}

                {consultation.messages && (
                  <div className="flex items-center space-x-2">
                    <MessageSquare className="w-4 h-4 text-gray-600" />
                    <span className="text-sm">{consultation.messages.length} رسالة</span>
                  </div>
                )}
              </div>
            </Card>

            {/* رفع الملفات */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">رفع الملفات</h3>
              <FileUpload
                onFileSelect={handleFileSelect}
                onFileUpload={handleFileUpload}
                maxFileSize={10 * 1024 * 1024} // 10MB
                allowedTypes={['image/jpeg', 'image/png', 'application/pdf']}
              />
            </Card>

            {/* ملاحظات */}
            {consultation.notes && (
              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4">ملاحظات</h3>
                <p className="text-sm text-gray-700">{consultation.notes}</p>
              </Card>
            )}
          </div>
        </div>

        {/* نافذة التقييم */}
        {showRatingModal && (
          <RatingModal
            consultationId={consultationId}
            doctorId={consultation.appointment.doctorId}
            isOpen={showRatingModal}
            onClose={() => setShowRatingModal(false)}
          />
        )}
      </div>
    </div>
  );
}
