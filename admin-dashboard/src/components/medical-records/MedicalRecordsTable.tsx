import { ArrowUpDown, ArrowUp, ArrowDown, ChevronLeft, ChevronRight, Eye, FileText } from 'lucide-react'
import type { MedicalRecordsTableProps } from '@/types'
import { Spinner } from '../common/Spinner'
import { format } from 'date-fns'

export default function MedicalRecordsTable({
  records,
  isLoading,
  onView,
  pagination,
  onPageChange,
  sortBy,
  sortOrder,
  onSort,
}: MedicalRecordsTableProps) {
  const handleSort = (column: 'createdAt' | 'updatedAt' | 'patient' | 'doctor') => {
    onSort?.(column)
  }

  const getSortIcon = (column: 'createdAt' | 'updatedAt' | 'patient' | 'doctor') => {
    if (sortBy !== column) {
      return <ArrowUpDown className="w-4 h-4 text-gray-400" />
    }
    return sortOrder === 'asc' ? (
      <ArrowUp className="w-4 h-4 text-[#D62828]" />
    ) : (
      <ArrowDown className="w-4 h-4 text-[#D62828]" />
    )
  }

  if (isLoading) {
    return (
      <div className="rounded-xl border border-gray-200 bg-white p-12">
        <div className="flex flex-col items-center justify-center gap-4">
          <Spinner size="lg" />
          <p className="text-[#333333]">جاري تحميل السجلات...</p>
        </div>
      </div>
    )
  }

  if (!records || records.length === 0) {
    return (
      <div className="rounded-xl border border-gray-200 bg-white p-12">
        <div className="flex flex-col items-center justify-center gap-4">
          <FileText className="w-16 h-16 text-[#D62828]" />
          <p className="text-[#213F6A] text-lg font-bold">لا توجد سجلات طبية</p>
          <p className="text-[#333333] text-sm">استخدم الفلاتر للبحث عن السجلات</p>
        </div>
      </div>
    )
  }

  return (
    <div className="rounded-xl border border-gray-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-[#E8E8E8]">
            <tr>
              <th className="px-6 py-4 text-right text-xs font-bold text-[#213F6A] uppercase tracking-wider">
                رقم السجل
              </th>
              <th className="px-6 py-4 text-right text-xs font-bold text-[#213F6A] uppercase tracking-wider">
                المريض
              </th>
              <th className="px-6 py-4 text-right text-xs font-bold text-[#213F6A] uppercase tracking-wider">
                الطبيب
              </th>
              <th className="px-6 py-4 text-right text-xs font-bold text-[#213F6A] uppercase tracking-wider">
                التشخيص
              </th>
              <th
                onClick={() => handleSort('updatedAt')}
                className="px-6 py-4 text-right text-xs font-bold text-[#213F6A] uppercase tracking-wider cursor-pointer hover:bg-[#D62828]/10 transition-colors"
              >
                <div className="flex items-center gap-2 justify-end">
                  <span>آخر تحديث</span>
                  {getSortIcon('updatedAt')}
                </div>
              </th>
              <th className="px-6 py-4 text-right text-xs font-bold text-[#213F6A] uppercase tracking-wider">
                المرفقات
              </th>
              <th className="px-6 py-4 text-right text-xs font-bold text-[#213F6A] uppercase tracking-wider">
                الإجراءات
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {records.map((record) => (
              <tr key={record.id} className="hover:bg-[#E8E8E8]/50 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-[#213F6A]">
                  #{record.version}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-[#213F6A]">
                    {record.patient?.name || `Patient ${record.patientId.slice(0, 8)}`}
                  </div>
                  {record.patient?.email && (
                    <div className="text-sm text-[#333333]">{record.patient.email}</div>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-[#213F6A]">
                    {record.doctor?.name || `Doctor ${record.doctorId.slice(0, 8)}`}
                  </div>
                  {record.doctor?.email && (
                    <div className="text-sm text-[#333333]">{record.doctor.email}</div>
                  )}
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm text-[#333333] max-w-md truncate" title={record.diagnosis}>
                    {record.diagnosis}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-[#333333]">
                  {format(new Date(record.updatedAt), 'yyyy-MM-dd HH:mm')}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  {record.attachments && record.attachments.length > 0 ? (
                    <span className="inline-flex items-center px-3 py-1.5 rounded-xl text-xs font-bold bg-[#213F6A]/10 text-[#213F6A] border border-[#213F6A]/30">
                      {record.attachments.length}
                    </span>
                  ) : (
                    <span className="text-gray-400">-</span>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <button
                    onClick={() => onView?.(record)}
                    className="px-4 py-2 text-sm font-semibold text-[#D62828] hover:bg-[#D62828]/10 rounded-xl transition-all duration-300 hover:scale-105 flex items-center gap-1"
                  >
                    <Eye className="w-4 h-4" />
                    <span>عرض</span>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <div className="bg-[#E8E8E8] px-6 py-4 border-t border-gray-200">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-sm font-semibold text-[#333333]">
              عرض{' '}
              <span className="font-bold text-[#D62828]">
                {(pagination.page - 1) * 10 + 1} - {Math.min(pagination.page * 10, pagination.total)}
              </span>{' '}
              من <span className="font-bold text-[#D62828]">{pagination.total}</span> سجل
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => onPageChange?.(pagination.page - 1)}
                disabled={pagination.page === 1}
                className="px-4 py-2 text-sm font-semibold text-[#213F6A] bg-white border-2 border-gray-300 rounded-xl hover:border-[#D62828] hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 hover:scale-105 shadow-sm"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
              <span className="text-sm font-semibold text-[#213F6A] px-4">
                صفحة {pagination.page} من {pagination.totalPages}
              </span>
              <button
                onClick={() => onPageChange?.(pagination.page + 1)}
                disabled={pagination.page >= pagination.totalPages}
                className="px-4 py-2 text-sm font-semibold text-[#213F6A] bg-white border-2 border-gray-300 rounded-xl hover:border-[#D62828] hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 hover:scale-105 shadow-sm"
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

