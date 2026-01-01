import type { Department } from '@/types/department.types'
import { API_URL } from '@/utils/constants'
import { Building2, FileText, Edit, Trash2 } from 'lucide-react'

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
    ? 'bg-[#10b981] text-white shadow-sm'
    : 'bg-[#64748b] text-white shadow-sm'

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
    <div className="group relative overflow-hidden rounded-xl border border-[#e2e8f0] bg-white p-5 shadow-sm hover:shadow-sm transition-all duration-150 ease-out">
      {/* Status Badge */}
      <div className="absolute top-3 left-3 z-10">
        <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium ${statusClass}`}>
          <span className="w-2 h-2 rounded-full bg-white"></span>
          {statusLabel}
        </div>
      </div>

      {/* Department Logo & Info */}
      <div className="mb-4 flex items-start gap-4 pt-8">
        <div className="relative">
          <div className="w-16 h-16 rounded-lg bg-[#f8fafc] overflow-hidden flex items-center justify-center shadow-sm border border-[#e2e8f0]">
            {department.logoPath ? (
              <img src={resolveLogoUrl(department.logoPath)} alt={department.name} className="w-full h-full object-cover" />
            ) : (
              <Building2 className="w-8 h-8 text-[#6366f1]" />
            )}
          </div>
        </div>
        <div className="flex-1 text-right">
          <h3 className="text-lg font-semibold text-[#0f172a] mb-1 line-clamp-1 group-hover:text-[#6366f1] transition-colors duration-150">
            {department.name}
          </h3>
          {department.description && (
            <p className="text-sm text-[#64748b] line-clamp-2">{department.description}</p>
          )}
        </div>
      </div>

      {/* Toggle Switch */}
      <div className="mb-4 flex items-center justify-between px-3 py-2.5 rounded-lg bg-[#f8fafc] border border-[#e2e8f0]">
        <span className="text-sm font-medium text-[#0f172a]">حالة القسم</span>
        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={department.isActive}
            onChange={(e) => onToggleActive?.(department, e.target.checked)}
            className="sr-only peer"
          />
          <div className="w-11 h-6 bg-[#e2e8f0] peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-[#6366f1]/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-[#e2e8f0] after:border after:rounded-full after:h-5 after:w-5 after:transition-all duration-150 ease-out peer-checked:bg-[#6366f1]"></div>
        </label>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-2">
        <button
          onClick={() => onViewDetails?.(department)}
          className="flex-1 px-3 py-2.5 text-sm font-medium bg-[#6366f1] text-white rounded-lg shadow-sm hover:bg-[#4f46e5] transition-colors duration-150 ease-out flex items-center justify-center gap-1"
        >
          <FileText className="w-4 h-4" />
          <span>تفاصيل</span>
        </button>
        <button
          onClick={() => onEdit?.(department)}
          className="px-3 py-2.5 text-sm font-medium bg-[#8b5cf6] text-white rounded-lg shadow-sm hover:bg-[#7e22ce] transition-colors duration-150 ease-out"
          title="تعديل"
        >
          <Edit className="w-4 h-4" />
        </button>
        <button
          onClick={() => onDelete?.(department)}
          className="px-3 py-2.5 text-sm font-medium bg-[#ef4444] text-white rounded-lg shadow-sm hover:bg-[#dc2626] transition-colors duration-150 ease-out"
          title="حذف"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}


