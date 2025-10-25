// Export all components
export * from './components/ui/button';
export * from './components/ui/card';
export * from './components/ui/badge';

// Export all API services
export * from './api/client';
export * from './api/admin';

// Export admin types
export * from './types/admin';

// Export metrics types with specific names
export type {
  MetricCard,
  ChartData,
  TimeSeriesData,
  ComparisonData,
  MetricFilter,
  DashboardMetrics,
  PerformanceMetrics,
  DepartmentMetrics,
  RevenueMetricsData as RevenueMetrics,
  PatientMetricsData as PatientMetrics,
  AppointmentMetricsData as AppointmentMetrics
} from './types/metrics';