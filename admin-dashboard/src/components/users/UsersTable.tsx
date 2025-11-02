import { ArrowUpDown, ArrowUp, ArrowDown, ChevronLeft, ChevronRight } from 'lucide-react'
import type { UsersTableProps } from '../../types/user.types'
import { Spinner } from '../common/Spinner'
import UserRow from './UserRow'

interface UsersTableExtendedProps extends UsersTableProps {
  pagination?: {
    page: number
    totalPages: number
    total: number
  }
  onPageChange?: (page: number) => void
  sortBy?: 'name' | 'email' | 'createdAt' | 'updatedAt'
  sortOrder?: 'asc' | 'desc'
  onSort?: (column: 'name' | 'email' | 'createdAt') => void
}

export default function UsersTable({
  users,
  isLoading,
  onEdit,
  onDelete,
  onHardDelete,
  onStatusChange,
  onRoleChange,
  pagination,
  onPageChange,
  sortBy,
  sortOrder,
  onSort,
}: UsersTableExtendedProps) {
  const handleSort = (column: 'name' | 'email' | 'createdAt') => {
    onSort?.(column)
  }

  const getSortIcon = (column: 'name' | 'email' | 'createdAt') => {
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
          <p className="text-gray-600">جاري التحميل...</p>
        </div>
      </div>
    )
  }

  if (!users || users.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-12">
        <div className="flex flex-col items-center justify-center gap-4">
          <p className="text-gray-600 text-lg">لا يوجد مستخدمين</p>
          <p className="text-gray-500 text-sm">ابدأ بإضافة مستخدم جديد</p>
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
              <th
                onClick={() => handleSort('name')}
                className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-center gap-2 justify-end">
                  <span>الاسم</span>
                  {getSortIcon('name')}
                </div>
              </th>
              <th
                onClick={() => handleSort('email')}
                className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-center gap-2 justify-end">
                  <span>البريد الإلكتروني</span>
                  {getSortIcon('email')}
                </div>
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                رقم الهاتف
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                الدور
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                الحالة
              </th>
              <th
                onClick={() => handleSort('createdAt')}
                className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-center gap-2 justify-end">
                  <span>تاريخ الإنشاء</span>
                  {getSortIcon('createdAt')}
                </div>
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                الإجراءات
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {users.map((user) => (
              <UserRow
                key={user.id}
                user={user}
                onEdit={onEdit}
                onDelete={onDelete}
                onHardDelete={onHardDelete}
                onStatusChange={onStatusChange}
                onRoleChange={onRoleChange}
              />
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
              من <span className="font-medium">{pagination.total}</span> مستخدم
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

