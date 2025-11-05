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

// For now, return mock data instead of actual API calls
export const servicesApi = {
  getAll: async (departmentId?: string): Promise<ServiceApi[]> => {
    try {
      const params = departmentId ? `?departmentId=${departmentId}` : '';
      // استخدام endpoint عام بدلاً من admin endpoint
      const response = await apiClient.get<ServiceApi[]>(`/services${params}`);
      return response || [];
    } catch (error) {
      console.error('Error fetching services from API, falling back to mock:', error);
      // Fallback to mock data
      await new Promise(resolve => setTimeout(resolve, 500));
      return mockServices as any;
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
