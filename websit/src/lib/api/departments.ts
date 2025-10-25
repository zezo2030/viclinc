import { apiClient } from './client';

export interface Department {
  id: number;
  name: string;
  description: string;
  clinicId: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  clinic?: {
    id: number;
    name: string;
  };
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

export interface CreateDepartmentDto {
  name: string;
  description: string;
  clinicId: number;
}

export interface UpdateDepartmentDto {
  name?: string;
  description?: string;
  isActive?: boolean;
}

export interface DepartmentsQuery {
  page?: number;
  limit?: number;
  clinicId?: number;
  isActive?: boolean;
  search?: string;
}

export const departmentsService = {
  // جلب جميع الأقسام
  getDepartments: (query: DepartmentsQuery = {}): Promise<Department[]> => {
    const params = new URLSearchParams();
    if (query.page) params.append('page', query.page.toString());
    if (query.limit) params.append('limit', query.limit.toString());
    if (query.clinicId) params.append('clinicId', query.clinicId.toString());
    if (query.isActive !== undefined) params.append('isActive', query.isActive.toString());
    if (query.search) params.append('search', query.search);

    return apiClient.get(`/departments?${params.toString()}`);
  },

  // جلب قسم واحد
  getDepartment: (id: number): Promise<Department> => {
    return apiClient.get(`/departments/${id}`);
  },

  // إنشاء قسم جديد
  createDepartment: (departmentData: CreateDepartmentDto): Promise<Department> => {
    return apiClient.post('/departments', departmentData);
  },

  // تحديث قسم
  updateDepartment: (id: number, departmentData: UpdateDepartmentDto): Promise<Department> => {
    return apiClient.patch(`/departments/${id}`, departmentData);
  },

  // حذف قسم
  deleteDepartment: (id: number): Promise<{ success: boolean }> => {
    return apiClient.delete(`/departments/${id}`);
  },

  // تفعيل/إلغاء تفعيل قسم
  toggleDepartmentStatus: (id: number, isActive: boolean): Promise<Department> => {
    return apiClient.patch(`/departments/${id}/activate`, { isActive });
  },

  // إحصائيات الأقسام
  getDepartmentsStats: (): Promise<{
    totalDepartments: number;
    activeDepartments: number;
    inactiveDepartments: number;
    departmentsByClinic: Record<string, number>;
  }> => {
    return apiClient.get('/departments/stats');
  },
};
