import { apiClient } from './client';

export interface Specialty {
  id: number;
  name: string;
  description?: string;
  icon?: string;
  services: string[];
  isActive: boolean;
  doctors: {
    id: number;
    specialization: string;
    user: {
      profile: {
        firstName: string;
        lastName: string;
      };
    };
  }[];
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
    const response = await apiClient.get('/specialties/public');
    return response as Specialty[];
  },

  async getSpecialty(id: number): Promise<Specialty> {
    const response = await apiClient.get(`/specialties/${id}`);
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
