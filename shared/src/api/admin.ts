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
  
  updateUserRole: (userId: string, role: string) => 
    apiClient.patch(`/admin/users/${userId}/role`, { role }),
  
  updateUserStatus: (userId: string, status: string) => 
    apiClient.patch(`/admin/users/${userId}/status`, { status }),
  
  // Impersonation
  loginAs: (userId: string) => 
    apiClient.post('/admin/login-as', { userId }),
  
  logoutAs: () => 
    apiClient.post('/admin/logout-as'),
  
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
