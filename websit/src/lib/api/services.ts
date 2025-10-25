import { Service } from '@/types';
import { mockServices } from '@/lib/mock-data';

// For now, return mock data instead of actual API calls
export const servicesApi = {
  getAll: async (): Promise<Service[]> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    return mockServices;
  },
  
  getById: async (id: string): Promise<Service | null> => {
    await new Promise(resolve => setTimeout(resolve, 300));
    return mockServices.find(service => service.id === id) || null;
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
