import { useState, useEffect, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { consultationService, Consultation } from '@/lib/api/consultations';
import { useSocket } from './useSocket';
import { useAuth } from '@/lib/contexts/auth-context';

export const useConsultation = (consultationId: number) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const socket = useSocket();
  
  const [isJoined, setIsJoined] = useState(false);
  const [participants, setParticipants] = useState<number[]>([]);

  // الحصول على بيانات الاستشارة
  const { data: consultation, isLoading, error } = useQuery({
    queryKey: ['consultation', consultationId],
    queryFn: () => consultationService.getConsultation(consultationId),
  });

  // بدء الاستشارة
  const startConsultationMutation = useMutation({
    mutationFn: (notes?: string) => consultationService.startConsultation(consultationId, { notes }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['consultation', consultationId] });
      if (user) {
        socket.startConsultation(consultationId);
      }
    },
  });

  // إنهاء الاستشارة
  const endConsultationMutation = useMutation({
    mutationFn: (notes?: string) => consultationService.endConsultation(consultationId, { notes }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['consultation', consultationId] });
      if (user) {
        socket.endConsultation(consultationId);
      }
    },
  });

  // إلغاء الاستشارة
  const cancelConsultationMutation = useMutation({
    mutationFn: () => consultationService.cancelConsultation(consultationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['consultation', consultationId] });
    },
  });

  // الانضمام للاستشارة
  const joinConsultation = useCallback(() => {
    if (user && consultation) {
      socket.joinConsultation(consultationId);
      setIsJoined(true);
    }
  }, [user, consultation, consultationId, socket]);

  // مغادرة الاستشارة
  const leaveConsultation = useCallback(() => {
    if (user) {
      socket.leaveConsultation(consultationId);
      setIsJoined(false);
    }
  }, [user, consultationId, socket]);

  // إعداد مستمعي الأحداث
  useEffect(() => {
    if (!consultation) return;

    // مستمع لانضمام المستخدمين
    socket.onConsultationEvent('user-joined', (data) => {
      if (data.userId !== user?.id) {
        setParticipants(prev => [...prev, data.userId]);
      }
    });

    // مستمع لمغادرة المستخدمين
    socket.onConsultationEvent('user-left', (data) => {
      setParticipants(prev => prev.filter(id => id !== data.userId));
    });

    // مستمع لبدء الاستشارة
    socket.onConsultationEvent('consultation-started', (data) => {
      if (data.consultationId === consultationId) {
        queryClient.invalidateQueries({ queryKey: ['consultation', consultationId] });
      }
    });

    // مستمع لإنهاء الاستشارة
    socket.onConsultationEvent('consultation-ended', (data) => {
      if (data.consultationId === consultationId) {
        queryClient.invalidateQueries({ queryKey: ['consultation', consultationId] });
      }
    });

    return () => {
      socket.offConsultationEvent('user-joined');
      socket.offConsultationEvent('user-left');
      socket.offConsultationEvent('consultation-started');
      socket.offConsultationEvent('consultation-ended');
    };
  }, [consultation, consultationId, user, socket, queryClient]);

  // تنظيف عند إلغاء التحميل
  useEffect(() => {
    return () => {
      if (isJoined) {
        leaveConsultation();
      }
    };
  }, [isJoined, leaveConsultation]);

  const canJoin = consultation?.status === 'SCHEDULED' || consultation?.status === 'IN_PROGRESS';
  const canStart = consultation?.status === 'SCHEDULED' && user?.role === 'DOCTOR';
  const canEnd = consultation?.status === 'IN_PROGRESS' && user?.role === 'DOCTOR';
  const canCancel = consultation?.status === 'SCHEDULED' && user?.role === 'DOCTOR';

  return {
    consultation,
    isLoading,
    error,
    isJoined,
    participants,
    canJoin,
    canStart,
    canEnd,
    canCancel,
    joinConsultation,
    leaveConsultation,
    startConsultation: startConsultationMutation.mutate,
    endConsultation: endConsultationMutation.mutate,
    cancelConsultation: cancelConsultationMutation.mutate,
    isStarting: startConsultationMutation.isPending,
    isEnding: endConsultationMutation.isPending,
    isCancelling: cancelConsultationMutation.isPending,
  };
};
