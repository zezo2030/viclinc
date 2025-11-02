// Medical Records Types

export interface VitalSigns {
  bloodPressure?: string // "120/80" format
  temperature?: number
  heartRate?: number
  weight?: number // in kg
  height?: number // in cm
}

export interface Attachment {
  type: string
  url: string
  name: string
  size?: number // in bytes
}

export interface PrescriptionItem {
  medication: string
  dosage: string
  duration: string
  instructions?: string
}

export interface MedicalRecord {
  id: string
  patientId: string
  doctorId: string
  appointmentId?: string
  version: number
  diagnosis: string
  prescription?: PrescriptionItem[]
  notes?: string
  attachments?: Attachment[]
  vitalSigns?: VitalSigns
  isActive: boolean
  createdAt: string
  updatedAt: string
  // Populated fields
  patient?: {
    id: string
    name: string
    email?: string
    phone?: string
  }
  doctor?: {
    id: string
    name: string
    email?: string
    phone?: string
  }
  appointment?: {
    id: string
    startAt: string
    endAt: string
    status?: string
  }
}

export interface MedicalRecordQueryParams {
  patientId?: string
  doctorId?: string
  dateFrom?: string
  dateTo?: string
  page?: number
  limit?: number
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

export interface MedicalRecordsFilters {
  patientId?: string
  doctorId?: string
  dateFrom?: string
  dateTo?: string
}

// Form data types (for future use if create/edit is added)
export interface CreateMedicalRecordRequest {
  patientId: string
  appointmentId?: string
  diagnosis: string
  prescription?: PrescriptionItem[]
  notes?: string
  attachments?: Attachment[]
  vitalSigns?: VitalSigns
}

export interface UpdateMedicalRecordRequest {
  diagnosis?: string
  prescription?: PrescriptionItem[]
  notes?: string
  attachments?: Attachment[]
  vitalSigns?: VitalSigns
}

// Props for components
export interface MedicalRecordsTableProps {
  records: MedicalRecord[]
  isLoading: boolean
  onView?: (record: MedicalRecord) => void
  pagination?: {
    page: number
    totalPages: number
    total: number
  }
  onPageChange?: (page: number) => void
  sortBy?: 'createdAt' | 'updatedAt' | 'patient' | 'doctor'
  sortOrder?: 'asc' | 'desc'
  onSort?: (column: 'createdAt' | 'updatedAt' | 'patient' | 'doctor') => void
}

export interface MedicalRecordFiltersProps {
  filters: MedicalRecordsFilters
  onFiltersChange: (filters: MedicalRecordsFilters) => void
  onReset: () => void
  patients?: Array<{ id: string; name: string }>
  doctors?: Array<{ id: string; name: string }>
}

export interface MedicalRecordDetailsProps {
  record: MedicalRecord | null
  isOpen: boolean
  onClose: () => void
  onViewAudit?: (recordId: string) => void
}

export interface VitalSignsChartProps {
  records: MedicalRecord[]
  selectedSign?: 'bloodPressure' | 'temperature' | 'heartRate' | 'weight'
}

