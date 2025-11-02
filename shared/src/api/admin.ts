import { apiClient } from './client';

export interface MetricsQuery {
  startDate?: string;
  endDate?: string;
  period?: 'day' | 'week' | 'month' | 'year';
  departmentId?: string;
  doctorId?: string;
  includeComparison?: boolean;
}

export interface UserQuery {
  role?: string;
  status?: string;
  search?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface CreateUserDto {
  name: string;
  email: string;
  phone: string;
  password: string;
  role: 'ADMIN' | 'DOCTOR' | 'PATIENT';
}

export interface CreateDoctorDto {
  userId: string;
  name: string;
  licenseNumber: string;
  yearsOfExperience: number;
  departmentId: string;
  photos?: string[];
  bio?: string;
}

export interface CreateDepartmentDto {
  name: string;
  description?: string;
  isActive?: boolean;
}

export interface UpdateDepartmentDto extends Partial<CreateDepartmentDto> {}

export interface AppointmentQuery {
  status?: string;
  doctorId?: string;
  patientId?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
  search?: string;
}

export const adminService = {
  // Metrics
  getOverviewMetrics: (params?: MetricsQuery) => 
    apiClient.get('/admin/metrics/overview', { params }),
  
  getAppointmentMetrics: (params?: MetricsQuery) => 
    apiClient.get('/admin/metrics/appointments', { params }),
  
  getDoctorMetrics: (params?: MetricsQuery) => 
    apiClient.get('/admin/metrics/doctors', { params }),
  
  getPatientMetrics: (params?: MetricsQuery) => 
    apiClient.get('/admin/metrics/patients', { params }),
  
  getRevenueMetrics: (params?: MetricsQuery) => 
    apiClient.get('/admin/metrics/revenue', { params }),
  
  // Users Management
  getUsers: (params?: UserQuery) => 
    apiClient.get('/admin/users', { params }),
  
  createUser: (userData: CreateUserDto) => 
    apiClient.post('/admin/users', userData),
  
  updateUserRole: (userId: string, role: string) => 
    apiClient.patch(`/admin/users/${userId}/role`, { role }),
  
  updateUserStatus: (userId: string, status: string) => 
    apiClient.patch(`/admin/users/${userId}/status`, { status }),
  
  // Impersonation
  loginAs: (userId: string) => 
    apiClient.post('/admin/login-as', { userId }),
  
  logoutAs: () => 
    apiClient.post('/admin/logout-as'),
  
  // Departments
  getDepartments: () => 
    apiClient.get('/admin/departments'),
  
  getDepartment: (id: string) => 
    apiClient.get(`/admin/departments/${id}`),
  
  createDepartment: (departmentData: CreateDepartmentDto, logoFile?: File) => {
    // إذا كان هناك ملف، استخدم FormData
    if (logoFile) {
      const formData = new FormData();
      formData.append('name', departmentData.name);
      if (departmentData.description) {
        formData.append('description', departmentData.description);
      }
      if (departmentData.isActive !== undefined) {
        formData.append('isActive', String(departmentData.isActive));
      }
      formData.append('logo', logoFile);
      return apiClient.post('/admin/departments', formData);
    }
    
    // إذا لم يكن هناك ملف، استخدم JSON عادي
    return apiClient.post('/admin/departments', departmentData);
  },
  
  updateDepartment: (id: string, departmentData: UpdateDepartmentDto, logoFile?: File) => {
    // إذا كان هناك ملف، استخدم FormData
    if (logoFile) {
      const formData = new FormData();
      if (departmentData.name) {
        formData.append('name', departmentData.name);
      }
      if (departmentData.description !== undefined) {
        formData.append('description', departmentData.description || '');
      }
      if (departmentData.isActive !== undefined) {
        formData.append('isActive', String(departmentData.isActive));
      }
      formData.append('logo', logoFile);
      return apiClient.patch(`/admin/departments/${id}`, formData);
    }
    
    // إذا لم يكن هناك ملف، استخدم JSON عادي
    return apiClient.patch(`/admin/departments/${id}`, departmentData);
  },
  
  deleteDepartment: (id: string) => 
    apiClient.delete(`/admin/departments/${id}`),
  
  // Import/Export
  exportDepartments: (format: 'json' | 'csv' = 'json') => 
    apiClient.get('/admin/departments/export', { 
      params: { format },
      responseType: format === 'csv' ? 'blob' : 'json'
    }),
  
  importDepartments: (data: any, format: 'json' | 'csv' = 'json') => 
    apiClient.post('/admin/departments/import', { data, format }),
  
  exportServices: (format: 'json' | 'csv' = 'json') => 
    apiClient.get('/admin/services/export', { 
      params: { format },
      responseType: format === 'csv' ? 'blob' : 'json'
    }),
  
  importServices: (data: any, format: 'json' | 'csv' = 'json') => 
    apiClient.post('/admin/services/import', { data, format }),
  
  // Doctors Management
  getDoctors: (params?: any) => 
    apiClient.get('/admin/doctors', { params }),
  
  createDoctor: (doctorData: CreateDoctorDto) => 
    apiClient.post('/admin/doctors', doctorData),
  
  updateDoctorStatus: (doctorId: string, status: string) => 
    apiClient.patch(`/admin/doctors/${doctorId}/status`, { status }),
  
  getDoctorSchedule: (doctorId: string) => 
    apiClient.get(`/admin/doctors/${doctorId}/schedule`),
  
  getDoctorAppointments: (doctorId: string, params?: any) => 
    apiClient.get(`/admin/doctors/${doctorId}/appointments`, { params }),
  
  // Appointments Management
  getAppointments: (params?: AppointmentQuery) => 
    apiClient.get('/admin/appointments', { params }),
  
  updateAppointmentStatus: (appointmentId: string, status: string) => 
    apiClient.patch(`/admin/appointments/${appointmentId}/status`, { status }),
  
  getAppointmentConflicts: () => 
    apiClient.get('/admin/appointments/conflicts'),
  
  // Reports
  getDailyReport: (date: string) => 
    apiClient.get('/admin/reports/daily', { params: { date } }),
  
  getWeeklyReport: (weekStart: string) => 
    apiClient.get('/admin/reports/weekly', { params: { weekStart } }),
  
  getMonthlyReport: (month: string) => 
    apiClient.get('/admin/reports/monthly', { params: { month } }),
  
  getDoctorsPerformance: (params?: any) => 
    apiClient.get('/admin/reports/doctors-performance', { params }),
  
  // System
  getSystemHealth: () => 
    apiClient.get('/admin/system/health'),
  
  getSystemLogs: (params?: any) => 
    apiClient.get('/admin/system/logs', { params }),
  
  createBackup: () => 
    apiClient.post('/admin/system/backup'),
  
  getAuditLogs: (params?: any) => 
    apiClient.get('/admin/system/audit', { params }),
};
