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
      return <ArrowUpDown className="w-4 h-4 text-[#64748b]" />
    }
    return sortOrder === 'asc' ? (
      <ArrowUp className="w-4 h-4 text-[#6366f1]" />
    ) : (
      <ArrowDown className="w-4 h-4 text-[#6366f1]" />
    )
  }

  if (isLoading) {
    return (
      <div className="rounded-xl bg-white border border-[#e2e8f0] p-12 shadow-sm">
        <div className="flex flex-col items-center justify-center gap-6">
          <Spinner size="lg" />
          <div className="text-center">
            <p className="text-lg font-semibold text-[#0f172a]">جاري التحميل...</p>
            <p className="text-sm text-[#64748b] mt-1">يرجى الانتظار</p>
          </div>
        </div>
      </div>
    )
  }

  if (!users || users.length === 0) {
    return (
      <div className="rounded-xl bg-white border border-[#e2e8f0] p-12 shadow-sm">
        <div className="flex flex-col items-center justify-center gap-6">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-lg bg-[#6366f1]/10">
            <svg className="w-10 h-10 text-[#6366f1]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
          <div className="text-center">
            <p className="text-xl font-semibold text-[#0f172a] mb-2">لا يوجد مستخدمين</p>
            <p className="text-[#64748b]">ابدأ بإضافة أول مستخدم لنظامك</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="rounded-xl bg-white border border-[#e2e8f0] overflow-hidden shadow-sm">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-[#e2e8f0]">
          <thead className="bg-[#f8fafc]">
            <tr>
              <th
                onClick={() => handleSort('name')}
                className="px-6 py-4 text-right text-xs font-medium text-[#64748b] uppercase tracking-wider cursor-pointer hover:bg-[#6366f1]/10 transition-all duration-150 ease-out"
              >
                <div className="flex items-center gap-2 justify-end">
                  <span>الاسم</span>
                  {getSortIcon('name')}
                </div>
              </th>
              <th
                onClick={() => handleSort('email')}
                className="px-6 py-4 text-right text-xs font-medium text-[#64748b] uppercase tracking-wider cursor-pointer hover:bg-[#6366f1]/10 transition-all duration-150 ease-out"
              >
                <div className="flex items-center gap-2 justify-end">
                  <span>البريد الإلكتروني</span>
                  {getSortIcon('email')}
                </div>
              </th>
              <th className="px-6 py-4 text-right text-xs font-medium text-[#64748b] uppercase tracking-wider">
                رقم الهاتف
              </th>
              <th className="px-6 py-4 text-right text-xs font-medium text-[#64748b] uppercase tracking-wider">
                الدور
              </th>
              <th className="px-6 py-4 text-right text-xs font-medium text-[#64748b] uppercase tracking-wider">
                الحالة
              </th>
              <th
                onClick={() => handleSort('createdAt')}
                className="px-6 py-4 text-right text-xs font-medium text-[#64748b] uppercase tracking-wider cursor-pointer hover:bg-[#6366f1]/10 transition-all duration-150 ease-out"
              >
                <div className="flex items-center gap-2 justify-end">
                  <span>تاريخ الإنشاء</span>
                  {getSortIcon('createdAt')}
                </div>
              </th>
              <th className="px-6 py-4 text-right text-xs font-medium text-[#64748b] uppercase tracking-wider">
                الإجراءات
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-[#e2e8f0]">
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
        <div className="bg-[#f8fafc] px-6 py-4 border-t border-[#e2e8f0]">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-sm font-medium text-[#64748b]">
              عرض{' '}
              <span className="font-semibold text-[#6366f1]">
                {(pagination.page - 1) * 10 + 1} - {Math.min(pagination.page * 10, pagination.total)}
              </span>{' '}
              من <span className="font-semibold text-[#6366f1]">{pagination.total}</span> مستخدم
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => onPageChange?.(pagination.page - 1)}
                disabled={pagination.page === 1}
                className="px-4 py-2 text-sm font-medium text-[#64748b] bg-white border border-[#e2e8f0] rounded-lg hover:bg-[#f8fafc] hover:border-[#6366f1] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-150 ease-out shadow-sm"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
              <div className="flex items-center gap-1">
                {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    onClick={() => onPageChange?.(page)}
                    className={`px-4 py-2 text-sm font-medium rounded-lg transition-all duration-150 ease-out ${
                      page === pagination.page
                        ? 'bg-[#6366f1] text-white shadow-sm'
                        : 'text-[#64748b] bg-white border border-[#e2e8f0] hover:bg-[#f8fafc] hover:border-[#6366f1] shadow-sm'
                    }`}
                  >
                    {page}
                  </button>
                ))}
              </div>
              <button
                onClick={() => onPageChange?.(pagination.page + 1)}
                disabled={pagination.page === pagination.totalPages}
                className="px-4 py-2 text-sm font-medium text-[#64748b] bg-white border border-[#e2e8f0] rounded-lg hover:bg-[#f8fafc] hover:border-[#6366f1] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-150 ease-out shadow-sm"
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

