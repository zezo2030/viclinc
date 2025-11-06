import { apiClient } from './client';

export interface Department {
  _id?: string;
  id?: string;
  name: string;
  description?: string;
  isActive: boolean;
  logoUrl?: string;
  logoPath?: string;
  icon?: string;
  doctorCount?: number;
  createdAt?: string;
  updatedAt?: string;
  doctors?: Array<any>;
  services?: Array<any>;
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
  // جلب جميع الأقسام النشطة (Public API)
  getDepartments: (query: DepartmentsQuery = {}): Promise<Department[]> => {
    return apiClient.get('/departments/public');
  },

  // جلب قسم واحد مع التفاصيل (Public API)
  getDepartment: (id: string): Promise<Department> => {
    return apiClient.get(`/departments/public/${id}`);
  },
  
  // جلب جميع الأقسام (Admin API - يحتاج auth)
  getAllDepartments: (query: DepartmentsQuery = {}): Promise<Department[]> => {
    const params = new URLSearchParams();
    if (query.page) params.append('page', query.page.toString());
    if (query.limit) params.append('limit', query.limit.toString());
    if (query.isActive !== undefined) params.append('isActive', query.isActive.toString());
    if (query.search) params.append('search', query.search);

    return apiClient.get(`/admin/departments?${params.toString()}`);
  },

  // إنشاء قسم جديد (Admin API)
  createDepartment: (departmentData: CreateDepartmentDto): Promise<Department> => {
    return apiClient.post('/admin/departments', departmentData);
  },

  // تحديث قسم (Admin API)
  updateDepartment: (id: string, departmentData: UpdateDepartmentDto): Promise<Department> => {
    return apiClient.patch(`/admin/departments/${id}`, departmentData);
  },

  // حذف قسم (Admin API)
  deleteDepartment: (id: string): Promise<{ success: boolean }> => {
    return apiClient.delete(`/admin/departments/${id}`);
  },

  // تفعيل/إلغاء تفعيل قسم (Admin API)
  toggleDepartmentStatus: (id: string, isActive: boolean): Promise<Department> => {
    return apiClient.patch(`/admin/departments/${id}`, { isActive });
  },
};
