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
    <div className="mb-6 rounded-xl bg-white p-6 shadow-sm border border-[#e2e8f0]">
      <div className="flex items-center gap-3 mb-4">
        <div className="h-1 w-1 rounded-full bg-[#6366f1]"></div>
        <h3 className="text-lg font-semibold text-[#0f172a]">البحث والتصفية</h3>
        <div className="h-0.5 flex-1 bg-[#6366f1] opacity-20"></div>
      </div>
      
      <div className="flex flex-col md:flex-row gap-4">
        {/* Search Input */}
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute right-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#64748b] transition-colors duration-150 peer-focus:text-[#6366f1]" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="البحث بالاسم أو البريد الإلكتروني..."
              className="peer w-full pl-4 pr-12 py-3 border border-[#e2e8f0] rounded-lg focus:border-[#6366f1] focus:ring-2 focus:ring-[#6366f1]/20 bg-white transition-all duration-150 ease-out hover:border-[#6366f1]/50 placeholder:text-[#64748b]"
            />
          </div>
        </div>

        {/* Role Filter */}
        <div className="w-full md:w-56">
          <select
            value={filters.role || 'ALL'}
            onChange={(e) => handleRoleChange(e.target.value as UserRole | 'ALL')}
            className="w-full px-4 py-3 border border-[#e2e8f0] rounded-lg focus:border-[#6366f1] focus:ring-2 focus:ring-[#6366f1]/20 bg-white transition-all duration-150 ease-out hover:border-[#6366f1]/50 font-medium"
          >
            <option value="ALL">جميع الأدوار</option>
            <option value={UserRole.ADMIN}>مدير</option>
            <option value={UserRole.DOCTOR}>طبيب</option>
            <option value={UserRole.PATIENT}>مريض</option>
          </select>
        </div>

        {/* Status Filter */}
        <div className="w-full md:w-56">
          <select
            value={filters.status || 'ALL'}
            onChange={(e) => handleStatusChange(e.target.value as UserStatus | 'ALL')}
            className="w-full px-4 py-3 border border-[#e2e8f0] rounded-lg focus:border-[#6366f1] focus:ring-2 focus:ring-[#6366f1]/20 bg-white transition-all duration-150 ease-out hover:border-[#6366f1]/50 font-medium"
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
            className="flex items-center gap-2 px-5 py-3 bg-[#64748b] text-white rounded-lg font-medium hover:bg-[#475569] transition-all duration-150 ease-out shadow-sm hover:scale-[1.02]"
          >
            <X className="w-4 h-4" />
            <span>إعادة التعيين</span>
          </button>
        )}
      </div>
    </div>
  )
}

