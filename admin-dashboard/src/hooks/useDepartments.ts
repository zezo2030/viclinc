import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { departmentsApi } from '@/api/departments'

export function useDepartments() {
  return useQuery({
    queryKey: ['departments'],
    queryFn: () => departmentsApi.getAll(),
    staleTime: 1000 * 60 * 5,
  })
}

export function useCreateDepartment() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: departmentsApi.create,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['departments'] })
    },
  })
}

export function useUpdateDepartment() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => departmentsApi.update(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['departments'] })
    },
  })
}

export function useDeleteDepartment() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => departmentsApi.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['departments'] })
    },
  })
}


