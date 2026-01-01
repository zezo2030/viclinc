import { apiClient } from './client';

export interface Consultation {
  id: number;
  appointmentId: number;
  type: 'VIDEO' | 'CHAT';
  status: 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  startTime?: string;
  endTime?: string;
  duration?: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  appointment: {
    id: number;
    patientId: number;
    doctorId: number;
    appointmentDate: string;
    appointmentTime: string;
    status: string;
    reason?: string;
    patient: {
      id: number;
      email: string;
      profile: {
        firstName: string;
        lastName: string;
        phone?: string;
      };
    };
    doctor: {
      id: number;
      email: string;
      profile: {
        firstName: string;
        lastName: string;
        phone?: string;
      };
    };
  };
  messages?: Message[];
}

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

export interface CreateConsultationDto {
  appointmentId: number | string;
  type: 'VIDEO' | 'CHAT';
  notes?: string;
}

export interface StartConsultationDto {
  notes?: string;
}

export interface EndConsultationDto {
  notes?: string;
}

export const consultationService = {
  // الحصول على جميع الاستشارات
  async getConsultations(patientId?: number, doctorId?: number): Promise<Consultation[]> {
    try {
      const params = new URLSearchParams();
      if (patientId) params.append('patientId', patientId.toString());
      if (doctorId) params.append('doctorId', doctorId.toString());
      
      const queryString = params.toString();
      const endpoint = queryString ? `/consultations?${queryString}` : '/consultations';
      
      const response = await apiClient.get(endpoint);
      // Handle different response formats
      if (Array.isArray(response)) {
        return response;
      }
      return (response as any)?.data || (response as any)?.consultations || [];
    } catch (error: any) {
      // إذا كان الخطأ 500 أو 404، نعيد مصفوفة فارغة بدلاً من رمي الخطأ
      console.warn('Error fetching consultations:', error);
      return [];
    }
  },

  // الحصول على استشارة محددة
  async getConsultation(id: number | string): Promise<Consultation> {
    try {
      const response = await apiClient.get(`/consultations/${id}`);
      // Handle different response formats
      if ((response as any)?.data) {
        return (response as any).data;
      }
      return response as Consultation;
    } catch (error: any) {
      console.error('Error fetching consultation:', error);
      throw error;
    }
  },

  // إنشاء استشارة جديدة
  async createConsultation(data: CreateConsultationDto): Promise<Consultation> {
    const response = await apiClient.post('/consultations', data);
    return (response as any).data;
  },

  // بدء الاستشارة
  async startConsultation(id: number | string, data: StartConsultationDto): Promise<Consultation> {
    const response = await apiClient.put(`/consultations/${id}/start`, data);
    return (response as any)?.data || response;
  },

  // إنهاء الاستشارة
  async endConsultation(id: number | string, data: EndConsultationDto): Promise<Consultation> {
    const response = await apiClient.put(`/consultations/${id}/end`, data);
    return (response as any)?.data || response;
  },

  // إلغاء الاستشارة
  async cancelConsultation(id: number | string): Promise<Consultation> {
    const response = await apiClient.put(`/consultations/${id}/cancel`, {});
    return (response as any)?.data || response;
  },

  // الحصول على رسائل الاستشارة
  async getConsultationMessages(id: number | string): Promise<Message[]> {
    try {
      const response = await apiClient.get(`/consultations/${id}/messages`);
      // Handle different response formats
      if (Array.isArray(response)) {
        return response;
      }
      return (response as any)?.data || [];
    } catch (error: any) {
      console.error('Error fetching consultation messages:', error);
      return [];
    }
  },

  // إرسال رسالة
  async sendMessage(
    consultationId: number | string, 
    message: string, 
    messageType: 'TEXT' | 'IMAGE' | 'FILE' = 'TEXT',
    fileUrl?: string
  ): Promise<Message> {
    const response = await apiClient.post(`/consultations/${consultationId}/messages`, {
      message,
      messageType,
      fileUrl,
    });
    return (response as any)?.data || response;
  },
};
