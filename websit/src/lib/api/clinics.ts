import { apiClient } from './client';

export interface Clinic {
  id: number;
  name: string;
  address: string;
  phone: string;
  email: string;
  workingHours: Record<string, any>;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  departments?: Array<{
    id: number;
    name: string;
    description: string;
    isActive: boolean;
  }>;
  doctors?: Array<{
    id: number;
    user: {
      profile: {
        firstName: string;
        lastName: string;
      };
    };
  }>;
}

export interface CreateClinicDto {
  name: string;
  address: string;
  phone: string;
  email: string;
  workingHours: Record<string, any>;
}

export interface UpdateClinicDto {
  name?: string;
  address?: string;
  phone?: string;
  email?: string;
  workingHours?: Record<string, any>;
  isActive?: boolean;
}

export interface ClinicsQuery {
  page?: number;
  limit?: number;
  isActive?: boolean;
  search?: string;
}

export const clinicsService = {
  // جلب جميع العيادات
  getClinics: (query: ClinicsQuery = {}): Promise<Clinic[]> => {
    const params = new URLSearchParams();
    if (query.page) params.append('page', query.page.toString());
    if (query.limit) params.append('limit', query.limit.toString());
    if (query.isActive !== undefined) params.append('isActive', query.isActive.toString());
    if (query.search) params.append('search', query.search);

    return apiClient.get(`/clinics?${params.toString()}`);
  },

  // جلب عيادة واحدة
  getClinic: (id: number): Promise<Clinic> => {
    return apiClient.get(`/clinics/${id}`);
  },

  // إنشاء عيادة جديدة
  createClinic: (clinicData: CreateClinicDto): Promise<Clinic> => {
    return apiClient.post('/clinics', clinicData);
  },

  // تحديث عيادة
  updateClinic: (id: number, clinicData: UpdateClinicDto): Promise<Clinic> => {
    return apiClient.patch(`/clinics/${id}`, clinicData);
  },

  // حذف عيادة
  deleteClinic: (id: number): Promise<{ success: boolean }> => {
    return apiClient.delete(`/clinics/${id}`);
  },

  // تفعيل/إلغاء تفعيل عيادة
  toggleClinicStatus: (id: number, isActive: boolean): Promise<Clinic> => {
    return apiClient.patch(`/clinics/${id}/activate`, { isActive });
  },

  // إحصائيات العيادات
  getClinicsStats: (): Promise<{
    totalClinics: number;
    activeClinics: number;
    inactiveClinics: number;
    clinicsByDepartment: Record<string, number>;
  }> => {
    return apiClient.get('/clinics/stats');
  },
};
