import { Service } from '@/types';
import { mockServices } from '@/lib/mock-data';
import { apiClient } from './client';

export interface ServiceApi {
  _id?: string;
  id?: string;
  name: string;
  description?: string;
  departmentId?: string;
  defaultDurationMin?: number;
  isActive?: boolean;
}

// Public services API
export const servicesApi = {
  getAll: async (departmentId?: string): Promise<ServiceApi[]> => {
    try {
      const params = departmentId ? `?departmentId=${departmentId}` : '';
      // استخدام public endpoint
      const response = await apiClient.get<ServiceApi[]>(`/services${params}`);
      return Array.isArray(response) ? response : [];
    } catch (error) {
      console.error('Error fetching services from API:', error);
      return [];
    }
  },
  
  getById: async (id: string): Promise<ServiceApi | null> => {
    try {
      // استخدام endpoint عام بدلاً من admin endpoint
      const response = await apiClient.get<ServiceApi>(`/services/${id}`);
      return response || null;
    } catch (error) {
      console.error('Error fetching service from API, falling back to mock:', error);
      await new Promise(resolve => setTimeout(resolve, 300));
      return mockServices.find(service => service.id === id) as any || null;
    }
  },
  
  getByCategory: async (category: string): Promise<Service[]> => {
    await new Promise(resolve => setTimeout(resolve, 300));
    return mockServices.filter(service => service.category === category);
  },
  
  getPopular: async (): Promise<Service[]> => {
    await new Promise(resolve => setTimeout(resolve, 300));
    return mockServices.filter(service => service.isPopular);
  },
};
