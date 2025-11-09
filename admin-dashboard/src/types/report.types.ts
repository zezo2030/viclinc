// Report Types for Phase 12

export interface ReportSummary {
  generatedAt: string
}

export interface DailyReport extends ReportSummary {
  date: string
  appointments?: {
    total: number
    confirmed: number
    cancelled: number
    noShow: number
    completed: number
  }
  payments?: {
    total: number
    paid: number
    pending: number
    refunded: number
  }
  newPatients?: number
  doctorStats?: Array<{
    doctorId: string
    doctorName: string
    appointmentCount: number
    revenue: number
  }>
  hourlyDistribution?: Array<{
    hour: number
    count: number
  }>
}

export interface WeeklyReport extends ReportSummary {
  weekStart: string
  weekEnd: string
  appointments?: {
    total: number
    confirmed: number
    cancelled: number
    noShow: number
    completed: number
  }
  payments?: {
    total: number
    paid: number
    pending: number
    refunded: number
  }
  newPatients?: number
  doctorStats?: Array<{
    doctorId: string
    doctorName: string
    appointmentCount: number
    revenue: number
  }>
  dailyBreakdown?: Array<{
    date: string
    appointments: number
    revenue: number
    newPatients: number
  }>
  comparison?: {
    previousWeek: {
      appointments: number
      revenue: number
      newPatients: number
    }
    change: {
      appointments: number
      revenue: number
      newPatients: number
    }
  }
}

export interface MonthlyReport extends ReportSummary {
  month: string // YYYY-MM
  summary: {
    totalAppointments: number
    confirmedAppointments: number
    cancelledAppointments: number
    noShowAppointments: number
    totalRevenue: number
    newPatients: number
    activeDoctors: number
  }
  appointments?: {
    total: number
    confirmed: number
    cancelled: number
    noShow: number
    completed: number
  }
  payments?: {
    total: number
    paid: number
    pending: number
    refunded: number
  }
  newPatients?: number
  doctorStats?: Array<{
    doctorId: string
    doctorName: string
    appointmentCount: number
    revenue: number
  }>
  weeklyBreakdown?: Array<{
    week: string
    appointments: number
    revenue: number
    newPatients: number
  }>
  departmentStats?: Array<{
    departmentId: string
    departmentName: string
    appointments: number
    revenue: number
    sharePercentage: number
  }>
}

export interface DoctorsPerformanceParams {
  startDate?: string
  endDate?: string
  departmentId?: string
  limit?: number
}

export interface DoctorPerformanceData {
  doctorId: string
  doctorName: string
  departmentName: string
  email: string
  phone: string
  totalAppointments: number
  completedAppointments: number
  cancelledAppointments: number
  noShowAppointments: number
  revenue: number
  averageRating: number
  totalRatings: number
  patientCount: number
}

export interface DoctorsPerformanceReport extends ReportSummary {
  period: {
    startDate: string
    endDate: string
  }
  doctors: DoctorPerformanceData[]
  summary: {
    totalDoctors: number
    totalAppointments: number
    totalRevenue: number
    averageRating: number
  }
}

export interface CustomReportParams {
  startDate: string
  endDate: string
  departmentIds?: string[]
  doctorIds?: string[]
  appointmentTypes?: string[]
  paymentStatuses?: string[]
  serviceTypes?: string[]
  fields?: string[]
}

export interface CustomReportData {
  [key: string]: any
}

export interface CustomReport extends ReportSummary {
  period: {
    startDate: string
    endDate: string
  }
  filters: CustomReportParams
  data: CustomReportData[]
  summary: {
    totalRecords: number
    totalRevenue: number
    totalAppointments: number
  }
}










