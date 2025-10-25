import { apiClient } from './client';

export interface Message {
  id: number;
  consultationId: number;
  senderId: number;
  message: string;
  messageType: 'TEXT' | 'IMAGE' | 'FILE';
  fileUrl?: string;
  isRead: boolean;
  createdAt: string;
  sender: {
    id: number;
    email: string;
    profile: {
      firstName: string;
      lastName: string;
    };
  };
}

export interface CreateMessageDto {
  consultationId: number;
  senderId: number;
  message: string;
  messageType: 'TEXT' | 'IMAGE' | 'FILE';
  fileUrl?: string;
}

export const messageService = {
  // الحصول على رسائل استشارة محددة
  async getMessagesByConsultation(consultationId: number): Promise<Message[]> {
    const response = await apiClient.get(`/messages/consultation/${consultationId}`);
    return (response as any).data;
  },

  // الحصول على الرسائل غير المقروءة
  async getUnreadMessages(): Promise<Message[]> {
    const response = await apiClient.get('/messages/unread');
    return (response as any).data;
  },

  // الحصول على رسالة محددة
  async getMessageById(id: number): Promise<Message> {
    const response = await apiClient.get(`/messages/${id}`);
    return (response as any).data;
  },

  // إنشاء رسالة جديدة
  async createMessage(data: CreateMessageDto): Promise<Message> {
    const response = await apiClient.post('/messages', data);
    return (response as any).data;
  },

  // تحديد رسالة كمقروءة
  async markAsRead(messageId: number): Promise<void> {
    await apiClient.put(`/messages/${messageId}/read`, {});
  },

  // تحديد جميع رسائل الاستشارة كمقروءة
  async markAllAsRead(consultationId: number): Promise<void> {
    await apiClient.put(`/messages/consultation/${consultationId}/read-all`, {});
  },

  // حذف رسالة
  async deleteMessage(messageId: number): Promise<void> {
    await apiClient.delete(`/messages/${messageId}`);
  },
};
