import apiClient from './client'
import type {
  OverviewMetrics,
  AppointmentsMetricsResponse,
  RevenueMetricsResponse,
  TimeSeriesPoint,
} from '../types'

export interface MetricsAppointmentsParams {
  range?: '7d' | '30d' | '90d'
  groupBy?: 'day' | 'week' | 'month'
}

export interface MetricsRevenueParams {
  range?: '7d' | '30d' | '90d'
}

// Helper functions for data transformation

/**
 * تحويل range (7d|30d|90d) إلى period للباك إند
 */
const mapRangeToPeriod = (range?: '7d' | '30d' | '90d'): string => {
  switch (range) {
    case '7d':
      return 'day'
    case '30d':
      return 'day'
    case '90d':
      return 'month'
    default:
      return 'month'
  }
}

/**
 * تحويل تنسيق الباك إند للـ overview إلى تنسيق الفرونت إند
 */
const transformOverviewResponse = (data: any): OverviewMetrics => {
  // totalUsers = totalPatients + totalDoctors (الباك إند لا يعيد Admins منفصلين)
  const totalUsers =
    (data.users?.totalPatients || 0) + (data.users?.totalDoctors || 0)

  return {
    totalUsers,
    totalDoctors: data.users?.totalDoctors || 0,
    totalAppointments: data.overview?.totalAppointments || 0,
    totalRevenue: data.revenue?.totalRevenue || 0,
    // deltas سيتم إضافتها لاحقاً عند توفر مقارنة الفترات
    deltas: undefined,
  }
}

/**
 * تحويل dailyBreakdown من الباك إند إلى TimeSeriesPoint[]
 */
const transformDailyBreakdown = (
  breakdown: Array<{ _id: string; count?: number; totalAmount?: number }>,
  useAmount = false
): TimeSeriesPoint[] => {
  return breakdown.map((item) => ({
    date: item._id, // _id هو التاريخ بصيغة YYYY-MM-DD
    value: useAmount ? item.totalAmount || 0 : item.count || 0,
  }))
}

export const metricsApi = {
  // نظرة عامة
  getOverview: async (): Promise<OverviewMetrics> => {
    const response = await apiClient.get('/admin/metrics/overview')
    return transformOverviewResponse(response.data)
  },

  // إحصائيات المواعيد
  getAppointments: async (
    params?: MetricsAppointmentsParams
  ): Promise<AppointmentsMetricsResponse> => {
    // تحويل range إلى period للباك إند
    const backendParams: any = {
      period: mapRangeToPeriod(params?.range),
    }

    // إذا كان range هو 7d أو 30d، استخدم groupBy = day
    // إذا كان 90d، استخدم groupBy = week
    const groupBy =
      params?.range === '90d' ? 'week' : params?.groupBy || 'day'

    const response = await apiClient.get('/admin/metrics/appointments', {
      params: backendParams,
    })

    const data = response.data

    // تحويل dailyBreakdown إلى series
    const series = transformDailyBreakdown(
      data.dailyBreakdown || [],
      false // استخدام count وليس amount
    )

    return {
      range: params?.range || '30d',
      groupBy,
      series,
    }
  },

  // إحصائيات الأطباء (محافظ على التوافق)
  getDoctors: async (params?: { startDate?: string; endDate?: string }) => {
    const response = await apiClient.get('/admin/metrics/doctors', { params })
    return response.data
  },

  // إحصائيات المرضى (محافظ على التوافق)
  getPatients: async (params?: { startDate?: string; endDate?: string }) => {
    const response = await apiClient.get('/admin/metrics/patients', { params })
    return response.data
  },

  // إحصائيات الإيرادات
  getRevenue: async (
    params?: MetricsRevenueParams
  ): Promise<RevenueMetricsResponse> => {
    // تحويل range إلى period للباك إند
    const backendParams: any = {
      period: mapRangeToPeriod(params?.range),
    }

    const response = await apiClient.get('/admin/metrics/revenue', {
      params: backendParams,
    })

    const data = response.data

    // تحويل dailyRevenue إلى series
    const series = transformDailyBreakdown(
      data.dailyRevenue || [],
      true // استخدام totalAmount
    )

    // تحويل monthlyTrend إلى comparison إذا كان متوفراً
    const comparison: TimeSeriesPoint[] | undefined =
      data.monthlyTrend && Array.isArray(data.monthlyTrend)
        ? data.monthlyTrend.map((item: any) => ({
            date: item._id || item.date,
            value: item.totalAmount || item.value || 0,
          }))
        : undefined

    return {
      range: params?.range || '30d',
      currency: 'SAR', // يمكن جلبها من الباك إند لاحقاً
      series,
      comparison,
    }
  },
}

