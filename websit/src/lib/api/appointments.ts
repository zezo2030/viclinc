import { apiClient } from './client';

export interface Appointment {
  id: number;
  patientId: number;
  doctorId: number;
  clinicId: number;
  specialtyId: number;
  departmentId: number;
  appointmentDate: string;
  appointmentTime: string;
  status: 'SCHEDULED' | 'CONFIRMED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED' | 'NO_SHOW';
  reason?: string;
  notes?: string;
  isEmergency: boolean;
  createdAt: string;
  updatedAt: string;
  patient?: {
    id: number;
    profile: {
      firstName: string;
      lastName: string;
      phone: string;
    };
  };
  doctor?: {
    id: number;
    user: {
      profile: {
        firstName: string;
        lastName: string;
      };
    };
    specialization: string;
  };
  clinic?: {
    id: number;
    name: string;
    address: string;
  };
  specialty?: {
    id: number;
    name: string;
  };
  department?: {
    id: number;
    name: string;
  };
}

export interface CreateAppointmentDto {
  patientId: number;
  doctorId: number;
  clinicId: number;
  specialtyId: number;
  departmentId: number;
  appointmentDate: string;
  appointmentTime: string;
  reason?: string;
  notes?: string;
  isEmergency?: boolean;
}

export interface UpdateAppointmentDto {
  appointmentDate?: string;
  appointmentTime?: string;
  status?: 'SCHEDULED' | 'CONFIRMED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED' | 'NO_SHOW';
  reason?: string;
  notes?: string;
  isEmergency?: boolean;
}

export interface AppointmentsQuery {
  page?: number;
  limit?: number;
  status?: string;
  doctorId?: number;
  patientId?: number;
  clinicId?: number;
  date?: string;
  startDate?: string;
  endDate?: string;
}

export const appointmentsService = {
  // جلب جميع المواعيد
  getAppointments: (query: AppointmentsQuery = {}): Promise<Appointment[]> => {
    const params = new URLSearchParams();
    if (query.page) params.append('page', query.page.toString());
    if (query.limit) params.append('limit', query.limit.toString());
    if (query.status) params.append('status', query.status);
    if (query.doctorId) params.append('doctorId', query.doctorId.toString());
    if (query.patientId) params.append('patientId', query.patientId.toString());
    if (query.clinicId) params.append('clinicId', query.clinicId.toString());
    if (query.date) params.append('date', query.date);
    if (query.startDate) params.append('startDate', query.startDate);
    if (query.endDate) params.append('endDate', query.endDate);

    return apiClient.get(`/appointments?${params.toString()}`);
  },

  // جلب مواعيد المريض
  getPatientAppointments: (patientId: number): Promise<Appointment[]> => {
    return apiClient.get(`/appointments?patientId=${patientId}`);
  },

  // جلب مواعيد الطبيب
  getDoctorAppointments: (doctorId: number): Promise<Appointment[]> => {
    return apiClient.get(`/appointments?doctorId=${doctorId}`);
  },

  // جلب موعد واحد
  getAppointment: (id: number): Promise<Appointment> => {
    return apiClient.get(`/appointments/${id}`);
  },

  // إنشاء موعد جديد
  createAppointment: (appointmentData: CreateAppointmentDto): Promise<Appointment> => {
    return apiClient.post('/appointments', appointmentData);
  },

  // تحديث موعد
  updateAppointment: (id: number, appointmentData: UpdateAppointmentDto): Promise<Appointment> => {
    return apiClient.patch(`/appointments/${id}`, appointmentData);
  },

  // حذف موعد
  deleteAppointment: (id: number): Promise<{ success: boolean }> => {
    return apiClient.delete(`/appointments/${id}`);
  },

  // تأكيد موعد
  confirmAppointment: (id: number): Promise<Appointment> => {
    return apiClient.patch(`/appointments/${id}/confirm`, {});
  },

  // إلغاء موعد
  cancelAppointment: (id: number, reason?: string): Promise<Appointment> => {
    return apiClient.patch(`/appointments/${id}/cancel`, { reason });
  },

  // إكمال موعد
  completeAppointment: (id: number): Promise<Appointment> => {
    return apiClient.patch(`/appointments/${id}/complete`, {});
  },

  // جلب الأوقات المتاحة للطبيب
  getAvailableSlots: (doctorId: number, date: string): Promise<string[]> => {
    return apiClient.get(`/appointments/available-slots/${doctorId}?date=${date}`);
  },

  // إحصائيات المواعيد
  getAppointmentsStats: (): Promise<{
    totalAppointments: number;
    appointmentsByStatus: Record<string, number>;
    appointmentsByClinic: Record<string, number>;
    appointmentsBySpecialty: Record<string, number>;
    todayAppointments: number;
    upcomingAppointments: number;
  }> => {
    return apiClient.get('/appointments/stats');
  },
};