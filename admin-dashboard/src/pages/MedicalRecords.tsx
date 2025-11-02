import { useState, useMemo } from 'react'
import toast from 'react-hot-toast'
import AdminLayout from '@/components/layout/AdminLayout'
import Breadcrumbs from '@/components/layout/Breadcrumbs'
import MedicalRecordsTable from '@/components/medical-records/MedicalRecordsTable'
import MedicalRecordFilters from '@/components/medical-records/MedicalRecordFilters'
import MedicalRecordDetails from '@/components/medical-records/MedicalRecordDetails'
import VitalSignsChart from '@/components/medical-records/VitalSignsChart'
import { useMedicalRecords } from '@/hooks/useMedicalRecords'
import { useUsers } from '@/hooks/useUsers'
import type {
  MedicalRecordsFilters,
  MedicalRecordQueryParams,
  MedicalRecord,
} from '@/types'
import { UserRole } from '@/types'

export default function MedicalRecordsPage() {
  const [filters, setFilters] = useState<MedicalRecordsFilters>({})
  const [page, setPage] = useState(1)
  const [sortBy, setSortBy] = useState<string>('createdAt')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  const [selectedRecord, setSelectedRecord] = useState<MedicalRecord | null>(null)
  const [isDetailsOpen, setIsDetailsOpen] = useState(false)

  // Prepare query params
  const queryParams = useMemo<MedicalRecordQueryParams>(() => {
    const params: any = {
      page,
      limit: 10,
      sortBy,
      sortOrder,
    }

    if (filters.patientId) {
      params.patientId = filters.patientId
    }
    if (filters.doctorId) {
      params.doctorId = filters.doctorId
    }
    if (filters.dateFrom) {
      params.dateFrom = filters.dateFrom
    }
    if (filters.dateTo) {
      params.dateTo = filters.dateTo
    }

    return params
  }, [page, sortBy, sortOrder, filters])

  // Fetch medical records
  const { data: recordsData, isLoading, error } = useMedicalRecords(queryParams)

  // Fetch patients and doctors for filters
  const { data: patientsData } = useUsers({ role: UserRole.PATIENT })
  const { data: doctorsData } = useUsers({ role: UserRole.DOCTOR })

  // Prepare filter options
  const patients = useMemo(() => {
    return patientsData?.data?.map((user) => ({ id: user.id, name: user.name })) || []
  }, [patientsData])

  const doctors = useMemo(() => {
    return doctorsData?.data?.map((user) => ({ id: user.id, name: user.name })) || []
  }, [doctorsData])

  // Handlers
  const handleView = (record: MedicalRecord) => {
    setSelectedRecord(record)
    setIsDetailsOpen(true)
  }

  const handleCloseDetails = () => {
    setIsDetailsOpen(false)
    setSelectedRecord(null)
  }

  const handleViewAudit = async (recordId: string) => {
    try {
      // For now, just show a toast. In future, could open audit modal
      toast.success('عرض سجل التدقيق (قريباً)')
    } catch (error) {
      toast.error('فشل تحميل سجل التدقيق')
    }
  }

  const handleSort = (column: 'createdAt' | 'updatedAt' | 'patient' | 'doctor') => {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      setSortBy(column)
      setSortOrder('desc')
    }
  }

  const handleFiltersReset = () => {
    setFilters({})
    setPage(1)
  }

  if (error) {
    return (
      <AdminLayout>
        <Breadcrumbs />
        <div className="p-6">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <p className="text-red-600">حدث خطأ في تحميل السجلات الطبية</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              إعادة المحاولة
            </button>
          </div>
        </div>
      </AdminLayout>
    )
  }

  const records = recordsData?.data || []
  const pagination = recordsData?.meta

  return (
    <AdminLayout>
      <Breadcrumbs />

      <div className="p-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">السجلات الطبية</h1>
          <p className="text-gray-600 mt-1">عرض وإدارة جميع السجلات الطبية في النظام</p>
        </div>

        {/* Filters */}
        <MedicalRecordFilters
          filters={filters}
          onFiltersChange={setFilters}
          onReset={handleFiltersReset}
          patients={patients}
          doctors={doctors}
        />

        {/* Table */}
        <MedicalRecordsTable
          records={records}
          isLoading={isLoading}
          onView={handleView}
          pagination={
            pagination
              ? {
                  page: pagination.page,
                  totalPages: pagination.totalPages,
                  total: pagination.total,
                }
              : undefined
          }
          onPageChange={setPage}
          sortBy={sortBy as any}
          sortOrder={sortOrder}
          onSort={handleSort}
        />

        {/* Details Modal */}
        {isDetailsOpen && selectedRecord && (
          <MedicalRecordDetails
            record={selectedRecord}
            isOpen={isDetailsOpen}
            onClose={handleCloseDetails}
            onViewAudit={handleViewAudit}
          />
        )}

        {/* Vital Signs Chart for selected patient */}
        {selectedRecord && records.length > 0 && (
          <div className="mt-6">
            <VitalSignsChart
              records={records.filter((r) => r.patientId === selectedRecord.patientId)}
            />
          </div>
        )}
      </div>
    </AdminLayout>
  )
}

