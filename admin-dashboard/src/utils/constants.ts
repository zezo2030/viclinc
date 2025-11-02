export const APP_NAME = import.meta.env.VITE_APP_NAME || 'Admin Dashboard'
export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/v1'
export const SITE_URL = import.meta.env.VITE_SITE_URL || 'http://localhost:3002'

export const ROLES = {
  ADMIN: 'ADMIN',
  DOCTOR: 'DOCTOR',
  PATIENT: 'PATIENT',
} as const

export const USER_STATUS = {
  ACTIVE: 'ACTIVE',
  DISABLED: 'DISABLED',
  PENDING_DELETE: 'PENDING_DELETE',
} as const

export const ROUTES = {
  LOGIN: '/login',
  DASHBOARD: '/',
  USERS: '/users',
  DOCTORS: '/doctors',
  DEPARTMENTS: '/departments',
  APPOINTMENTS: '/appointments',
  PAYMENTS: '/payments',
  MEDICAL_RECORDS: '/medical-records',
  REPORTS: '/reports',
  AUDIT: '/audit',
  SETTINGS: '/settings',
} as const



