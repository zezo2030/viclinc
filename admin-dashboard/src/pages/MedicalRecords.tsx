import { useState, useMemo } from 'react'
import { FileText, Users, Stethoscope, Calendar } from 'lucide-react'
import toast from 'react-hot-toast'
import AdminLayout from '@/components/layout/AdminLayout'
import Breadcrumbs from '@/components/layout/Breadcrumbs'
import MedicalRecordsTable from '@/components/medical-records/MedicalRecordsTable'
import MedicalRecordFilters from '@/components/medical-records/MedicalRecordFilters'
import MedicalRecordDetails from '@/components/medical-records/MedicalRecordDetails'
import VitalSignsChart from '@/components/medical-records/VitalSignsChart'
import MetricCard from '@/components/dashboard/MetricCard'
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
          <div className="rounded-2xl bg-white border border-red-200 p-8 text-center shadow-lg">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-200 mb-4">
              <svg className="w-8 h-8 text-[#D62828]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p className="text-xl font-bold text-[#213F6A] mb-2">حدث خطأ في تحميل السجلات الطبية</p>
            <p className="text-sm text-[#333333] mb-4">حدث خطأ أثناء تحميل البيانات</p>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-3 bg-[#D62828] text-white rounded-xl font-semibold hover:bg-[#b91c1c] hover:scale-105 transition-all duration-300 shadow-lg shadow-[#D62828]/30"
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

  // Calculate metrics
  const metrics = useMemo(() => {
    const totalRecords = pagination?.total || 0
    const uniquePatients = new Set(records.map((r) => r.patientId)).size
    const uniqueDoctors = new Set(records.map((r) => r.doctorId)).size
    const recordsWithAttachments = records.filter((r) => r.attachments && r.attachments.length > 0).length

    return {
      totalRecords,
      uniquePatients,
      uniqueDoctors,
      recordsWithAttachments,
    }
  }, [records, pagination])

  return (
    <AdminLayout>
      <Breadcrumbs />

      {/* Welcome Header with Gradient */}
      <div className="mb-8 relative overflow-hidden rounded-2xl bg-[#D62828] p-8 shadow-2xl">
        <div className="relative z-10">
          <h1 className="text-4xl font-black text-white drop-shadow-lg">
            السجلات الطبية
          </h1>
          <p className="mt-2 text-lg font-medium text-white/90">
            عرض وإدارة جميع السجلات الطبية والتشخيصات في النظام
          </p>
          <div className="mt-4 flex items-center gap-4 text-white/90">
            <span className="flex items-center gap-2 bg-white/20 px-3 py-1.5 rounded-lg backdrop-blur-sm">
              <span className="text-2xl font-bold">{pagination?.total || 0}</span>
              <span className="text-sm">سجل طبي</span>
            </span>
          </div>
        </div>
        {/* Decorative Elements */}
        <div className="absolute top-0 left-0 w-64 h-64 bg-white/10 rounded-full -translate-x-32 -translate-y-32 blur-3xl"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-white/10 rounded-full translate-x-32 translate-y-32 blur-3xl"></div>
      </div>

      {/* Metrics Overview */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="h-1 w-1 rounded-full bg-[#D62828]"></div>
          <h2 className="text-xl font-bold text-[#213F6A]">المؤشرات الرئيسية</h2>
          <div className="h-0.5 flex-1 bg-[#D62828] opacity-20"></div>
        </div>
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4">
          <MetricCard
            title="إجمالي السجلات"
            value={metrics.totalRecords}
            icon={<FileText className="h-6 w-6" />}
            variant="primary"
          />
          <MetricCard
            title="المرضى المميزون"
            value={metrics.uniquePatients}
            icon={<Users className="h-6 w-6" />}
            variant="success"
          />
          <MetricCard
            title="الأطباء المميزون"
            value={metrics.uniqueDoctors}
            icon={<Stethoscope className="h-6 w-6" />}
            variant="warning"
          />
          <MetricCard
            title="سجلات بمرفقات"
            value={metrics.recordsWithAttachments}
            icon={<Calendar className="h-6 w-6" />}
            variant="neutral"
          />
        </div>
      </div>

      {/* Filters */}
      <div className="mb-8">
        <MedicalRecordFilters
          filters={filters}
          onFiltersChange={setFilters}
          onReset={handleFiltersReset}
          patients={patients}
          doctors={doctors}
        />
      </div>

      {/* Table */}
      <div className="mb-8">
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-lg">
          <div className="mb-6 flex items-center gap-3">
            <div className="h-1 w-1 rounded-full bg-[#D62828]"></div>
            <h3 className="text-xl font-bold text-[#213F6A]">قائمة السجلات الطبية</h3>
            <div className="h-1 flex-1 rounded-full bg-[#D62828] opacity-20"></div>
          </div>
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
        </div>
      </div>

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
        <div className="mb-8">
          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-lg">
            <div className="mb-6 flex items-center gap-3">
              <div className="h-1 w-1 rounded-full bg-[#D62828]"></div>
              <h3 className="text-xl font-bold text-[#213F6A]">مخطط العلامات الحيوية</h3>
              <div className="h-1 flex-1 rounded-full bg-[#D62828] opacity-20"></div>
            </div>
            <VitalSignsChart
              records={records.filter((r) => r.patientId === selectedRecord.patientId)}
            />
          </div>
        </div>
      )}
    </AdminLayout>
  )
}

