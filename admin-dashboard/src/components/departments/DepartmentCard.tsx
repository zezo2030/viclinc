import type { Department } from '@/types/department.types'
import { API_URL } from '@/utils/constants'

interface DepartmentCardProps {
  department: Department
  onEdit?: (department: Department) => void
  onDelete?: (department: Department) => void
  onToggleActive?: (department: Department, isActive: boolean) => void
  onViewDetails?: (department: Department) => void
}

export default function DepartmentCard({ department, onEdit, onDelete, onToggleActive, onViewDetails }: DepartmentCardProps) {
  const statusLabel = department.isActive ? 'نشط' : 'غير نشط'
  const statusClass = department.isActive
    ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-lg shadow-green-500/30'
    : 'bg-gradient-to-r from-gray-400 to-gray-500 text-white shadow-lg shadow-gray-400/30'

  const resolveLogoUrl = (path?: string) => {
    if (!path) return undefined
    if (path.startsWith('http')) return path
    try {
      const origin = new URL(API_URL).origin
      if (path.startsWith('/')) return `${origin}${path}`
      return `${origin}/${path}`
    } catch {
      return path
    }
  }

  return (
    <div className="group relative overflow-hidden rounded-2xl border border-gray-100 bg-gradient-to-br from-white to-purple-50/30 p-5 shadow-lg">
      {/* Status Badge */}
      <div className="absolute top-3 left-3 z-10">
        <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold ${statusClass}`}>
          <span className="w-2 h-2 rounded-full bg-white animate-pulse"></span>
          {statusLabel}
        </div>
      </div>

      {/* Department Logo & Info */}
      <div className="mb-4 flex items-start gap-4 pt-8">
        <div className="relative">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-100 to-pink-100 overflow-hidden flex items-center justify-center shadow-lg ring-4 ring-white">
            {department.logoPath ? (
              <img src={resolveLogoUrl(department.logoPath)} alt={department.name} className="w-full h-full object-cover" />
            ) : (
              <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            )}
          </div>
        </div>
        <div className="flex-1 text-right">
          <h3 className="text-lg font-bold text-gray-900 mb-1 line-clamp-1 group-hover:text-purple-600 transition-colors">
            {department.name}
          </h3>
          {department.description && (
            <p className="text-sm text-gray-600 line-clamp-2">{department.description}</p>
          )}
        </div>
      </div>

      {/* Toggle Switch */}
      <div className="mb-4 flex items-center justify-between px-3 py-2.5 rounded-xl bg-white/80 backdrop-blur-sm border border-gray-200">
        <span className="text-sm font-semibold text-gray-700">حالة القسم</span>
        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={department.isActive}
            onChange={(e) => onToggleActive?.(department, e.target.checked)}
            className="sr-only peer"
          />
          <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gradient-to-r peer-checked:from-purple-500 peer-checked:to-pink-500"></div>
        </label>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-2">
        <button
          onClick={() => onViewDetails?.(department)}
          className="flex-1 px-3 py-2.5 text-sm font-semibold bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl shadow-lg shadow-purple-500/30"
        >
          📋 تفاصيل
        </button>
        <button
          onClick={() => onEdit?.(department)}
          className="px-3 py-2.5 text-sm font-semibold bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-xl shadow-lg shadow-blue-500/30"
        >
          ✏️
        </button>
        <button
          onClick={() => onDelete?.(department)}
          className="px-3 py-2.5 text-sm font-semibold bg-gradient-to-r from-red-500 to-rose-500 text-white rounded-xl shadow-lg shadow-red-500/30"
        >
          🗑️
        </button>
      </div>

      {/* Decorative Background Element */}
      <div className="absolute inset-0 opacity-0 pointer-events-none">
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-purple-400/20 to-pink-400/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-br from-blue-400/20 to-cyan-400/20 rounded-full blur-3xl"></div>
      </div>
    </div>
  )
}


