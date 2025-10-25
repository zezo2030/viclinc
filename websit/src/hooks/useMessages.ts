import { useState, useEffect, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { messageService, Message } from '@/lib/api/messages';
import { useSocket } from './useSocket';
import { useAuth } from '@/lib/contexts/auth-context';

export const useMessages = (consultationId: number) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const socket = useSocket();
  
  const [messages, setMessages] = useState<Message[]>([]);
  const [typingUsers, setTypingUsers] = useState<number[]>([]);
  const [isTyping, setIsTyping] = useState(false);

  // الحصول على الرسائل
  const { data: initialMessages, isLoading, error } = useQuery({
    queryKey: ['messages', consultationId],
    queryFn: () => messageService.getMessagesByConsultation(consultationId),
  });

  // إرسال رسالة
  const sendMessageMutation = useMutation({
    mutationFn: (data: { message: string; messageType?: string; fileUrl?: string }) =>
      messageService.createMessage({
        consultationId,
        senderId: user?.id ? parseInt(user.id) : 0,
        message: data.message,
        messageType: (data.messageType as 'TEXT' | 'IMAGE' | 'FILE') || 'TEXT',
        fileUrl: data.fileUrl,
      }),
    onSuccess: (newMessage) => {
      setMessages(prev => [...prev, newMessage]);
    },
  });

  // تحديد رسالة كمقروءة
  const markAsReadMutation = useMutation({
    mutationFn: (messageId: number) => messageService.markAsRead(messageId),
  });

  // تحديد جميع الرسائل كمقروءة
  const markAllAsReadMutation = useMutation({
    mutationFn: () => messageService.markAllAsRead(consultationId),
  });

  // حذف رسالة
  const deleteMessageMutation = useMutation({
    mutationFn: (messageId: number) => messageService.deleteMessage(messageId),
    onSuccess: (_, messageId) => {
      setMessages(prev => prev.filter(msg => msg.id !== messageId));
    },
  });

  // تحديث الرسائل عند تحميل البيانات الأولية
  useEffect(() => {
    if (initialMessages) {
      setMessages(initialMessages);
    }
  }, [initialMessages]);

  // إرسال رسالة
  const sendMessage = useCallback((
    message: string,
    messageType: string = 'TEXT',
    fileUrl?: string
  ) => {
    if (!user) return;

    // إرسال عبر Socket أولاً للسرعة
    socket.sendMessage(consultationId, message, messageType, fileUrl);

    // إرسال عبر API للتخزين
    sendMessageMutation.mutate({
      message,
      messageType,
      fileUrl,
    });
  }, [user, consultationId, socket, sendMessageMutation]);

  // إرسال حالة الكتابة
  const sendTyping = useCallback((typing: boolean) => {
    if (!user) return;
    
    socket.sendTyping(consultationId, typing);
    setIsTyping(typing);
  }, [user, consultationId, socket]);

  // تحديد رسالة كمقروءة
  const markAsRead = useCallback((messageId: number) => {
    markAsReadMutation.mutate(messageId);
    socket.markMessageAsRead(messageId, consultationId);
  }, [markAsReadMutation, socket, consultationId]);

  // تحديد جميع الرسائل كمقروءة
  const markAllAsRead = useCallback(() => {
    markAllAsReadMutation.mutate();
  }, [markAllAsReadMutation]);

  // حذف رسالة
  const deleteMessage = useCallback((messageId: number) => {
    deleteMessageMutation.mutate(messageId);
  }, [deleteMessageMutation]);

  // إعداد مستمعي الأحداث
  useEffect(() => {
    if (!user) return;

    // الانضمام لرسائل الاستشارة
    socket.joinConsultationMessages(consultationId);

    // مستمع للرسائل الجديدة
    socket.onMessageEvent('new-message', (data) => {
      if (data.consultationId === consultationId) {
        const newMessage: Message = {
          id: Date.now(), // مؤقت
          consultationId: data.consultationId,
          senderId: data.senderId,
          message: data.message,
          messageType: data.messageType || 'TEXT',
          fileUrl: data.fileUrl,
          isRead: false,
          createdAt: data.timestamp,
          sender: {
            id: data.senderId,
            email: '',
            profile: {
              firstName: 'مستخدم',
              lastName: '',
            },
          },
        };

        setMessages(prev => [...prev, newMessage]);
      }
    });

    // مستمع لحالة الكتابة
    socket.onMessageEvent('user-typing', (data) => {
      if (data.consultationId === consultationId) {
        setTypingUsers(data.typingUsers || []);
      }
    });

    // مستمع لحالة قراءة الرسائل
    socket.onMessageEvent('message-read-status', (data) => {
      setMessages(prev => prev.map(msg => 
        msg.id === data.messageId ? { ...msg, isRead: true } : msg
      ));
    });

    return () => {
      socket.leaveConsultationMessages(consultationId);
      socket.offMessageEvent('new-message');
      socket.offMessageEvent('user-typing');
      socket.offMessageEvent('message-read-status');
    };
  }, [user, consultationId, socket]);

  // تنظيف حالة الكتابة عند إلغاء التحميل
  useEffect(() => {
    return () => {
      if (isTyping) {
        sendTyping(false);
      }
    };
  }, [isTyping, sendTyping]);

  return {
    messages,
    isLoading,
    error,
    typingUsers,
    isTyping,
    sendMessage,
    sendTyping,
    markAsRead,
    markAllAsRead,
    deleteMessage,
    isSending: sendMessageMutation.isPending,
    isMarkingAsRead: markAsReadMutation.isPending,
    isDeleting: deleteMessageMutation.isPending,
  };
};
