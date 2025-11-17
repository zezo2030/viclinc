export enum AppointmentStatus {
  PENDING_CONFIRM = 'PENDING_CONFIRM',
  CONFIRMED = 'CONFIRMED',
  CANCELLED = 'CANCELLED',
  COMPLETED = 'COMPLETED',
  NO_SHOW = 'NO_SHOW',
  REJECTED = 'REJECTED',
}

export enum AppointmentType {
  IN_PERSON = 'IN_PERSON',
  VIDEO = 'VIDEO',
  CHAT = 'CHAT',
}

export enum PaymentStatus {
  NONE = 'NONE',
  PENDING = 'PENDING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
}

export interface Appointment {
  id: string
  doctorId: string
  patientId: string
  serviceId: string
  // أسماء اختيارية للاستخدام في الواجهة (إذا أرسلها الـ API)
  doctorName?: string
  patientName?: string
  serviceName?: string
  startAt: string
  endAt: string
  status: AppointmentStatus
  type: AppointmentType
  price: number
  duration: number
  paymentStatus: PaymentStatus
  cancellationReason?: string
  cancelledAt?: string
  cancelledBy?: string
  metadata?: Record<string, any>
  createdAt: string
  updatedAt: string
}

export interface AppointmentQueryParams {
  status?: AppointmentStatus
  type?: AppointmentType
  doctorId?: string
  patientId?: string
  startDate?: string
  endDate?: string
  page?: number
  limit?: number
}










