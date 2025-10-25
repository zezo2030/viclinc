import { useEffect, useState, useCallback } from 'react';
import { socketClient } from '@/lib/socket/socket-client';
import { useAuth } from '@/lib/contexts/auth-context';

export const useSocket = () => {
  const { user } = useAuth();
  const [isConnected, setIsConnected] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState({
    consultation: false,
    messages: false,
    isConnected: false,
  });

  useEffect(() => {
    if (user) {
      // الاتصال بـ consultation namespace
      const consultationSocket = socketClient.connectConsultation();
      
      // الاتصال بـ messages namespace
      const messageSocket = socketClient.connectMessages();

      // مراقبة حالة الاتصال
      const updateConnectionStatus = () => {
        const status = socketClient.getConnectionStatus();
        setConnectionStatus(status);
        setIsConnected(status.isConnected);
      };

      // تحديث الحالة كل ثانية
      const interval = setInterval(updateConnectionStatus, 1000);

      return () => {
        clearInterval(interval);
        socketClient.disconnect();
      };
    }
  }, [user]);

  const joinConsultation = useCallback((consultationId: number) => {
    if (user) {
      socketClient.joinConsultation(consultationId, parseInt(user.id));
    }
  }, [user]);

  const leaveConsultation = useCallback((consultationId: number) => {
    if (user) {
      socketClient.leaveConsultation(consultationId, parseInt(user.id));
    }
  }, [user]);

  const startConsultation = useCallback((consultationId: number) => {
    if (user) {
      socketClient.startConsultation(consultationId, parseInt(user.id));
    }
  }, [user]);

  const endConsultation = useCallback((consultationId: number) => {
    if (user) {
      socketClient.endConsultation(consultationId, parseInt(user.id));
    }
  }, [user]);

  const sendMessage = useCallback((
    consultationId: number,
    message: string,
    messageType: string = 'TEXT',
    fileUrl?: string
  ) => {
    if (user) {
      socketClient.sendMessage(consultationId, message, parseInt(user.id), messageType, fileUrl);
    }
  }, [user]);

  const sendTyping = useCallback((consultationId: number, isTyping: boolean) => {
    if (user) {
      socketClient.sendTyping(consultationId, parseInt(user.id), isTyping);
    }
  }, [user]);

  const markMessageAsRead = useCallback((messageId: number, consultationId: number) => {
    if (user) {
      socketClient.markMessageAsRead(messageId, parseInt(user.id), consultationId);
    }
  }, [user]);

  const joinConsultationMessages = useCallback((consultationId: number) => {
    if (user) {
      socketClient.joinConsultationMessages(consultationId, parseInt(user.id));
    }
  }, [user]);

  const leaveConsultationMessages = useCallback((consultationId: number) => {
    if (user) {
      socketClient.leaveConsultationMessages(consultationId, parseInt(user.id));
    }
  }, [user]);

  const onConsultationEvent = useCallback((event: string, callback: (data: any) => void) => {
    socketClient.onConsultationEvent(event, callback);
  }, []);

  const onMessageEvent = useCallback((event: string, callback: (data: any) => void) => {
    socketClient.onMessageEvent(event, callback);
  }, []);

  const offConsultationEvent = useCallback((event: string, callback?: (data: any) => void) => {
    socketClient.offConsultationEvent(event, callback);
  }, []);

  const offMessageEvent = useCallback((event: string, callback?: (data: any) => void) => {
    socketClient.offMessageEvent(event, callback);
  }, []);

  return {
    isConnected,
    connectionStatus,
    joinConsultation,
    leaveConsultation,
    startConsultation,
    endConsultation,
    sendMessage,
    sendTyping,
    markMessageAsRead,
    joinConsultationMessages,
    leaveConsultationMessages,
    onConsultationEvent,
    onMessageEvent,
    offConsultationEvent,
    offMessageEvent,
  };
};
