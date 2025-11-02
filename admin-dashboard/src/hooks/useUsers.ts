import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { usersApi } from '../api/users'
import type {
  UsersQueryParams,
  CreateUserRequest,
  UpdateUserRequest,
  UserRole,
  UserStatus,
} from '../types/user.types'

// جلب قائمة المستخدمين
export const useUsers = (params?: UsersQueryParams) => {
  return useQuery({
    queryKey: ['users', params],
    queryFn: () => usersApi.getAll(params),
    staleTime: 1000 * 60 * 5, // 5 دقائق
  })
}

// جلب مستخدم واحد
export const useUser = (id: string) => {
  return useQuery({
    queryKey: ['users', id],
    queryFn: () => usersApi.getById(id),
    enabled: !!id,
  })
}

// إضافة مستخدم جديد
export const useCreateUser = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: usersApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] })
    },
  })
}

// تحديث مستخدم
export const useUpdateUser = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateUserRequest }) =>
      usersApi.update(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['users'] })
      queryClient.invalidateQueries({ queryKey: ['users', variables.id] })
    },
  })
}

// تحديث دور المستخدم
export const useUpdateUserRole = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, role }: { id: string; role: UserRole }) =>
      usersApi.updateRole(id, role),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] })
    },
  })
}

// تحديث حالة المستخدم
export const useUpdateUserStatus = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: UserStatus }) =>
      usersApi.updateStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] })
    },
  })
}

// حذف مستخدم (وضع علامة للحذف)
export const useDeleteUser = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: usersApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] })
    },
  })
}

// حذف نهائي للمستخدم (Hard Delete)
export const useHardDeleteUser = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ 
      id, 
      payload 
    }: { 
      id: string; 
      payload?: { reason?: string; purgeRelated?: boolean; anonymize?: boolean } 
    }) => usersApi.deleteHard(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard', 'stats'] })
    },
  })
}

