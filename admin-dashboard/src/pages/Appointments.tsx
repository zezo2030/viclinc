import { useMemo, useState } from 'react'
import toast from 'react-hot-toast'
import AdminLayout from '@/components/layout/AdminLayout'
import Breadcrumbs from '@/components/layout/Breadcrumbs'
import AppointmentFilters from '@/components/appointments/AppointmentFilters'
import AppointmentsCalendar from '@/components/appointments/AppointmentsCalendar'
import AppointmentsTable from '@/components/appointments/AppointmentsTable'
import AppointmentDetails from '@/components/appointments/AppointmentDetails'
import { useAppointments, useUpdateAppointmentStatus } from '@/hooks/useAppointments'
import type { Appointment } from '@/types/appointment.types'

export default function AppointmentsPage() {
  const [filters, setFilters] = useState<any>({ status: 'ALL', type: 'ALL' })
  const [page, setPage] = useState(1)
  const [view, setView] = useState<'day' | 'week' | 'month'>('week')
  const [selected, setSelected] = useState<Appointment | null>(null)

  const params = useMemo(() => {
    const p: any = { page, limit: 10 }
    if (filters.search) p.search = filters.search
    if (filters.status && filters.status !== 'ALL') p.status = filters.status
    if (filters.type && filters.type !== 'ALL') p.type = filters.type
    if (filters.startDate) p.startDate = filters.startDate
    if (filters.endDate) p.endDate = filters.endDate
    if (filters.doctorId) p.doctorId = filters.doctorId
    if (filters.patientId) p.patientId = filters.patientId
    return p
  }, [page, filters])

  const { data, isLoading, error } = useAppointments(params)
  const updateStatus = useUpdateAppointmentStatus()

  const list = data?.data || []
  const pagination = data?.meta

  const handleChangeStatus = async (status: string) => {
    if (!selected) return
    try {
      await updateStatus.mutateAsync({ id: selected.id, status })
      toast.success('تم تحديث حالة الموعد')
      setSelected(null)
    } catch (e: any) {
      toast.error(e?.response?.data?.message || 'فشل تحديث حالة الموعد')
    }
  }

  if (error) {
    return (
      <AdminLayout>
        <Breadcrumbs />
        <div className="p-6">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <p className="text-red-600">حدث خطأ في تحميل المواعيد</p>
            <button onClick={() => window.location.reload()} className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors">إعادة المحاولة</button>
          </div>
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout>
      <Breadcrumbs />
      <div className="p-6 space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">إدارة المواعيد</h1>
          <p className="text-gray-600 mt-1">عرض وإدارة المواعيد والفلاتر والحالات</p>
        </div>

        <AppointmentFilters
          value={filters}
          onChange={(v) => {
            setFilters(v)
            setPage(1)
          }}
          onReset={() => {
            setFilters({ status: 'ALL', type: 'ALL' })
            setPage(1)
          }}
        />

        <AppointmentsCalendar view={view} onViewChange={setView} appointments={list} />

        <AppointmentsTable
          appointments={list}
          isLoading={isLoading}
          pagination={pagination ? { page: pagination.page, totalPages: pagination.totalPages, total: pagination.total } : undefined}
          onPageChange={setPage}
          onOpenDetails={setSelected}
        />

        <AppointmentDetails appointment={selected} onClose={() => setSelected(null)} onChangeStatus={handleChangeStatus} />
      </div>
    </AdminLayout>
  )
}


