export interface Department {
  id: string
  name: string
  description?: string
  logoPath?: string
  isActive: boolean
  workingHours?: {
    startTime: string
    endTime: string
  }
  createdAt: string
  updatedAt: string
}

export interface CreateDepartmentRequest {
  name: string
  description?: string
  logo?: File
  workingHours?: {
    startTime: string
    endTime: string
  }
}

export interface UpdateDepartmentRequest {
  name?: string
  description?: string
  logo?: File
  isActive?: boolean
  workingHours?: {
    startTime: string
    endTime: string
  }
}










