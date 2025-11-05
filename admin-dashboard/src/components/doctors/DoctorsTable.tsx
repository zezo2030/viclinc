import { ChevronLeft, ChevronRight, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react'
import { Spinner } from '@/components/common/Spinner'
import type { DoctorProfile, DoctorStatus } from '@/types/doctor.types'

interface DoctorsTableProps {
  doctors: DoctorProfile[]
  isLoading?: boolean
  pagination?: {
    page: number
    totalPages: number
    total: number
  }
  onPageChange?: (page: number) => void
  onEdit?: (doctor: DoctorProfile) => void
  onStatusChange?: (doctor: DoctorProfile, status: DoctorStatus) => void
  sortBy?: 'name' | 'yearsOfExperience'
  sortOrder?: 'asc' | 'desc'
  onSort?: (column: 'name' | 'yearsOfExperience') => void
}

export default function DoctorsTable({
  doctors,
  isLoading,
  pagination,
  onPageChange,
  onEdit,
  onStatusChange,
  sortBy,
  sortOrder,
  onSort,
}: DoctorsTableProps) {
  if (isLoading) {
    return (
      <div className="rounded-2xl bg-gradient-to-br from-white to-gray-50 border border-gray-100 p-12 shadow-lg">
        <div className="flex flex-col items-center justify-center gap-6">
          <div className="relative">
            <Spinner size="lg" />
            <div className="absolute inset-0 animate-ping opacity-20">
              <Spinner size="lg" />
            </div>
          </div>
          <div className="text-center">
            <p className="text-xl font-bold text-gray-900">جاري التحميل...</p>
            <p className="text-sm text-gray-500 mt-1">يرجى الانتظار</p>
          </div>
        </div>
      </div>
    )
  }

  if (!doctors || doctors.length === 0) {
    return (
      <div className="rounded-2xl bg-gradient-to-br from-white to-teal-50/30 border border-teal-100 p-12 shadow-lg">
        <div className="flex flex-col items-center justify-center gap-6">
          <div className="inline-flex items-center justify-center w-24 h-24 rounded-2xl bg-gradient-to-br from-teal-100 to-cyan-100">
            <svg className="w-12 h-12 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-gray-900 mb-2">لا يوجد أطباء</p>
            <p className="text-gray-600">ابدأ بإضافة أول طبيب لنظامك</p>
          </div>
        </div>
      </div>
    )
  }

  const statusClass = (status: DoctorStatus) =>
    status === 'APPROVED'
      ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-lg shadow-green-500/30'
      : status === 'SUSPENDED'
      ? 'bg-gradient-to-r from-red-500 to-rose-600 text-white shadow-lg shadow-red-500/30'
      : 'bg-gradient-to-r from-amber-400 to-orange-500 text-white shadow-lg shadow-amber-400/30'

  return (
    <div className="rounded-2xl bg-gradient-to-br from-white to-gray-50 border border-gray-100 overflow-hidden shadow-lg">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gradient-to-r from-teal-50 to-cyan-50">
            <tr>
              <th
                onClick={() => onSort?.('name')}
                className="px-6 py-4 text-right text-xs font-bold text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-teal-100/50 transition-all duration-300"
              >
                <div className="flex items-center gap-2 justify-end">
                  <span>👤 الاسم</span>
                  {sortBy !== 'name' ? (
                    <ArrowUpDown className="w-4 h-4 text-gray-400" />
                  ) : sortOrder === 'asc' ? (
                    <ArrowUp className="w-4 h-4 text-teal-600" />
                  ) : (
                    <ArrowDown className="w-4 h-4 text-teal-600" />
                  )}
                </div>
              </th>
              <th className="px-6 py-4 text-right text-xs font-bold text-gray-700 uppercase tracking-wider">
                📜 الرخصة
              </th>
              <th
                onClick={() => onSort?.('yearsOfExperience')}
                className="px-6 py-4 text-right text-xs font-bold text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-teal-100/50 transition-all duration-300"
              >
                <div className="flex items-center gap-2 justify-end">
                  <span>⭐ سنوات الخبرة</span>
                  {sortBy !== 'yearsOfExperience' ? (
                    <ArrowUpDown className="w-4 h-4 text-gray-400" />
                  ) : sortOrder === 'asc' ? (
                    <ArrowUp className="w-4 h-4 text-teal-600" />
                  ) : (
                    <ArrowDown className="w-4 h-4 text-teal-600" />
                  )}
                </div>
              </th>
              <th className="px-6 py-4 text-right text-xs font-bold text-gray-700 uppercase tracking-wider">
                🏥 القسم
              </th>
              <th className="px-6 py-4 text-right text-xs font-bold text-gray-700 uppercase tracking-wider">
                ✅ الحالة
              </th>
              <th className="px-6 py-4 text-right text-xs font-bold text-gray-700 uppercase tracking-wider">
                ⚙️ الإجراءات
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {doctors.map((doctor) => (
              <tr key={doctor.id} className="border-b border-gray-200 hover:bg-gradient-to-r hover:from-teal-50/50 hover:to-cyan-50/50 transition-all duration-300 group">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex flex-col items-end">
                    <div className="text-sm font-bold text-gray-900 group-hover:text-teal-600 transition-colors">{doctor.name}</div>
                    {doctor.email && (
                      <div className="text-sm font-medium text-gray-600">{doctor.email}</div>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">{doctor.licenseNumber}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center gap-2 justify-end">
                    <span className="text-sm font-bold text-gray-900">{doctor.yearsOfExperience}</span>
                    <span className="text-xs text-gray-500">سنة</span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">
                    {typeof (doctor as any).departmentId === 'object'
                      ? (doctor as any).departmentId?.name || ''
                      : doctor.departmentId}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold ${statusClass(doctor.status)}`}>
                    <span className="w-2 h-2 rounded-full bg-white animate-pulse"></span>
                    {doctor.status === 'APPROVED' ? 'مقبول' : doctor.status === 'SUSPENDED' ? 'موقوف' : 'قيد المراجعة'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  <div className="flex items-center gap-2 justify-end">
                    <button
                      onClick={() => onEdit?.(doctor)}
                      className="p-2 rounded-xl bg-gradient-to-r from-teal-500 to-cyan-500 text-white hover:scale-110 transition-all duration-300 shadow-lg shadow-teal-500/30 hover:shadow-xl"
                      title="تعديل"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                    <div className="relative">
                      <select
                        className="px-3 py-1.5 text-sm font-semibold border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 bg-white hover:border-teal-300 transition-all duration-300"
                        value={doctor.status}
                        onChange={(e) => onStatusChange?.(doctor, e.target.value as DoctorStatus)}
                      >
                        <option value="PENDING">⏳ قيد المراجعة</option>
                        <option value="APPROVED">✅ مقبول</option>
                        <option value="SUSPENDED">⛔ موقوف</option>
                      </select>
                    </div>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {pagination && pagination.totalPages > 1 && (
        <div className="bg-gradient-to-r from-teal-50 to-cyan-50 px-6 py-4 border-t border-gray-200">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-sm font-medium text-gray-700">
              عرض{' '}
              <span className="font-bold text-teal-600">
                {(pagination.page - 1) * 10 + 1} - {Math.min(pagination.page * 10, pagination.total)}
              </span>{' '}
              من <span className="font-bold text-teal-600">{pagination.total}</span> طبيب
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => onPageChange?.(pagination.page - 1)}
                disabled={pagination.page === 1}
                className="px-4 py-2 text-sm font-semibold text-gray-700 bg-white border-2 border-gray-300 rounded-xl hover:bg-gray-50 hover:border-teal-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 hover:scale-105 shadow-sm"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
              <div className="flex items-center gap-1">
                {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    onClick={() => onPageChange?.(page)}
                    className={`px-4 py-2 text-sm font-semibold rounded-xl transition-all duration-300 ${
                      page === pagination.page
                        ? 'bg-gradient-to-r from-teal-500 to-cyan-500 text-white shadow-lg shadow-teal-500/30 scale-105'
                        : 'text-gray-700 bg-white border-2 border-gray-300 hover:bg-gray-50 hover:border-teal-300 hover:scale-105 shadow-sm'
                    }`}
                  >
                    {page}
                  </button>
                ))}
              </div>
              <button
                onClick={() => onPageChange?.(pagination.page + 1)}
                disabled={pagination.page === pagination.totalPages}
                className="px-4 py-2 text-sm font-semibold text-gray-700 bg-white border-2 border-gray-300 rounded-xl hover:bg-gray-50 hover:border-teal-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 hover:scale-105 shadow-sm"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}


