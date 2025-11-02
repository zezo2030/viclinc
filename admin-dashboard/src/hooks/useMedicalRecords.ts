import { useQuery, useQueryClient } from '@tanstack/react-query'
import { medicalRecordsApi } from '@/api/medical-records'
import type { MedicalRecordQueryParams, MedicalRecord } from '@/types'

export function useMedicalRecords(params?: MedicalRecordQueryParams) {
  return useQuery({
    queryKey: ['medical-records', params],
    queryFn: () => medicalRecordsApi.getAll(params),
  })
}

export function useMedicalRecord(id: string) {
  return useQuery<MedicalRecord>({
    queryKey: ['medical-records', id],
    queryFn: () => medicalRecordsApi.getById(id),
    enabled: !!id,
  })
}

export function useMedicalRecordAudit(id: string) {
  return useQuery({
    queryKey: ['medical-records', id, 'audit'],
    queryFn: () => medicalRecordsApi.getAudit(id),
    enabled: !!id,
  })
}

