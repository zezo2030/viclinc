import apiClient from './client'
import type { PaginatedResponse, SearchParams } from '../types'

export type PaymentStatus = 'PENDING' | 'COMPLETED' | 'FAILED' | 'REFUNDED'
export type PaymentMethod = 'CREDIT_CARD' | 'DEBIT_CARD' | 'BANK_TRANSFER' | 'DIGITAL_WALLET'

export interface Payment {
  id: string
  appointmentId: string
  amount: number
  currency: string
  status: PaymentStatus
  paymentMethod: PaymentMethod
  transactionId?: string
  intentId?: string
  paidAt?: string
  createdAt: string
  updatedAt: string
  patient?: { id: string; name: string }
  doctor?: { id: string; name: string }
  appointment?: { startAt?: string; status?: string }
}

export interface PaymentsQueryParams extends SearchParams {
  status?: PaymentStatus
  method?: PaymentMethod
  startDate?: string
  endDate?: string
}

export const paymentsApi = {
  // الحصول على جميع المدفوعات
  getAll: async (params?: PaymentsQueryParams): Promise<PaginatedResponse<Payment>> => {
    const response = await apiClient.get('/admin/payments', { params })
    const payload = response.data as { items: Payment[]; total: number; page: number; limit: number }
    const totalPages = Math.ceil((payload.total || 0) / (payload.limit || 1))
    return {
      data: payload.items || [],
      meta: {
        total: payload.total || 0,
        page: payload.page || 1,
        limit: payload.limit || 10,
        totalPages,
      },
    }
  },

  // الحصول على مدفوعة واحدة
  getById: async (id: string): Promise<Payment> => {
    const response = await apiClient.get(`/admin/payments/${id}`)
    return response.data
  },

  // استرداد مدفوعة
  refund: async (id: string, reason?: string): Promise<Payment> => {
    const response = await apiClient.post(`/admin/payments/${id}/refund`, { reason })
    return response.data
  },
}

