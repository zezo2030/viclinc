import { useQuery } from '@tanstack/react-query'
import { reportsApi } from '@/api/reports'
import type {
  DailyReport,
  WeeklyReport,
  MonthlyReport,
  DoctorsPerformanceReport,
  CustomReport,
  DoctorsPerformanceParams,
  CustomReportParams,
} from '@/types'

export function useDailyReport(date: string) {
  return useQuery<DailyReport>({
    queryKey: ['reports', 'daily', date],
    queryFn: () => reportsApi.getDaily(date),
    enabled: !!date,
    staleTime: 1000 * 60 * 5, // 5 دقائق
    retry: 1,
  })
}

export function useWeeklyReport(weekStart: string) {
  return useQuery<WeeklyReport>({
    queryKey: ['reports', 'weekly', weekStart],
    queryFn: () => reportsApi.getWeekly(weekStart),
    enabled: !!weekStart,
    staleTime: 1000 * 60 * 5,
    retry: 1,
  })
}

export function useMonthlyReport(month: string) {
  return useQuery<MonthlyReport>({
    queryKey: ['reports', 'monthly', month],
    queryFn: () => reportsApi.getMonthly(month),
    enabled: !!month,
    staleTime: 1000 * 60 * 5,
    retry: 1,
  })
}

export function useDoctorsPerformance(params?: DoctorsPerformanceParams) {
  return useQuery<DoctorsPerformanceReport>({
    queryKey: ['reports', 'doctors-performance', params],
    queryFn: () => reportsApi.getDoctorsPerformance(params),
    staleTime: 1000 * 60 * 5,
    retry: 1,
  })
}

export function useCustomReport(params: CustomReportParams) {
  return useQuery<CustomReport>({
    queryKey: ['reports', 'custom', params],
    queryFn: () => reportsApi.getCustom(params),
    enabled: !!params.startDate && !!params.endDate,
    staleTime: 1000 * 60 * 5,
    retry: 1,
  })
}






