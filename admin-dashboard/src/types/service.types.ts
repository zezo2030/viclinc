export interface Service {
  id: string
  name: string
  description?: string
  departmentId: string
  basePrice?: number
  baseDuration?: number
  defaultPrice?: number
  defaultDurationMin?: number
  isActive: boolean
  createdAt?: string
  updatedAt?: string
}

export interface CreateServiceRequest {
  name: string
  departmentId: string
  description?: string
  defaultPrice?: number
  defaultDurationMin?: number
  isActive?: boolean
}

export interface UpdateServiceRequest {
  name?: string
  description?: string
  departmentId?: string
  defaultPrice?: number
  defaultDurationMin?: number
  isActive?: boolean
}

export interface DepartmentDetails {
  _id: string
  id: string
  name: string
  description?: string
  logoPath?: string
  logoUrl?: string
  icon?: string
  isActive: boolean
  doctors?: any[]
  services?: Service[]
  createdAt?: string
  updatedAt?: string
}

