import apiClient from './client'
import type { PaginatedResponse } from '../types'
import type { Appointment, AppointmentQueryParams } from '../types'

export const appointmentsApi = {
  // الحصول على جميع المواعيد
  getAll: async (
    params?: AppointmentQueryParams
  ): Promise<PaginatedResponse<Appointment>> => {
    const response = await apiClient.get('/admin/appointments', { params })
    const raw = response.data
    const mapOne = (a: any): Appointment => ({
      id: a._id || a.id,
      doctorId: a.doctorId || a.doctor?._id || a.doctor?.id,
      patientId: a.patientId || a.patient?._id || a.patient?.id,
      serviceId: a.serviceId || a.service?._id || a.service?.id,
      doctorName: a.doctor?.name,
      patientName: a.patient?.name,
      serviceName: a.service?.name,
      startAt: a.startAt,
      endAt: a.endAt,
      status: a.status,
      type: a.type,
      price: a.price,
      duration: a.duration,
      paymentStatus: a.paymentStatus,
      cancellationReason: a.cancellationReason,
      cancelledAt: a.cancelledAt,
      cancelledBy: a.cancelledBy,
      metadata: a.metadata,
      createdAt: a.createdAt,
      updatedAt: a.updatedAt,
    })
    if (Array.isArray(raw)) {
      const mapped = raw.map(mapOne)
      const page = (params as any)?.page || 1
      const limit = (params as any)?.limit || mapped.length
      const total = mapped.length
      return { data: mapped, meta: { page, limit, total, totalPages: Math.max(1, Math.ceil(total / limit)) } }
    }
    const arr = Array.isArray(raw?.data) ? raw.data : Array.isArray(raw?.appointments) ? raw.appointments : []
    if (arr.length) {
      const mapped = arr.map(mapOne)
      const page = raw?.meta?.page || raw?.pagination?.page || raw?.page || 1
      const limit = raw?.meta?.limit || raw?.pagination?.limit || raw?.limit || mapped.length
      const total = raw?.meta?.total || raw?.pagination?.total || raw?.total || mapped.length
      const totalPages = raw?.meta?.totalPages || raw?.pagination?.totalPages || raw?.totalPages || Math.max(1, Math.ceil(total / limit))
      return { data: mapped, meta: { page, limit, total, totalPages } }
    }
    return { data: [], meta: { page: 1, limit: 10, total: 0, totalPages: 0 } }
  },

  // الحصول على موعد واحد
  getById: async (id: string): Promise<Appointment> => {
    const response = await apiClient.get(`/admin/appointments/${id}`)
    const a = response.data
    return {
      id: a._id || a.id,
      doctorId: a.doctorId || a.doctor?._id || a.doctor?.id,
      patientId: a.patientId || a.patient?._id || a.patient?.id,
      serviceId: a.serviceId || a.service?._id || a.service?.id,
      doctorName: a.doctor?.name,
      patientName: a.patient?.name,
      serviceName: a.service?.name,
      startAt: a.startAt,
      endAt: a.endAt,
      status: a.status,
      type: a.type,
      price: a.price,
      duration: a.duration,
      paymentStatus: a.paymentStatus,
      cancellationReason: a.cancellationReason,
      cancelledAt: a.cancelledAt,
      cancelledBy: a.cancelledBy,
      metadata: a.metadata,
      createdAt: a.createdAt,
      updatedAt: a.updatedAt,
    }
  },

  // تحديث حالة الموعد
  updateStatus: async (id: string, data: { status: string; reason?: string }) => {
    const response = await apiClient.patch(`/admin/appointments/${id}/status`, data)
    return response.data
  },

  // حذف موعد (مسموح فقط للملغي في الباكيند)
  delete: async (id: string) => {
    const response = await apiClient.delete(`/admin/appointments/${id}`)
    return response.data
  },

  // الحصول على التعارضات
  getConflicts: async (params?: { doctorId: string; startAt: string; endAt: string }) => {
    const response = await apiClient.get('/admin/appointments/conflicts', { params })
    return response.data
  },
}

