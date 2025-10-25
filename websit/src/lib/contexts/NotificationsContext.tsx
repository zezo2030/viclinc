'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { notificationsService, Notification } from '@/lib/api/notifications';

interface NotificationsContextType {
  notifications: Notification[];
  unreadCount: number;
  isLoading: boolean;
  markAsRead: (id: number) => void;
  markAllAsRead: () => void;
  deleteNotification: (id: number) => void;
  refreshNotifications: () => void;
}

const NotificationsContext = createContext<NotificationsContextType | undefined>(undefined);

interface NotificationsProviderProps {
  children: ReactNode;
}

export const NotificationsProvider: React.FC<NotificationsProviderProps> = ({ children }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const queryClient = useQueryClient();

  // جلب التنبيهات
  const { data: notificationsData, isLoading, refetch } = useQuery({
    queryKey: ['notifications'],
    queryFn: () => notificationsService.getNotifications({ limit: 50 }),
    refetchInterval: 30000, // تحديث كل 30 ثانية
  });

  // جلب عدد التنبيهات غير المقروءة
  const { data: unreadCount } = useQuery({
    queryKey: ['notifications-count'],
    queryFn: () => notificationsService.getUnreadCount(),
    refetchInterval: 10000, // تحديث كل 10 ثوان
  });

  // تعليم التنبيه كمقروء
  const markAsReadMutation = useMutation({
    mutationFn: (id: number) => notificationsService.markAsRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['notifications-count'] });
    },
  });

  // تعليم جميع التنبيهات كمقروءة
  const markAllAsReadMutation = useMutation({
    mutationFn: () => notificationsService.markAllAsRead(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['notifications-count'] });
    },
  });

  // حذف التنبيه
  const deleteNotificationMutation = useMutation({
    mutationFn: (id: number) => notificationsService.deleteNotification(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['notifications-count'] });
    },
  });

  // تحديث قائمة التنبيهات
  useEffect(() => {
    if (notificationsData) {
      setNotifications(notificationsData.notifications || []);
    }
  }, [notificationsData]);

  // WebSocket للتنبيهات الفورية
  useEffect(() => {
    // TODO: إضافة WebSocket connection للتنبيهات الفورية
    // const ws = new WebSocket('ws://localhost:3000/notifications');
    // ws.onmessage = (event) => {
    //   const notification = JSON.parse(event.data);
    //   setNotifications(prev => [notification, ...prev]);
    // };
    // return () => ws.close();
  }, []);

  const markAsRead = (id: number) => {
    markAsReadMutation.mutate(id);
  };

  const markAllAsRead = () => {
    markAllAsReadMutation.mutate();
  };

  const deleteNotification = (id: number) => {
    deleteNotificationMutation.mutate(id);
  };

  const refreshNotifications = () => {
    refetch();
  };

  const value: NotificationsContextType = {
    notifications,
    unreadCount: unreadCount || 0,
    isLoading,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    refreshNotifications,
  };

  return (
    <NotificationsContext.Provider value={value}>
      {children}
    </NotificationsContext.Provider>
  );
};

export const useNotifications = (): NotificationsContextType => {
  const context = useContext(NotificationsContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationsProvider');
  }
  return context;
};
