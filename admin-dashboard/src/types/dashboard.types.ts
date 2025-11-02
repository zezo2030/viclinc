// أنواع المؤشرات العامة
export interface OverviewMetrics {
  totalUsers: number
  totalDoctors: number
  totalAppointments: number
  totalRevenue: number // المجموع بالعملة الأساسية
  deltas?: {
    users?: number // نسبة/فرق الفترة الحالية عن السابقة
    doctors?: number
    appointments?: number
    revenue?: number
  }
}

// نقاط السلاسل الزمنية
export interface TimeSeriesPoint {
  date: string // ISO string: YYYY-MM-DD
  value: number
}

// استجابات الـ API المتوقعة
export interface AppointmentsMetricsResponse {
  range: '7d' | '30d' | '90d'
  groupBy: 'day' | 'week' | 'month'
  series: TimeSeriesPoint[]
}

export interface RevenueMetricsResponse {
  range: '7d' | '30d' | '90d'
  currency: string
  series: TimeSeriesPoint[]
  comparison?: TimeSeriesPoint[] // للسلسلة المقارنة إن وجدت
}

// خصائص المكونات
export interface MetricCardProps {
  title: string
  value: number | string
  delta?: number // ±% لعرض الاتجاه
  icon?: React.ReactNode
  isLoading?: boolean
  variant?: 'primary' | 'success' | 'warning' | 'danger' | 'neutral'
}

export interface AppointmentChartProps {
  data: TimeSeriesPoint[]
  range: '7d' | '30d' | '90d'
  groupBy?: 'day' | 'week' | 'month'
  isLoading?: boolean
  onRangeChange?: (r: '7d' | '30d' | '90d') => void
}

export interface RevenueChartProps {
  data: TimeSeriesPoint[]
  comparison?: TimeSeriesPoint[]
  range: '7d' | '30d' | '90d'
  currency?: string
  isLoading?: boolean
  onRangeChange?: (r: '7d' | '30d' | '90d') => void
}

export interface QuickAction {
  id: string
  label: string
  icon?: React.ReactNode
  onClick: () => void
}

export interface QuickActionsProps {
  actions: QuickAction[]
}



