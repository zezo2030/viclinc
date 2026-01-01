import { useState, useEffect } from 'react'
import type { AppointmentStatus, AppointmentType } from '@/types/appointment.types'

interface AppointmentFiltersValue {
  status?: AppointmentStatus | 'ALL'
  type?: AppointmentType | 'ALL'
  doctorId?: string
  patientId?: string
  startDate?: string
  endDate?: string
  search?: string
}

interface AppointmentFiltersProps {
  value: AppointmentFiltersValue
  onChange: (value: AppointmentFiltersValue) => void
  onReset: () => void
}

export default function AppointmentFilters({ value, onChange, onReset }: AppointmentFiltersProps) {
  const [searchTerm, setSearchTerm] = useState(value.search || '')

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchTerm !== (value.search || '')) {
        onChange({ ...value, search: searchTerm || undefined })
      }
    }, 500)

    return () => clearTimeout(timer)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTerm])

  // Sync searchTerm with value.search when it changes externally (e.g., from reset)
  useEffect(() => {
    if (value.search !== searchTerm) {
      setSearchTerm(value.search || '')
    }
  }, [value.search])

  const hasActiveFilters = value.status !== 'ALL' || value.type !== 'ALL' || value.search || value.startDate || value.endDate

  return (
    <div className="mb-6 rounded-xl bg-white p-6 shadow-lg border border-gray-200">
      <div className="flex items-center gap-3 mb-4">
        <div className="h-1 w-1 rounded-full bg-[#D62828]"></div>
        <h3 className="text-lg font-bold text-[#213F6A]">البحث والتصفية</h3>
        <div className="h-0.5 flex-1 bg-[#D62828] opacity-20"></div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {/* Search */}
        <div className="relative md:col-span-2 lg:col-span-1">
          <input
            className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 pr-12 focus:border-[#D62828] focus:ring-2 focus:ring-[#D62828]/20 transition-all duration-300 bg-white/70 backdrop-blur-sm hover:border-gray-300"
            placeholder="بحث بالمريض/الطبيب..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <svg className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>

        {/* Status Filter */}
        <div>
          <select
            className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:border-[#D62828] focus:ring-2 focus:ring-[#D62828]/20 transition-all duration-300 bg-white/70 backdrop-blur-sm hover:border-gray-300 font-medium"
            value={value.status || 'ALL'}
            onChange={(e) => onChange({ ...value, status: e.target.value as any })}
          >
            <option value="ALL">🔵 كل الحالات</option>
            <option value="PENDING_CONFIRM">⏳ قيد التأكيد</option>
            <option value="CONFIRMED">✅ مؤكد</option>
            <option value="CANCELLED">❌ ملغى</option>
            <option value="COMPLETED">✅ مكتمل</option>
            <option value="NO_SHOW">🚫 عدم حضور</option>
            <option value="REJECTED">⛔ مرفوض</option>
          </select>
        </div>

        {/* Type Filter */}
        <div>
          <select
            className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:border-[#D62828] focus:ring-2 focus:ring-[#D62828]/20 transition-all duration-300 bg-white/70 backdrop-blur-sm hover:border-gray-300 font-medium"
            value={value.type || 'ALL'}
            onChange={(e) => onChange({ ...value, type: e.target.value as any })}
          >
            <option value="ALL">🔵 كل الأنواع</option>
            <option value="IN_PERSON">🏥 حضورى</option>
            <option value="VIDEO">📹 فيديو</option>
            <option value="CHAT">💬 شات</option>
          </select>
        </div>

        {/* Start Date */}
        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1">من تاريخ</label>
          <input
            type="date"
            className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:border-[#D62828] focus:ring-2 focus:ring-[#D62828]/20 transition-all duration-300 bg-white/70 backdrop-blur-sm hover:border-gray-300 font-medium"
            value={value.startDate || ''}
            onChange={(e) => onChange({ ...value, startDate: e.target.value })}
          />
        </div>

        {/* End Date */}
        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1">إلى تاريخ</label>
          <input
            type="date"
            className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:border-[#D62828] focus:ring-2 focus:ring-[#D62828]/20 transition-all duration-300 bg-white/70 backdrop-blur-sm hover:border-gray-300 font-medium"
            value={value.endDate || ''}
            onChange={(e) => onChange({ ...value, endDate: e.target.value })}
          />
        </div>

        {/* Reset Button */}
        {hasActiveFilters && (
          <div className="flex items-end">
            <button 
              onClick={() => {
                setSearchTerm('')
                onReset()
              }} 
              className="w-full px-5 py-3 bg-[#213F6A] text-white rounded-xl font-semibold hover:bg-[#1e3a8a] hover:scale-105 transition-all duration-300 shadow-lg shadow-[#213F6A]/30 hover:shadow-xl flex items-center justify-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
              <span>إعادة التعيين</span>
            </button>
          </div>
        )}
      </div>
    </div>
  )
}


