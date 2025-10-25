export interface MetricCard {
  title: string;
  value: string | number;
  change?: number;
  changeType?: 'increase' | 'decrease' | 'neutral';
  icon?: string;
  color?: 'blue' | 'green' | 'red' | 'yellow' | 'purple';
}

export interface ChartData {
  name: string;
  value: number;
  color?: string;
}

export interface TimeSeriesData {
  date: string;
  value: number;
  label?: string;
}

export interface ComparisonData {
  current: number;
  previous: number;
  change: number;
  changePercentage: number;
}

export interface MetricFilter {
  startDate?: string;
  endDate?: string;
  period?: 'day' | 'week' | 'month' | 'year';
  departmentId?: string;
  doctorId?: string;
  includeComparison?: boolean;
}

export interface DashboardMetrics {
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
  trends: {
    appointments: ComparisonData;
    revenue: ComparisonData;
    patients: ComparisonData;
  };
}

export interface PerformanceMetrics {
  doctorId: string;
  doctorName: string;
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
  rating?: number;
  patientSatisfaction?: number;
}

export interface DepartmentMetrics {
  departmentId: string;
  departmentName: string;
  doctorCount: number;
  totalAppointments: number;
  totalRevenue: number;
  averageAppointmentDuration: number;
  patientSatisfaction: number;
}

export interface RevenueMetricsData {
  totalRevenue: number;
  monthlyRevenue: number;
  dailyRevenue: number;
  revenueByService: Array<{
    serviceName: string;
    revenue: number;
    percentage: number;
  }>;
  revenueByDepartment: Array<{
    departmentName: string;
    revenue: number;
    percentage: number;
  }>;
  paymentMethods: Array<{
    method: string;
    count: number;
    amount: number;
    percentage: number;
  }>;
}

export interface PatientMetricsData {
  totalPatients: number;
  newPatients: number;
  returningPatients: number;
  patientRetentionRate: number;
  averageAppointmentsPerPatient: number;
  patientSatisfactionScore: number;
  topPatients: Array<{
    patientId: string;
    patientName: string;
    totalAppointments: number;
    totalSpent: number;
    lastAppointment: string;
  }>;
}

export interface AppointmentMetricsData {
  totalAppointments: number;
  confirmedAppointments: number;
  cancelledAppointments: number;
  noShowAppointments: number;
  pendingAppointments: number;
  completedAppointments: number;
  appointmentRate: number;
  cancellationRate: number;
  noShowRate: number;
  averageAppointmentDuration: number;
  peakHours: Array<{
    hour: number;
    count: number;
  }>;
  appointmentsByDay: Array<{
    day: string;
    count: number;
  }>;
  appointmentsByService: Array<{
    serviceName: string;
    count: number;
    percentage: number;
  }>;
}
