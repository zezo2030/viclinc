import apiClient from './client'
import type { DoctorsPerformanceParams, CustomReportParams } from '@/types'

export const reportsApi = {
  // تقرير يومي
  getDaily: async (date: string) => {
    const response = await apiClient.get('/admin/reports/daily', {
      params: { date },
    })
    return response.data
  },

  // تقرير أسبوعي
  getWeekly: async (weekStart: string) => {
    const response = await apiClient.get('/admin/reports/weekly', {
      params: { weekStart },
    })
    return response.data
  },

  // تقرير شهري
  getMonthly: async (month: string) => {
    const response = await apiClient.get('/admin/reports/monthly', {
      params: { month },
    })
    return response.data
  },

  // تقرير أداء الأطباء
  getDoctorsPerformance: async (params?: DoctorsPerformanceParams) => {
    const response = await apiClient.get('/admin/reports/doctors-performance', {
      params,
    })
    return response.data
  },

  // تقرير مخصص
  getCustom: async (params: CustomReportParams) => {
    const response = await apiClient.post('/admin/reports/custom', params)
    return response.data
  },
}



