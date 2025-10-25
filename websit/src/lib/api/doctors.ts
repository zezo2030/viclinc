import { apiClient } from './client';
import { mockDoctors } from '../mock-data/doctors';

export interface Doctor {
  id: number;
  userId: number;
  clinicId: number;
  departmentId: number;
  specialtyId: number;
  specialization: string;
  licenseNumber: string;
  experience: number;
  consultationFee: number;
  isAvailable: boolean;
  avatar?: string;
  user: {
    id: number;
    email: string;
    profile: {
      firstName: string;
      lastName: string;
      phone?: string;
    };
  };
  clinic: {
    id: number;
    name: string;
    address: string;
  };
  department: {
    id: number;
    name: string;
  };
  specialty: {
    id: number;
    name: string;
  };
}

export interface CreateDoctorDto {
  userId: number;
  clinicId: number;
  departmentId: number;
  specialtyId: number;
  specialization: string;
  licenseNumber: string;
  experience: number;
  consultationFee: number;
  isAvailable?: boolean;
  avatar?: string;
}

export const doctorsService = {
  // الحصول على جميع الأطباء
  // TODO: هذا حل مؤقت - سيتم استبداله بـ API endpoint حقيقي
  async getDoctors(): Promise<Doctor[]> {
    // استخدام البيانات الوهمية مؤقتاً
    return mockDoctors as unknown as Doctor[];
    
    // الكود الأصلي (معلق للرجوع إليه لاحقاً):
    // const response = await apiClient.get('/doctors');
    // return response as Doctor[];
  },

  // الحصول على طبيب محدد
  async getDoctor(id: number): Promise<Doctor> {
    const response = await apiClient.get(`/doctors/${id}`);
    return response as Doctor;
  },

  // إنشاء طبيب جديد
  async createDoctor(data: CreateDoctorDto): Promise<Doctor> {
    const response = await apiClient.post('/doctors', data);
    return (response as any).data;
  },

  // تحديث طبيب
  async updateDoctor(id: number, data: Partial<CreateDoctorDto>): Promise<Doctor> {
    const response = await apiClient.put(`/doctors/${id}`, data);
    return (response as any).data;
  },

  // حذف طبيب
  async deleteDoctor(id: number): Promise<void> {
    await apiClient.delete(`/doctors/${id}`);
  },

  // البحث عن الأطباء
  async searchDoctors(query: {
    specialization?: string;
    clinicId?: number;
    isAvailable?: boolean;
  }): Promise<Doctor[]> {
    const params = new URLSearchParams();
    if (query.specialization) params.append('specialization', query.specialization);
    if (query.clinicId) params.append('clinicId', query.clinicId.toString());
    if (query.isAvailable !== undefined) params.append('isAvailable', query.isAvailable.toString());
    
    const response = await apiClient.get(`/doctors/search?${params.toString()}`);
    return (response as any).data;
  },
};