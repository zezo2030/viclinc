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
      <ArrowUp className="w-4 h-4 text-primary-600" />
    ) : (
      <ArrowDown className="w-4 h-4 text-primary-600" />
    )
  }

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-12">
        <div className="flex flex-col items-center justify-center gap-4">
          <Spinner size="lg" />
          <p className="text-gray-600">جاري تحميل السجلات...</p>
        </div>
      </div>
    )
  }

  if (!records || records.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-12">
        <div className="flex flex-col items-center justify-center gap-4">
          <FileText className="w-16 h-16 text-gray-300" />
          <p className="text-gray-600 text-lg">لا توجد سجلات طبية</p>
          <p className="text-gray-500 text-sm">استخدم الفلاتر للبحث عن السجلات</p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                رقم السجل
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                المريض
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                الطبيب
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                التشخيص
              </th>
              <th
                onClick={() => handleSort('updatedAt')}
                className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-center gap-2 justify-end">
                  <span>آخر تحديث</span>
                  {getSortIcon('updatedAt')}
                </div>
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                المرفقات
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                الإجراءات
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {records.map((record) => (
              <tr key={record.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  #{record.version}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">
                    {record.patient?.name || `Patient ${record.patientId.slice(0, 8)}`}
                  </div>
                  {record.patient?.email && (
                    <div className="text-sm text-gray-500">{record.patient.email}</div>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">
                    {record.doctor?.name || `Doctor ${record.doctorId.slice(0, 8)}`}
                  </div>
                  {record.doctor?.email && (
                    <div className="text-sm text-gray-500">{record.doctor.email}</div>
                  )}
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm text-gray-900 max-w-md truncate" title={record.diagnosis}>
                    {record.diagnosis}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {format(new Date(record.updatedAt), 'yyyy-MM-dd HH:mm')}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {record.attachments && record.attachments.length > 0 ? (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {record.attachments.length}
                    </span>
                  ) : (
                    <span className="text-gray-400">-</span>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <button
                    onClick={() => onView?.(record)}
                    className="text-primary-600 hover:text-primary-900 flex items-center gap-1"
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
        <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-700">
              عرض{' '}
              <span className="font-medium">
                {(pagination.page - 1) * 10 + 1} - {Math.min(pagination.page * 10, pagination.total)}
              </span>{' '}
              من <span className="font-medium">{pagination.total}</span> سجل
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => onPageChange?.(pagination.page - 1)}
                disabled={pagination.page === 1}
                className="px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
              <span className="text-sm text-gray-700">
                صفحة {pagination.page} من {pagination.totalPages}
              </span>
              <button
                onClick={() => onPageChange?.(pagination.page + 1)}
                disabled={pagination.page >= pagination.totalPages}
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

