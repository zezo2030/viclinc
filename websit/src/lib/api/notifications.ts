import { apiClient } from './client';

export interface Notification {
  id: number;
  userId: number;
  type: 'APPOINTMENT_PENDING' | 'APPOINTMENT_CONFIRMED' | 'APPOINTMENT_CANCELLED' | 
        'CONSULTATION_STARTED' | 'CONSULTATION_ENDED' | 'WAITING_LIST_UPDATE' | 
        'NEW_USER_REGISTERED' | 'SYSTEM_ALERT' | 'DOCTOR_AVAILABILITY' | 'CLINIC_UPDATE';
  title: string;
  message: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  isRead: boolean;
  actionUrl?: string;
  metadata?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

export interface NotificationsQuery {
  page?: number;
  limit?: number;
  unreadOnly?: boolean;
}

export interface NotificationStats {
  total: number;
  unread: number;
  byType: Array<{ type: string; count: number }>;
  byPriority: Array<{ priority: string; count: number }>;
}

export const notificationsService = {
  // جلب التنبيهات
  getNotifications: (query: NotificationsQuery = {}): Promise<{
    notifications: Notification[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> => {
    const params = new URLSearchParams();
    if (query.page) params.append('page', query.page.toString());
    if (query.limit) params.append('limit', query.limit.toString());
    if (query.unreadOnly) params.append('unreadOnly', query.unreadOnly.toString());

    return apiClient.get(`/notifications?${params.toString()}`);
  },

  // جلب عدد التنبيهات غير المقروءة
  getUnreadCount: (): Promise<number> => {
    return apiClient.get('/notifications/count');
  },

  // تعليم التنبيه كمقروء
  markAsRead: (id: number): Promise<{ success: boolean }> => {
    return apiClient.patch(`/notifications/${id}/read`, {});
  },

  // تعليم جميع التنبيهات كمقروءة
  markAllAsRead: (): Promise<{ success: boolean }> => {
    return apiClient.patch('/notifications/read-all', {});
  },

  // حذف التنبيه
  deleteNotification: (id: number): Promise<{ success: boolean }> => {
    return apiClient.delete(`/notifications/${id}`);
  },

  // إحصائيات التنبيهات
  getNotificationStats: (userId?: number): Promise<NotificationStats> => {
    const params = userId ? `?userId=${userId}` : '';
    return apiClient.get(`/notifications/stats${params}`);
  },
};
