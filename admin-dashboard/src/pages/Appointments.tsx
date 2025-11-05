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
    if (filters.search && filters.search.trim()) p.search = filters.search.trim()
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
          <div className="rounded-2xl bg-gradient-to-br from-red-50 to-red-100/50 border border-red-200 p-8 text-center shadow-lg">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-200 mb-4">
              <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p className="text-xl font-bold text-red-800 mb-2">حدث خطأ في تحميل المواعيد</p>
            <p className="text-sm text-red-600 mb-4">حدث خطأ أثناء تحميل البيانات</p>
            <button 
              onClick={() => window.location.reload()} 
              className="px-6 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl font-semibold hover:scale-105 transition-all duration-300 shadow-lg shadow-red-500/30"
            >
              إعادة المحاولة
            </button>
          </div>
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout>
      <Breadcrumbs />
      
      {/* Page Header with Gradient */}
      <div className="mb-8 relative overflow-hidden rounded-2xl bg-gradient-to-br from-rose-500 via-pink-600 to-fuchsia-500 p-8 shadow-2xl">
        <div className="relative z-10">
          <h1 className="text-4xl font-black text-white drop-shadow-lg">
            إدارة المواعيد
          </h1>
          <p className="mt-2 text-lg font-medium text-pink-100">
            عرض وإدارة المواعيد والفلاتر والحالات
          </p>
          <div className="mt-4 flex items-center gap-4 text-white/90">
            <span className="flex items-center gap-2 bg-white/20 px-3 py-1.5 rounded-lg backdrop-blur-sm">
              <span className="text-2xl font-bold">{pagination?.total || 0}</span>
              <span className="text-sm">موعد</span>
            </span>
          </div>
        </div>
        {/* Decorative Elements */}
        <div className="absolute top-0 left-0 w-64 h-64 bg-white/10 rounded-full -translate-x-32 -translate-y-32 blur-3xl"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-white/10 rounded-full translate-x-32 translate-y-32 blur-3xl"></div>
      </div>

      {/* Filters */}
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

      {/* Calendar */}
      <AppointmentsCalendar view={view} onViewChange={setView} appointments={list} />

      {/* Table */}
      <AppointmentsTable
          appointments={list}
          isLoading={isLoading}
          pagination={pagination ? { page: pagination.page, totalPages: pagination.totalPages, total: pagination.total } : undefined}
          onPageChange={setPage}
          onOpenDetails={setSelected}
        />

      <AppointmentDetails appointment={selected} onClose={() => setSelected(null)} onChangeStatus={handleChangeStatus} />
    </AdminLayout>
  )
}


