'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Mic, MicOff, Video, VideoOff, Phone, PhoneOff } from 'lucide-react';
import { agoraService } from '@/lib/api/agora';
import { socketClient } from '@/lib/socket/socket-client';

interface VideoCallProps {
  consultationId: string | number;
  userId: string | number;
  userRole?: 'PATIENT' | 'DOCTOR';
  onCallEnd?: () => void;
  testMode?: boolean;
}

export const VideoCall: React.FC<VideoCallProps> = ({
  consultationId,
  userId,
  userRole = 'PATIENT',
  onCallEnd,
  testMode = false,
}) => {
  const [isInitialized, setIsInitialized] = useState(false);
  const [isJoined, setIsJoined] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [isCallActive, setIsCallActive] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const clientRef = useRef<any>(null);
  const localTracksRef = useRef<any[]>([]);

  useEffect(() => {
    initializeAgora();
    return () => {
      cleanup();
    };
  }, []);

  const initializeAgora = async () => {
    try {
      // تحميل Agora RTC SDK
      const AgoraRTC = (await import('agora-rtc-sdk-ng')).default;
      
      // إنشاء العميل
      clientRef.current = AgoraRTC.createClient({
        mode: 'rtc',
        codec: 'vp8',
      });

      // إعداد معالجات الأحداث
      clientRef.current.on('user-published', handleUserPublished);
      clientRef.current.on('user-unpublished', handleUserUnpublished);
      clientRef.current.on('user-left', handleUserLeft);

      setIsInitialized(true);
    } catch (error) {
      console.error('Error initializing Agora:', error);
      setError('فشل في تهيئة مكالمة الفيديو');
    }
  };

  const joinCall = async () => {
    try {
      if (!clientRef.current) {
        throw new Error('Agora client not initialized');
      }

      // تحميل Agora RTC SDK
      const AgoraRTC = (await import('agora-rtc-sdk-ng')).default;

      // الحصول على token من API
      // Note: consultationId هنا هو appointmentId
      // تحديد الدور بناءً على دور المستخدم الحالي
      const role = userRole === 'DOCTOR' ? 'doctor' : 'patient';
      const tokenData = await agoraService.getToken(consultationId.toString(), role, testMode);
      
      // الانضمام للقناة
      await clientRef.current.join(
        tokenData.appId,
        tokenData.channelName,
        tokenData.token,
        tokenData.uid
      );

      // إنشاء وإرسال المسارات المحلية
      const [audioTrack, videoTrack] = await AgoraRTC.createMicrophoneAndCameraTracks();
      localTracksRef.current = [audioTrack, videoTrack];

      await clientRef.current.publish(localTracksRef.current);

      // عرض الفيديو المحلي
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = new MediaStream([videoTrack.getMediaStreamTrack()]);
      }

      setIsJoined(true);
      setIsCallActive(true);

      // إشعار الآخرين ببدء المكالمة
      socketClient.startConsultation(
        typeof consultationId === 'string' ? parseInt(consultationId) || 0 : consultationId,
        typeof userId === 'string' ? parseInt(userId) || 0 : userId
      );

    } catch (error: any) {
      console.error('Error joining call:', error);
      // عرض رسالة خطأ أكثر وضوحاً
      const errorMessage = error?.response?.data?.message || error?.message || 'فشل في الانضمام للمكالمة';
      setError(errorMessage);
      
      // إذا كان الخطأ متعلقاً بحالة الموعد، عرض رسالة واضحة
      if (errorMessage.includes('confirmed') || errorMessage.includes('CONFIRMED')) {
        setError('يجب تأكيد الموعد أولاً قبل بدء جلسة الفيديو');
      } else if (errorMessage.includes('role') || errorMessage.includes('Role')) {
        setError('دور المستخدم غير صحيح. يرجى تحديث الصفحة والمحاولة مرة أخرى');
      } else if (errorMessage.includes('not available yet') || errorMessage.includes('wait')) {
        setError(errorMessage);
      }
    }
  };

  const leaveCall = async () => {
    try {
      if (clientRef.current && isJoined) {
        // إيقاف المسارات المحلية
        localTracksRef.current.forEach(track => track.close());
        localTracksRef.current = [];

        // مغادرة القناة
        await clientRef.current.leave();

        setIsJoined(false);
        setIsCallActive(false);

        // إشعار الآخرين بإنهاء المكالمة
        socketClient.endConsultation(
          typeof consultationId === 'string' ? parseInt(consultationId) || 0 : consultationId,
          typeof userId === 'string' ? parseInt(userId) || 0 : userId
        );

        onCallEnd?.();
      }
    } catch (error) {
      console.error('Error leaving call:', error);
    }
  };

  const toggleMute = () => {
    if (localTracksRef.current[0]) {
      localTracksRef.current[0].setEnabled(!isMuted);
      setIsMuted(!isMuted);
    }
  };

  const toggleVideo = () => {
    if (localTracksRef.current[1]) {
      localTracksRef.current[1].setEnabled(isVideoOff);
      setIsVideoOff(!isVideoOff);
    }
  };

  const handleUserPublished = async (user: any, mediaType: string) => {
    await clientRef.current.subscribe(user, mediaType);
    
    if (mediaType === 'video' && remoteVideoRef.current) {
      remoteVideoRef.current.srcObject = user.videoTrack.getMediaStream();
    }
  };

  const handleUserUnpublished = (user: any, mediaType: string) => {
    if (mediaType === 'video' && remoteVideoRef.current) {
      remoteVideoRef.current.srcObject = null;
    }
  };

  const handleUserLeft = (user: any) => {
    if (remoteVideoRef.current) {
      remoteVideoRef.current.srcObject = null;
    }
  };

  const cleanup = async () => {
    if (clientRef.current && isJoined) {
      await leaveCall();
    }
  };

  if (!isInitialized) {
    return (
      <Card className="p-6">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p>جاري تهيئة مكالمة الفيديو...</p>
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="p-6">
        <div className="text-center text-red-600">
          <p>{error}</p>
          <Button onClick={() => window.location.reload()} className="mt-4">
            إعادة المحاولة
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-center">مكالمة الفيديو</h3>
        
        {/* منطقة الفيديو */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* الفيديو المحلي */}
          <div className="relative">
            <video
              ref={localVideoRef}
              autoPlay
              muted
              className="w-full h-48 bg-gray-900 rounded-lg"
            />
            <div className="absolute bottom-2 left-2 bg-black bg-opacity-50 text-white px-2 py-1 rounded text-sm">
              أنت
            </div>
          </div>

          {/* الفيديو البعيد */}
          <div className="relative">
            <video
              ref={remoteVideoRef}
              autoPlay
              className="w-full h-48 bg-gray-900 rounded-lg"
            />
            <div className="absolute bottom-2 left-2 bg-black bg-opacity-50 text-white px-2 py-1 rounded text-sm">
              الطرف الآخر
            </div>
          </div>
        </div>

        {/* أزرار التحكم */}
        <div className="flex justify-center space-x-4">
          {!isCallActive ? (
            <Button
              onClick={joinCall}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              <Phone className="w-4 h-4 mr-2" />
              بدء المكالمة
            </Button>
          ) : (
            <>
              <Button
                onClick={toggleMute}
                variant={isMuted ? 'destructive' : 'outline'}
              >
                {isMuted ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
              </Button>
              
              <Button
                onClick={toggleVideo}
                variant={isVideoOff ? 'destructive' : 'outline'}
              >
                {isVideoOff ? <VideoOff className="w-4 h-4" /> : <Video className="w-4 h-4" />}
              </Button>
              
              <Button
                onClick={leaveCall}
                variant="destructive"
              >
                <PhoneOff className="w-4 h-4 mr-2" />
                إنهاء المكالمة
              </Button>
            </>
          )}
        </div>

        {isCallActive && (
          <div className="text-center text-sm text-gray-600">
            <p>المكالمة جارية...</p>
          </div>
        )}
      </div>
    </Card>
  );
};
