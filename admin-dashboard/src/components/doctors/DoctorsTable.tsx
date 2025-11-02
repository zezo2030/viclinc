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
      <div className="bg-white rounded-lg border border-gray-200 p-12">
        <div className="flex flex-col items-center justify-center gap-4">
          <Spinner size="lg" />
          <p className="text-gray-600">جاري التحميل...</p>
        </div>
      </div>
    )
  }

  if (!doctors || doctors.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-12">
        <div className="flex flex-col items-center justify-center gap-4">
          <p className="text-gray-600 text-lg">لا يوجد أطباء</p>
          <p className="text-gray-500 text-sm">ابدأ بإضافة طبيب جديد</p>
        </div>
      </div>
    )
  }

  const statusClass = (status: DoctorStatus) =>
    status === 'APPROVED'
      ? 'bg-green-50 text-green-700 border-green-200'
      : status === 'SUSPENDED'
      ? 'bg-red-50 text-red-700 border-red-200'
      : 'bg-yellow-50 text-yellow-700 border-yellow-200'

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th
                onClick={() => onSort?.('name')}
                className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
              >
                <div className="flex items-center gap-2 justify-end">
                  <span>الاسم</span>
                  {sortBy !== 'name' ? (
                    <ArrowUpDown className="w-4 h-4 text-gray-400" />
                  ) : sortOrder === 'asc' ? (
                    <ArrowUp className="w-4 h-4 text-primary-600" />
                  ) : (
                    <ArrowDown className="w-4 h-4 text-primary-600" />
                  )}
                </div>
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                الرخصة
              </th>
              <th
                onClick={() => onSort?.('yearsOfExperience')}
                className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
              >
                <div className="flex items-center gap-2 justify-end">
                  <span>سنوات الخبرة</span>
                  {sortBy !== 'yearsOfExperience' ? (
                    <ArrowUpDown className="w-4 h-4 text-gray-400" />
                  ) : sortOrder === 'asc' ? (
                    <ArrowUp className="w-4 h-4 text-primary-600" />
                  ) : (
                    <ArrowDown className="w-4 h-4 text-primary-600" />
                  )}
                </div>
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                القسم
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                الحالة
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                الإجراءات
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {doctors.map((doctor) => (
              <tr key={doctor.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex flex-col items-end">
                    <div className="text-sm font-medium text-gray-900">{doctor.name}</div>
                    {doctor.email && (
                      <div className="text-sm text-gray-500">{doctor.email}</div>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{doctor.licenseNumber}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{doctor.yearsOfExperience}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {typeof (doctor as any).departmentId === 'object'
                    ? (doctor as any).departmentId?.name || ''
                    : doctor.departmentId}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2.5 py-1 rounded-lg text-xs border ${statusClass(doctor.status)}`}>
                    {doctor.status === 'APPROVED' ? 'مقبول' : doctor.status === 'SUSPENDED' ? 'موقوف' : 'قيد المراجعة'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  <div className="flex items-center gap-2 justify-end">
                    <button
                      onClick={() => onEdit?.(doctor)}
                      className="px-3 py-1.5 text-sm bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                    >
                      تعديل
                    </button>
                    <div className="relative">
                      <select
                        className="px-2 py-1.5 text-sm bg-white border border-gray-300 rounded-lg"
                        value={doctor.status}
                        onChange={(e) => onStatusChange?.(doctor, e.target.value as DoctorStatus)}
                      >
                        <option value="PENDING">قيد المراجعة</option>
                        <option value="APPROVED">مقبول</option>
                        <option value="SUSPENDED">موقوف</option>
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
        <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-700">
              عرض{' '}
              <span className="font-medium">
                {(pagination.page - 1) * 10 + 1} - {Math.min(pagination.page * 10, pagination.total)}
              </span>{' '}
              من <span className="font-medium">{pagination.total}</span> طبيب
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => onPageChange?.(pagination.page - 1)}
                disabled={pagination.page === 1}
                className="px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
              <div className="flex items-center gap-1">
                {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    onClick={() => onPageChange?.(page)}
                    className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                      page === pagination.page
                        ? 'bg-primary-600 text-white'
                        : 'text-gray-700 bg-white border border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    {page}
                  </button>
                ))}
              </div>
              <button
                onClick={() => onPageChange?.(pagination.page + 1)}
                disabled={pagination.page === pagination.totalPages}
                className="px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
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


