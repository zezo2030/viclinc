import type { Department } from '@/types/department.types'
import { API_URL } from '@/utils/constants'

interface DepartmentCardProps {
  department: Department
  onEdit?: (department: Department) => void
  onDelete?: (department: Department) => void
  onToggleActive?: (department: Department, isActive: boolean) => void
}

export default function DepartmentCard({ department, onEdit, onDelete, onToggleActive }: DepartmentCardProps) {
  const statusLabel = department.isActive ? 'نشط' : 'غير نشط'
  const statusClass = department.isActive
    ? 'bg-green-50 text-green-700 border-green-200'
    : 'bg-gray-100 text-gray-700 border-gray-200'

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
    <div className="p-4 border rounded-xl bg-white">
      <div className="flex items-start justify-between mb-3">
        <div className={`px-2.5 py-1 rounded-lg text-xs border ${statusClass}`}>{statusLabel}</div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => onEdit?.(department)}
            className="px-3 py-1.5 text-sm bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            تعديل
          </button>
          <button
            onClick={() => onDelete?.(department)}
            className="px-3 py-1.5 text-sm bg-red-50 text-red-700 border border-red-200 rounded-lg hover:bg-red-100"
          >
            حذف
          </button>
        </div>
      </div>
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-lg bg-gray-100 overflow-hidden flex items-center justify-center">
          {department.logoPath ? (
            <img src={resolveLogoUrl(department.logoPath)} alt={department.name} className="w-full h-full object-cover" />
          ) : (
            <span className="text-gray-500 text-sm">لا شعار</span>
          )}
        </div>
        <div className="flex-1 text-right">
          <div className="font-semibold text-gray-900">{department.name}</div>
          {department.description && (
            <div className="text-sm text-gray-500 line-clamp-2">{department.description}</div>
          )}
        </div>
      </div>
      <div className="mt-3">
        <label className="inline-flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={department.isActive}
            onChange={(e) => onToggleActive?.(department, e.target.checked)}
          />
          <span>تفعيل القسم</span>
        </label>
      </div>
    </div>
  )
}


