export interface AdminUser {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: 'ADMIN' | 'DOCTOR' | 'PATIENT';
  status: 'ACTIVE' | 'DISABLED' | 'PENDING_DELETE';
  createdAt: string;
  updatedAt: string;
  doctorProfile?: DoctorProfile;
}

export interface DoctorProfile {
  id: string;
  name: string;
  licenseNumber: string;
  yearsOfExperience: number;
  departmentId: string;
  departmentName: string;
  status: 'PENDING' | 'APPROVED' | 'SUSPENDED';
  bio?: string;
  photos?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface MetricsOverview {
  overview: {
    totalAppointments: number;
    confirmedAppointments: number;
    cancelledAppointments: number;
    noShowAppointments: number;
    appointmentRate: number;
    cancellationRate: number;
    noShowRate: number;
  };
  users: {
    totalDoctors: number;
    activeDoctors: number;
    totalPatients: number;
    activePatients: number;
  };
  revenue: {
    totalRevenue: number;
    pendingRevenue: number;
    collectedRevenue: number;
  };
  period: {
    startDate: string;
    endDate: string;
    type: string;
  };
}

export interface AppointmentMetrics {
  statusCounts: Record<string, { count: number; revenue: number }>;
  dailyBreakdown: Array<{
    _id: string;
    count: number;
    confirmed: number;
    cancelled: number;
    revenue: number;
  }>;
  period: {
    startDate: string;
    endDate: string;
    type: string;
  };
  filters: {
    departmentId?: string;
    doctorId?: string;
  };
}

export interface DoctorMetrics {
  doctorStats: Array<{
    _id: string;
    name: string;
    licenseNumber: string;
    departmentName: string;
    totalAppointments: number;
    confirmedAppointments: number;
    cancelledAppointments: number;
    noShowAppointments: number;
    totalRevenue: number;
    averageAppointmentDuration: number;
    confirmationRate: number;
    cancellationRate: number;
    noShowRate: number;
  }>;
  departmentStats: Array<{
    _id: string;
    departmentName: string;
    doctorCount: number;
    totalAppointments: number;
    totalRevenue: number;
  }>;
  period: {
    startDate: string;
    endDate: string;
    type: string;
  };
  filters: {
    departmentId?: string;
  };
}

export interface PatientMetrics {
  patientStats: Array<{
    _id: string;
    name: string;
    email: string;
    phone: string;
    status: string;
    totalAppointments: number;
    lastAppointment: string;
    totalSpent: number;
  }>;
  summary: {
    newPatients: number;
    returningPatients: number;
    totalActivePatients: number;
  };
  period: {
    startDate: string;
    endDate: string;
    type: string;
  };
}

export interface RevenueMetrics {
  revenueStats: Array<{
    _id: string;
    count: number;
    totalAmount: number;
    averageAmount: number;
  }>;
  dailyRevenue: Array<{
    _id: string;
    totalAmount: number;
    count: number;
  }>;
  monthlyTrend: Array<{
    _id: string;
    totalAmount: number;
    count: number;
  }>;
  period: {
    startDate: string;
    endDate: string;
    type: string;
  };
}

export interface AuditLog {
  id: string;
  adminId: string;
  adminName: string;
  action: string;
  targetUserId?: string;
  targetUserName?: string;
  ipAddress?: string;
  userAgent?: string;
  metadata?: Record<string, any>;
  success: boolean;
  errorMessage?: string;
  createdAt: string;
}

export interface ImpersonationSession {
  id: string;
  adminId: string;
  adminName: string;
  targetUserId: string;
  targetUserName: string;
  targetUserRole: string;
  token: string;
  expiresAt: string;
  isActive: boolean;
  ipAddress?: string;
  userAgent?: string;
  reason?: string;
  metadata?: Record<string, any>;
  endedAt?: string;
  endedBy?: string;
  createdAt: string;
}

export interface SystemHealth {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: string;
  services: {
    database: 'connected' | 'disconnected';
    redis: 'connected' | 'disconnected';
    api: 'running' | 'stopped';
  };
}

export interface SystemLog {
  id: string;
  level: 'info' | 'warn' | 'error' | 'debug';
  message: string;
  timestamp: string;
  service: string;
  metadata?: Record<string, any>;
}

export interface ImportExportResult {
  message: string;
  results: {
    imported: number;
    updated: number;
    skipped: number;
    errors: Array<{
      index: number;
      error: string;
      data: any;
    }>;
  };
  importedAt: string;
}

export interface ReportData {
  date: string;
  summary: {
    totalAppointments: number;
    confirmedAppointments: number;
    cancelledAppointments: number;
    noShowAppointments: number;
    totalRevenue: number;
    newPatients: number;
    activeDoctors: number;
  };
  appointments: any;
  payments: any;
  newPatients: any;
  doctorStats: any;
  generatedAt: string;
}
