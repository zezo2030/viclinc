export enum DoctorStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  SUSPENDED = 'SUSPENDED',
}

export interface DoctorProfile {
  id: string
  userId: string
  name: string
  email?: string
  phone?: string
  licenseNumber: string
  yearsOfExperience: number
  departmentId: string
  photos: string[]
  bio?: string
  status: DoctorStatus
  createdAt: string
  updatedAt: string
}

export interface CreateDoctorRequest {
  name: string
  email: string
  phone: string
  password: string
  licenseNumber: string
  yearsOfExperience: number
  departmentId: string
  bio?: string
}

export interface UpdateDoctorRequest {
  name?: string
  licenseNumber?: string
  yearsOfExperience?: number
  departmentId?: string
  bio?: string
}

export interface UpdateDoctorStatusRequest {
  status: DoctorStatus
}

// الإدخال الفعلي المطلوب من Backend لإنشاء طبيب بواسطة الأدمن
export interface AdminCreateDoctorRequest {
  userId: string
  name: string
  licenseNumber: string
  yearsOfExperience: number
  departmentId: string
  bio?: string
}


