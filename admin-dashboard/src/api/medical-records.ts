import apiClient from './client'
import type { PaginatedResponse } from '../types'
import type { MedicalRecord, MedicalRecordQueryParams } from '../types'

export const medicalRecordsApi = {
  // الحصول على جميع السجلات الطبية
  getAll: async (params?: MedicalRecordQueryParams): Promise<PaginatedResponse<MedicalRecord>> => {
    const response = await apiClient.get('/admin/records', { params })
    const raw = response.data

    // Helper to map one record
    const mapOne = (r: any): MedicalRecord => ({
      id: r._id || r.id,
      patientId: typeof r.patientId === 'object' ? (r.patientId._id || r.patientId.id) : r.patientId,
      doctorId: typeof r.doctorId === 'object' ? (r.doctorId._id || r.doctorId.id) : r.doctorId,
      appointmentId: r.appointmentId ? (typeof r.appointmentId === 'object' ? (r.appointmentId._id || r.appointmentId.id) : r.appointmentId) : undefined,
      version: r.version || 1,
      diagnosis: r.diagnosis,
      prescription: r.prescription,
      notes: r.notes,
      attachments: r.attachments,
      vitalSigns: r.vitalSigns,
      isActive: r.isActive !== false,
      createdAt: r.createdAt,
      updatedAt: r.updatedAt,
      // Populated fields
      patient: r.patient ? {
        id: r.patient._id || r.patient.id,
        name: r.patient.name,
        email: r.patient.email,
        phone: r.patient.phone,
      } : undefined,
      doctor: r.doctor ? {
        id: r.doctor._id || r.doctor.id,
        name: r.doctor.name,
        email: r.doctor.email,
        phone: r.doctor.phone,
      } : undefined,
      appointment: r.appointment ? {
        id: r.appointment._id || r.appointment.id,
        startAt: r.appointment.startAt,
        endAt: r.appointment.endAt,
        status: r.appointment.status,
      } : undefined,
    })

    // Handle array response (no pagination metadata)
    if (Array.isArray(raw)) {
      const mapped = raw.map(mapOne)
      const page = (params as any)?.page || 1
      const limit = (params as any)?.limit || mapped.length
      const total = mapped.length
      return { 
        data: mapped, 
        meta: { 
          page, 
          limit, 
          total, 
          totalPages: Math.max(1, Math.ceil(total / limit)) 
        } 
      }
    }

    // Handle paginated response
    const arr = Array.isArray(raw?.data) ? raw.data : Array.isArray(raw?.records) ? raw.records : []
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

  // الحصول على سجل طبي واحد
  getById: async (id: string): Promise<MedicalRecord> => {
    const response = await apiClient.get(`/admin/records/${id}`)
    const r = response.data
    return {
      id: r._id || r.id,
      patientId: typeof r.patientId === 'object' ? (r.patientId._id || r.patientId.id) : r.patientId,
      doctorId: typeof r.doctorId === 'object' ? (r.doctorId._id || r.doctorId.id) : r.doctorId,
      appointmentId: r.appointmentId ? (typeof r.appointmentId === 'object' ? (r.appointmentId._id || r.appointmentId.id) : r.appointmentId) : undefined,
      version: r.version || 1,
      diagnosis: r.diagnosis,
      prescription: r.prescription,
      notes: r.notes,
      attachments: r.attachments,
      vitalSigns: r.vitalSigns,
      isActive: r.isActive !== false,
      createdAt: r.createdAt,
      updatedAt: r.updatedAt,
      patient: r.patient ? {
        id: r.patient._id || r.patient.id,
        name: r.patient.name,
        email: r.patient.email,
        phone: r.patient.phone,
      } : undefined,
      doctor: r.doctor ? {
        id: r.doctor._id || r.doctor.id,
        name: r.doctor.name,
        email: r.doctor.email,
        phone: r.doctor.phone,
      } : undefined,
      appointment: r.appointment ? {
        id: r.appointment._id || r.appointment.id,
        startAt: r.appointment.startAt,
        endAt: r.appointment.endAt,
        status: r.appointment.status,
      } : undefined,
    }
  },

  // الحصول على سجل التدقيق (النسخ والأحداث)
  getAudit: async (id: string): Promise<any> => {
    const response = await apiClient.get(`/admin/records/${id}/audit`)
    return response.data
  },
}

