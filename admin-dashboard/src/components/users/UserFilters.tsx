import { useState, useEffect } from 'react'
import { Search, X } from 'lucide-react'
import type { UserFilters as UserFiltersType, UserFiltersProps } from '../../types/user.types'
import { UserRole, UserStatus } from '../../types/user.types'

export default function UserFilters({ filters, onFiltersChange, onReset }: UserFiltersProps) {
  const [searchTerm, setSearchTerm] = useState(filters.search || '')

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchTerm !== filters.search) {
        onFiltersChange({ ...filters, search: searchTerm || undefined })
      }
    }, 500)

    return () => clearTimeout(timer)
  }, [searchTerm])

  const handleRoleChange = (role: UserRole | 'ALL') => {
    onFiltersChange({
      ...filters,
      role: role === 'ALL' ? undefined : role,
    })
  }

  const handleStatusChange = (status: UserStatus | 'ALL') => {
    onFiltersChange({
      ...filters,
      status: status === 'ALL' ? undefined : status,
    })
  }

  const handleReset = () => {
    setSearchTerm('')
    onReset()
  }

  const hasActiveFilters = filters.role || filters.status || filters.search

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
      <div className="flex flex-col md:flex-row gap-4">
        {/* Search Input */}
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="البحث بالاسم أو البريد الإلكتروني..."
              className="w-full pl-4 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Role Filter */}
        <div className="w-full md:w-48">
          <select
            value={filters.role || 'ALL'}
            onChange={(e) => handleRoleChange(e.target.value as UserRole | 'ALL')}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          >
            <option value="ALL">جميع الأدوار</option>
            <option value={UserRole.ADMIN}>مدير</option>
            <option value={UserRole.DOCTOR}>طبيب</option>
            <option value={UserRole.PATIENT}>مريض</option>
          </select>
        </div>

        {/* Status Filter */}
        <div className="w-full md:w-48">
          <select
            value={filters.status || 'ALL'}
            onChange={(e) => handleStatusChange(e.target.value as UserStatus | 'ALL')}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          >
            <option value="ALL">جميع الحالات</option>
            <option value={UserStatus.ACTIVE}>نشط</option>
            <option value={UserStatus.DISABLED}>معطل</option>
            <option value={UserStatus.PENDING_DELETE}>قيد الحذف</option>
          </select>
        </div>

        {/* Reset Button */}
        {hasActiveFilters && (
          <button
            onClick={handleReset}
            className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors"
          >
            <X className="w-4 h-4" />
            <span>إعادة التعيين</span>
          </button>
        )}
      </div>
    </div>
  )
}

