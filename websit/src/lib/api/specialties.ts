import { apiClient } from './client';

export interface Specialty {
  _id: string;
  name: string;
  description?: string;
  icon?: string;
  logoUrl?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  doctors?: any[];
  services?: any[];
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
    try {
      const response = await apiClient.get('/departments/public');
      // Ensure response is an array
      if (Array.isArray(response)) {
        return response as Specialty[];
      }
      // If response is wrapped in data property
      if ((response as any)?.data && Array.isArray((response as any).data)) {
        return (response as any).data as Specialty[];
      }
      // If response is a single object, wrap it in an array
      if (response && typeof response === 'object') {
        return [response as Specialty];
      }
      console.warn('Unexpected response format from /departments/public:', response);
      return [];
    } catch (error) {
      console.error('Error fetching specialties:', error);
      throw error;
    }
  },

  async getSpecialty(id: string): Promise<Specialty> {
    try {
      const response = await apiClient.get(`/departments/public/${id}`);
      // If response is wrapped in data property
      if ((response as any)?.data) {
        return (response as any).data as Specialty;
      }
      return response as Specialty;
    } catch (error) {
      console.error(`Error fetching specialty ${id}:`, error);
      throw error;
    }
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
