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
  appointmentId: number;
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
    const params = new URLSearchParams();
    if (patientId) params.append('patientId', patientId.toString());
    if (doctorId) params.append('doctorId', doctorId.toString());
    
    const response = await apiClient.get(`/consultations?${params.toString()}`);
    return (response as any).data;
  },

  // الحصول على استشارة محددة
  async getConsultation(id: number): Promise<Consultation> {
    const response = await apiClient.get(`/consultations/${id}`);
    return (response as any).data;
  },

  // إنشاء استشارة جديدة
  async createConsultation(data: CreateConsultationDto): Promise<Consultation> {
    const response = await apiClient.post('/consultations', data);
    return (response as any).data;
  },

  // بدء الاستشارة
  async startConsultation(id: number, data: StartConsultationDto): Promise<Consultation> {
    const response = await apiClient.put(`/consultations/${id}/start`, data);
    return (response as any).data;
  },

  // إنهاء الاستشارة
  async endConsultation(id: number, data: EndConsultationDto): Promise<Consultation> {
    const response = await apiClient.put(`/consultations/${id}/end`, data);
    return (response as any).data;
  },

  // إلغاء الاستشارة
  async cancelConsultation(id: number): Promise<Consultation> {
    const response = await apiClient.put(`/consultations/${id}/cancel`, {});
    return (response as any).data;
  },

  // الحصول على رسائل الاستشارة
  async getConsultationMessages(id: number): Promise<Message[]> {
    const response = await apiClient.get(`/consultations/${id}/messages`);
    return (response as any).data;
  },

  // إرسال رسالة
  async sendMessage(
    consultationId: number, 
    message: string, 
    messageType: 'TEXT' | 'IMAGE' | 'FILE' = 'TEXT',
    fileUrl?: string
  ): Promise<Message> {
    const response = await apiClient.post(`/consultations/${consultationId}/messages`, {
      message,
      messageType,
      fileUrl,
    });
    return (response as any).data;
  },
};
