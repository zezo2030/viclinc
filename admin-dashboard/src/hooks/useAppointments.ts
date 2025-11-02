import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { appointmentsApi } from '@/api/appointments'
import type { AppointmentQueryParams } from '@/types'

export function useAppointments(params?: AppointmentQueryParams) {
  return useQuery({
    queryKey: ['appointments', params],
    queryFn: () => appointmentsApi.getAll(params),
  })
}

export function useAppointment(id: string) {
  return useQuery({
    queryKey: ['appointments', id],
    queryFn: () => appointmentsApi.getById(id),
    enabled: !!id,
  })
}

export function useUpdateAppointmentStatus() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, status, reason }: { id: string; status: string; reason?: string }) =>
      appointmentsApi.updateStatus(id, { status, reason }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['appointments'] })
    },
  })
}

export function useCheckConflicts() {
  return useMutation({
    mutationFn: (params: { doctorId: string; startAt: string; endAt: string }) =>
      // backend exposes /admin/appointments/conflicts via getConflicts
      (appointmentsApi as any).getConflicts
        ? (appointmentsApi as any).getConflicts(params)
        : (appointmentsApi as any).checkConflicts(params),
  })
}


