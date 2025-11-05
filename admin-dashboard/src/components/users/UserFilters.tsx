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
    <div className="mb-6 rounded-xl bg-gradient-to-br from-white to-gray-50 p-6 shadow-lg border border-gray-100">
      <div className="flex items-center gap-3 mb-4">
        <div className="h-1 w-1 rounded-full bg-gradient-to-r from-cyan-500 to-blue-600"></div>
        <h3 className="text-lg font-bold text-gray-900">البحث والتصفية</h3>
        <div className="h-0.5 flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 opacity-20"></div>
      </div>
      
      <div className="flex flex-col md:flex-row gap-4">
        {/* Search Input */}
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute right-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 transition-colors peer-focus:text-blue-600" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="البحث بالاسم أو البريد الإلكتروني..."
              className="peer w-full pl-4 pr-12 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 bg-white/70 backdrop-blur-sm transition-all duration-300 hover:border-gray-300 placeholder:text-gray-400"
            />
          </div>
        </div>

        {/* Role Filter */}
        <div className="w-full md:w-56">
          <select
            value={filters.role || 'ALL'}
            onChange={(e) => handleRoleChange(e.target.value as UserRole | 'ALL')}
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 bg-white/70 backdrop-blur-sm transition-all duration-300 hover:border-gray-300 font-medium"
          >
            <option value="ALL">🔵 جميع الأدوار</option>
            <option value={UserRole.ADMIN}>👑 مدير</option>
            <option value={UserRole.DOCTOR}>👨‍⚕️ طبيب</option>
            <option value={UserRole.PATIENT}>👤 مريض</option>
          </select>
        </div>

        {/* Status Filter */}
        <div className="w-full md:w-56">
          <select
            value={filters.status || 'ALL'}
            onChange={(e) => handleStatusChange(e.target.value as UserStatus | 'ALL')}
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 bg-white/70 backdrop-blur-sm transition-all duration-300 hover:border-gray-300 font-medium"
          >
            <option value="ALL">🔵 جميع الحالات</option>
            <option value={UserStatus.ACTIVE}>✅ نشط</option>
            <option value={UserStatus.DISABLED}>⭕ معطل</option>
            <option value={UserStatus.PENDING_DELETE}>🗑️ قيد الحذف</option>
          </select>
        </div>

        {/* Reset Button */}
        {hasActiveFilters && (
          <button
            onClick={handleReset}
            className="flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-gray-500 to-gray-600 text-white rounded-xl font-semibold hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl"
          >
            <X className="w-4 h-4" />
            <span>إعادة التعيين</span>
          </button>
        )}
      </div>
    </div>
  )
}

