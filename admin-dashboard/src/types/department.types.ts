export interface Department {
  id: string
  name: string
  description?: string
  logoPath?: string
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface CreateDepartmentRequest {
  name: string
  description?: string
  logo?: File
}

export interface UpdateDepartmentRequest {
  name?: string
  description?: string
  logo?: File
  isActive?: boolean
}










