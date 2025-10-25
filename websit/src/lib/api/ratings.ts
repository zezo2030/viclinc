import { apiClient } from './client';

export interface Rating {
  id: number;
  appointmentId: number;
  doctorId: number;
  patientId: number;
  rating: number;
  review?: string;
  createdAt: string;
  patient: {
    id: number;
    profile: {
      firstName: string;
      lastName: string;
    };
  };
  doctor: {
    id: number;
    profile: {
      firstName: string;
      lastName: string;
    };
  };
}

export interface CreateRatingDto {
  appointmentId: number;
  doctorId: number;
  rating: number;
  review?: string;
}

export interface DoctorRatingStats {
  ratings: Rating[];
  averageRating: number;
  totalRatings: number;
}

export const ratingService = {
  // إنشاء تقييم جديد
  async createRating(data: CreateRatingDto): Promise<Rating> {
    const response = await apiClient.post('/ratings', data);
    return (response as any).data;
  },

  // الحصول على تقييمات الطبيب
  async getDoctorRatings(doctorId: number): Promise<DoctorRatingStats> {
    const response = await apiClient.get(`/ratings/doctor/${doctorId}`);
    return (response as any).data;
  },

  // الحصول على تقييمات المريض
  async getPatientRatings(patientId: number): Promise<Rating[]> {
    const response = await apiClient.get(`/ratings/patient/${patientId}`);
    return (response as any).data;
  },

  // تحديث التقييم
  async updateRating(ratingId: number, data: Partial<CreateRatingDto>): Promise<Rating> {
    const response = await apiClient.put(`/ratings/${ratingId}`, data);
    return (response as any).data;
  },

  // حذف التقييم
  async deleteRating(ratingId: number): Promise<void> {
    await apiClient.delete(`/ratings/${ratingId}`);
  },

  // الحصول على تقييم محدد
  async getRatingById(ratingId: number): Promise<Rating> {
    const response = await apiClient.get(`/ratings/${ratingId}`);
    return (response as any).data;
  },
};
