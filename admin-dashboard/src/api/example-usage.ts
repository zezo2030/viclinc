/**
 * Example Usage of API Layer
 * 
 * This file demonstrates how to use the API services
 * DO NOT import this file in production code
 */

import { authApi, usersApi, doctorsApi, departmentsApi, appointmentsApi } from '@/api'
import type { SearchParams, User, DoctorProfile } from '@/types'

// ============================================
// Authentication Examples
// ============================================

export const exampleLogin = async () => {
  try {
    const { access_token, user } = await authApi.login({
      email: 'admin@example.com',
      password: 'password123',
    })
    
    localStorage.setItem('access_token', access_token)
    localStorage.setItem('user', JSON.stringify(user))
    
    console.log('✅ Logged in:', user.name)
    return user
  } catch (error) {
    console.error('❌ Login failed:', error)
    throw error
  }
}

export const exampleLogout = async () => {
  await authApi.logout()
  console.log('✅ Logged out')
}

// ============================================
// Users Management Examples
// ============================================

export const exampleFetchUsers = async () => {
  try {
    const params: SearchParams = {
      page: 1,
      limit: 10,
      search: 'john',
      sort: 'createdAt',
      order: 'desc',
    }
    
    const response = await usersApi.getAll(params)
    
    console.log(`✅ Fetched ${response.data.length} users`)
    console.log(`   Total: ${response.meta.total}`)
    console.log(`   Page: ${response.meta.page}/${response.meta.totalPages}`)
    
    return response.data
  } catch (error) {
    console.error('❌ Failed to fetch users:', error)
    throw error
  }
}

export const exampleCreateUser = async () => {
  try {
    const newUser = await usersApi.create({
      name: 'John Doe',
      email: 'john@example.com',
      phone: '+966501234567',
      password: 'securePassword123',
      role: 'PATIENT' as any,
    })
    
    console.log('✅ Created user:', newUser.name)
    return newUser
  } catch (error) {
    console.error('❌ Failed to create user:', error)
    throw error
  }
}

export const exampleUpdateUserRole = async (userId: string) => {
  try {
    const updatedUser = await usersApi.updateRole(userId, {
      role: 'DOCTOR' as any,
    })
    
    console.log('✅ Updated user role:', updatedUser.role)
    return updatedUser
  } catch (error) {
    console.error('❌ Failed to update user role:', error)
    throw error
  }
}

// ============================================
// Doctors Management Examples
// ============================================

export const exampleFetchDoctors = async () => {
  try {
    const response = await doctorsApi.getAll({
      page: 1,
      limit: 20,
      sort: 'createdAt',
      order: 'desc',
    })
    
    console.log(`✅ Fetched ${response.data.length} doctors`)
    return response.data
  } catch (error) {
    console.error('❌ Failed to fetch doctors:', error)
    throw error
  }
}

export const exampleCreateDoctor = async () => {
  try {
    const newDoctor = await doctorsApi.create({
      name: 'Dr. Ahmed Ali',
      email: 'ahmed@example.com',
      phone: '+966501234567',
      password: 'securePassword123',
      licenseNumber: 'MD-12345',
      yearsOfExperience: 10,
      departmentId: 'dept-uuid-here',
      bio: 'Experienced cardiologist',
    })
    
    console.log('✅ Created doctor:', newDoctor.name)
    return newDoctor
  } catch (error) {
    console.error('❌ Failed to create doctor:', error)
    throw error
  }
}

export const exampleGetDoctorSchedule = async (doctorId: string) => {
  try {
    const schedule = await doctorsApi.getSchedule(doctorId)
    console.log('✅ Doctor schedule:', schedule)
    return schedule
  } catch (error) {
    console.error('❌ Failed to get doctor schedule:', error)
    throw error
  }
}

// ============================================
// Departments with File Upload Example
// ============================================

export const exampleCreateDepartment = async (logoFile: File) => {
  try {
    const newDept = await departmentsApi.create({
      name: 'Cardiology',
      description: 'Heart and cardiovascular specialists',
      logo: logoFile,
    })
    
    console.log('✅ Created department:', newDept.name)
    console.log('   Logo path:', newDept.logoPath)
    return newDept
  } catch (error) {
    console.error('❌ Failed to create department:', error)
    throw error
  }
}

export const exampleUpdateDepartment = async (deptId: string, logoFile?: File) => {
  try {
    const updated = await departmentsApi.update(deptId, {
      name: 'Updated Name',
      isActive: true,
      logo: logoFile,
    })
    
    console.log('✅ Updated department:', updated.name)
    return updated
  } catch (error) {
    console.error('❌ Failed to update department:', error)
    throw error
  }
}

// ============================================
// Appointments Examples
// ============================================

export const exampleFetchAppointments = async () => {
  try {
    const response = await appointmentsApi.getAll({
      status: 'CONFIRMED' as any,
      type: 'VIDEO' as any,
      startDate: '2024-01-01',
      endDate: '2024-12-31',
      page: 1,
      limit: 10,
    })
    
    console.log(`✅ Fetched ${response.data.length} appointments`)
    return response.data
  } catch (error) {
    console.error('❌ Failed to fetch appointments:', error)
    throw error
  }
}

export const exampleUpdateAppointmentStatus = async (appointmentId: string) => {
  try {
    const updated = await appointmentsApi.updateStatus(appointmentId, {
      status: 'COMPLETED',
      reason: 'Appointment completed successfully',
    })
    
    console.log('✅ Updated appointment status')
    return updated
  } catch (error) {
    console.error('❌ Failed to update appointment:', error)
    throw error
  }
}

// ============================================
// Error Handling Example
// ============================================

export const exampleWithErrorHandling = async () => {
  try {
    const user = await usersApi.getById('non-existent-id')
    return user
  } catch (error: any) {
    if (error.response) {
      // Server responded with error
      const status = error.response.status
      const message = error.response.data?.message
      
      switch (status) {
        case 404:
          console.error('❌ User not found')
          break
        case 403:
          console.error('❌ No permission to access')
          break
        case 401:
          console.error('❌ Unauthorized - redirecting to login')
          // Will auto-redirect by interceptor
          break
        default:
          console.error(`❌ Error ${status}: ${message}`)
      }
    } else if (error.request) {
      // Network error
      console.error('❌ Network error - cannot reach server')
    } else {
      // Other error
      console.error('❌ Error:', error.message)
    }
    
    throw error
  }
}

// ============================================
// React Component Usage Example
// ============================================

/*
// In a React component:

import { useEffect, useState } from 'react'
import { usersApi } from '@/api'
import type { User, PaginatedResponse } from '@/types'

export const UsersListComponent = () => {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true)
        const response = await usersApi.getAll({ page: 1, limit: 10 })
        setUsers(response.data)
      } catch (err) {
        setError('Failed to load users')
      } finally {
        setLoading(false)
      }
    }

    fetchUsers()
  }, [])

  if (loading) return <div>Loading...</div>
  if (error) return <div>Error: {error}</div>

  return (
    <div>
      <h1>Users</h1>
      <ul>
        {users.map(user => (
          <li key={user.id}>{user.name} - {user.email}</li>
        ))}
      </ul>
    </div>
  )
}
*/

// ============================================
// React Query Usage Example
// ============================================

/*
// Using with TanStack Query (React Query):

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { usersApi } from '@/api'

// Fetch users
export const useUsers = (params: SearchParams) => {
  return useQuery({
    queryKey: ['users', params],
    queryFn: () => usersApi.getAll(params),
  })
}

// Create user mutation
export const useCreateUser = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: usersApi.create,
    onSuccess: () => {
      // Invalidate and refetch users
      queryClient.invalidateQueries({ queryKey: ['users'] })
    },
  })
}

// In component:
const UsersComponent = () => {
  const { data, isLoading, error } = useUsers({ page: 1, limit: 10 })
  const createUser = useCreateUser()

  const handleCreate = () => {
    createUser.mutate({
      name: 'New User',
      email: 'new@example.com',
      // ...
    })
  }

  if (isLoading) return <div>Loading...</div>
  if (error) return <div>Error loading users</div>

  return (
    <div>
      <button onClick={handleCreate}>Create User</button>
      <ul>
        {data?.data.map(user => (
          <li key={user.id}>{user.name}</li>
        ))}
      </ul>
    </div>
  )
}
*/

console.log(`
✅ API Layer Examples Ready

Available functions:
- exampleLogin()
- exampleLogout()
- exampleFetchUsers()
- exampleCreateUser()
- exampleUpdateUserRole(userId)
- exampleFetchDoctors()
- exampleCreateDoctor()
- exampleGetDoctorSchedule(doctorId)
- exampleCreateDepartment(logoFile)
- exampleUpdateDepartment(deptId, logoFile?)
- exampleFetchAppointments()
- exampleUpdateAppointmentStatus(appointmentId)
- exampleWithErrorHandling()

For more info, see: src/api/README.md
`)



