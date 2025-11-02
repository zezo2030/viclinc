import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { paymentsApi, type PaymentsQueryParams, type Payment } from '@/api/payments'

export function usePayments(params?: PaymentsQueryParams) {
  return useQuery({
    queryKey: ['payments', params],
    queryFn: () => paymentsApi.getAll(params),
  })
}

export function usePayment(id?: string) {
  return useQuery<Payment>({
    queryKey: ['payments', id],
    queryFn: () => paymentsApi.getById(id as string),
    enabled: !!id,
  })
}

export function useRefundPayment() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason?: string }) => paymentsApi.refund(id, reason),
    onSuccess: (_data, variables) => {
      qc.invalidateQueries({ queryKey: ['payments'] })
      if (variables?.id) {
        qc.invalidateQueries({ queryKey: ['payments', variables.id] })
      }
    },
  })
}


