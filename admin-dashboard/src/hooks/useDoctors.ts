import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { doctorsApi } from '@/api/doctors'
import type { SearchParams } from '@/types'
import type { DoctorProfile, DoctorStatus } from '@/types/doctor.types'

const DOCTORS_KEY = ['doctors'] as const

export function useDoctors(params?: SearchParams) {
  return useQuery({
    queryKey: [DOCTORS_KEY, params],
    queryFn: () => doctorsApi.getAll(params),
  })
}

export function useCreateDoctor() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: doctorsApi.create,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: DOCTORS_KEY })
    },
  })
}

export function useUpdateDoctor() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<DoctorProfile> }) =>
      doctorsApi.update(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: DOCTORS_KEY })
    },
  })
}

export function useUpdateDoctorStatus() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: DoctorStatus }) =>
      doctorsApi.updateStatus(id, { status }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: DOCTORS_KEY })
    },
  })
}


