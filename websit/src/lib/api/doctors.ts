import { apiClient } from './client';

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
  async getDoctors(): Promise<Doctor[]> {
    try {
      // استخدام endpoint العام للأطباء المعتمدين
      const response = await apiClient.get('/doctors/public');
      
      // البيانات القادمة من الباك إند تكون على شكل DoctorListItem
      const doctors = Array.isArray(response) ? response : (response?.data || []);
      
      // تحويل البيانات من شكل الباك إند إلى شكل الواجهة
      return doctors.map((doctor: any) => {
        // تقسيم الاسم إلى firstName و lastName
        const nameParts = (doctor.name || '').trim().split(' ');
        const firstName = nameParts[0] || '';
        const lastName = nameParts.slice(1).join(' ') || '';
        
        // الحصول على أول خدمة للطبيب (إذا كانت متوفرة) للحصول على السعر
        const firstService = doctor.services?.[0];
        const consultationFee = firstService?.customPrice || 0;
        
        return {
          id: doctor._id || doctor.id,
          userId: doctor.userId || doctor._id || '',
          clinicId: doctor.clinicId || '',
          departmentId: doctor.departmentId || '',
          specialtyId: doctor.specialtyId || doctor.departmentId || '',
          specialization: doctor.departmentName || doctor.specialization || '',
          licenseNumber: doctor.licenseNumber || '',
          experience: doctor.yearsOfExperience || 0,
          consultationFee: consultationFee,
          isAvailable: doctor.status === 'APPROVED',
          avatar: doctor.photos?.[0] || '',
          user: {
            id: doctor.userId || doctor._id || '',
            email: doctor.email || '',
            profile: {
              firstName: firstName,
              lastName: lastName,
              phone: doctor.phone || '',
            },
          },
          clinic: {
            id: doctor.clinicId || '',
            name: doctor.clinicName || 'العيادة',
            address: doctor.clinicAddress || '',
          },
          department: {
            id: doctor.departmentId || '',
            name: doctor.departmentName || '',
          },
          specialty: {
            id: doctor.specialtyId || doctor.departmentId || '',
            name: doctor.departmentName || doctor.specialization || '',
          },
        };
      });
    } catch (error) {
      console.error('Error fetching doctors from API:', error);
      // في حالة الخطأ، إرجاع مصفوفة فارغة بدلاً من البيانات الوهمية
      // لتجنب عرض أطباء غير موجودين في قاعدة البيانات
      return [];
    }
  },

  // الحصول على طبيب محدد
  async getDoctor(id: number | string): Promise<Doctor> {
    try {
      // استخدام endpoint العام للأطباء المعتمدين
      const response = await apiClient.get(`/doctors/public/${id}`);
      
      // تحويل البيانات من شكل الباك إند إلى شكل الواجهة
      const doctor = response as any;
      
      // تقسيم الاسم إلى firstName و lastName
      const nameParts = (doctor.name || '').trim().split(' ');
      const firstName = nameParts[0] || '';
      const lastName = nameParts.slice(1).join(' ') || '';
      
      // الحصول على أول خدمة للطبيب (إذا كانت متوفرة) للحصول على السعر
      const firstService = doctor.services?.[0];
      const consultationFee = firstService?.customPrice || 0;
      
      return {
        id: doctor._id || doctor.id,
        userId: doctor.userId || doctor._id || '',
        clinicId: doctor.clinicId || '',
        departmentId: doctor.departmentId || '',
        specialtyId: doctor.specialtyId || doctor.departmentId || '',
        specialization: doctor.departmentName || doctor.specialization || '',
        licenseNumber: doctor.licenseNumber || '',
        experience: doctor.yearsOfExperience || 0,
        consultationFee: consultationFee,
        isAvailable: doctor.status === 'APPROVED',
        avatar: doctor.photos?.[0] || '',
        user: {
          id: doctor.userId || doctor._id || '',
          email: doctor.email || '',
          profile: {
            firstName: firstName,
            lastName: lastName,
            phone: doctor.phone || '',
          },
        },
        clinic: {
          id: doctor.clinicId || '',
          name: doctor.clinicName || 'العيادة',
          address: doctor.clinicAddress || '',
        },
        department: {
          id: doctor.departmentId || '',
          name: doctor.departmentName || '',
        },
        specialty: {
          id: doctor.specialtyId || doctor.departmentId || '',
          name: doctor.departmentName || doctor.specialization || '',
        },
      };
    } catch (error) {
      console.error('Error fetching doctor from API:', error);
      throw error;
    }
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

  // الحصول على توفر الطبيب
  async getDoctorAvailability(
    doctorId: string | number,
    serviceId: string | number,
    weekStart?: string
  ): Promise<{
    doctorId: string;
    serviceId: string;
    weekStart: string;
    availableSlots: Array<{
      startTime: string;
      endTime: string;
      duration: number;
    }>;
  }> {
    const params = new URLSearchParams();
    params.append('serviceId', serviceId.toString());
    if (weekStart) params.append('weekStart', weekStart);
    
    const response = await apiClient.get(`/patient/doctors/${doctorId}/availability?${params.toString()}`);
    return response as any;
  },
};