import { apiClient } from './client';

export interface Specialty {
  _id: string;
  name: string;
  description?: string;
  icon?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateSpecialtyDto {
  name: string;
  description?: string;
  icon?: string;
  services?: string[];
  isActive?: boolean;
}

export const specialtyService = {
  async getSpecialties(): Promise<Specialty[]> {
    const response = await apiClient.get('/departments/public');
    return response as Specialty[];
  },

  async getSpecialty(id: string): Promise<Specialty> {
    const response = await apiClient.get(`/departments/public/${id}`);
    return response as Specialty;
  },

  async createSpecialty(data: CreateSpecialtyDto): Promise<Specialty> {
    const response = await apiClient.post('/specialties', data);
    return (response as any).data;
  },

  async updateSpecialty(id: number, data: Partial<CreateSpecialtyDto>): Promise<Specialty> {
    const response = await apiClient.put(`/specialties/${id}`, data);
    return (response as any).data;
  },

  async deleteSpecialty(id: number): Promise<void> {
    await apiClient.delete(`/specialties/${id}`);
  },

  async getSpecialtyStats() {
    const response = await apiClient.get('/specialties/stats');
    return (response as any).data;
  }
};
