export enum UserRole {
  ADMIN = 'ADMIN',
  DOCTOR = 'DOCTOR',
  PATIENT = 'PATIENT',
}

export enum UserStatus {
  ACTIVE = 'ACTIVE',
  DISABLED = 'DISABLED',
  PENDING_DELETE = 'PENDING_DELETE',
}

export interface User {
  id: string
  name: string
  email: string
  phone: string
  role: UserRole
  status: UserStatus
  metadata?: Record<string, any>
  createdAt: string
  updatedAt: string
}

export interface CreateUserRequest {
  name: string
  email: string
  phone: string
  password: string
  role: UserRole
}

export interface UpdateUserRequest {
  name?: string
  email?: string
  phone?: string
  role?: UserRole
  status?: UserStatus
}

export interface UpdateUserRoleRequest {
  role: UserRole
}

export interface UpdateUserStatusRequest {
  status: UserStatus
}

export interface UserFilters {
  role?: UserRole | 'ALL'
  status?: UserStatus | 'ALL'
  search?: string
}

export interface UsersQueryParams {
  page?: number
  limit?: number
  sortBy?: 'name' | 'email' | 'createdAt' | 'updatedAt'
  sortOrder?: 'asc' | 'desc'
  role?: UserRole
  status?: UserStatus
  search?: string
}

export interface UsersResponse {
  data: User[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

// Component Props Types
export interface UsersTableProps {
  users: User[]
  isLoading?: boolean
  onEdit?: (user: User) => void
  onDelete?: (user: User) => void
  onHardDelete?: (user: User) => void
  onStatusChange?: (user: User, status: UserStatus) => void
  onRoleChange?: (user: User, role: UserRole) => void
}

export interface UserRowProps {
  user: User
  onEdit?: (user: User) => void
  onDelete?: (user: User) => void
  onHardDelete?: (user: User) => void
  onStatusChange?: (user: User, status: UserStatus) => void
  onRoleChange?: (user: User, role: UserRole) => void
}

export interface CreateUserModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: CreateUserRequest) => Promise<void>
}

export interface EditUserModalProps {
  isOpen: boolean
  onClose: () => void
  user: User
  onSubmit: (data: UpdateUserRequest) => Promise<void>
}

export interface UserFiltersProps {
  filters: UserFilters
  onFiltersChange: (filters: UserFilters) => void
  onReset: () => void
}

