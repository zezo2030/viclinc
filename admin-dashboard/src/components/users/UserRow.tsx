import { Edit, Trash2, Trash, MoreVertical } from 'lucide-react'
import { format } from 'date-fns'
import { ar } from 'date-fns/locale'
import type { UserRowProps } from '../../types/user.types'
import { UserRole, UserStatus } from '../../types/user.types'
import UserStatusBadge from './UserStatusBadge'

const roleLabels = {
  [UserRole.ADMIN]: 'مدير',
  [UserRole.DOCTOR]: 'طبيب',
  [UserRole.PATIENT]: 'مريض',
}

export default function UserRow({
  user,
  onEdit,
  onDelete,
  onHardDelete,
  onStatusChange,
  onRoleChange,
}: UserRowProps) {
  const formatDate = (date: string) => {
    try {
      return format(new Date(date), 'dd/MM/yyyy', { locale: ar })
    } catch {
      return date
    }
  }

  return (
    <tr className="border-b border-[#e2e8f0] hover:bg-[#f8fafc] transition-all duration-150 ease-out group">
      {/* Name */}
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="font-semibold text-[#0f172a] group-hover:text-[#6366f1] transition-colors duration-150">{user.name}</div>
      </td>

      {/* Email */}
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-sm font-medium text-[#64748b]">{user.email}</div>
      </td>

      {/* Phone */}
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-sm font-medium text-[#64748b]">{user.phone || 'غير متوفر'}</div>
      </td>

      {/* Role */}
      <td className="px-6 py-4 whitespace-nowrap">
        <select
          value={user.role}
          onChange={(e) => onRoleChange?.(user, e.target.value as UserRole)}
          className="px-3 py-1.5 text-sm font-medium border border-[#e2e8f0] rounded-lg focus:ring-2 focus:ring-[#6366f1] focus:border-[#6366f1] bg-white hover:border-[#6366f1]/50 transition-all duration-150 ease-out"
        >
          <option value={UserRole.ADMIN}>{roleLabels[UserRole.ADMIN]}</option>
          <option value={UserRole.DOCTOR}>{roleLabels[UserRole.DOCTOR]}</option>
          <option value={UserRole.PATIENT}>{roleLabels[UserRole.PATIENT]}</option>
        </select>
      </td>

      {/* Status */}
      <td className="px-6 py-4 whitespace-nowrap">
        <select
          value={user.status}
          onChange={(e) => onStatusChange?.(user, e.target.value as UserStatus)}
          className="px-3 py-1.5 text-sm font-medium border border-[#e2e8f0] rounded-lg focus:ring-2 focus:ring-[#6366f1] focus:border-[#6366f1] bg-white hover:border-[#6366f1]/50 transition-all duration-150 ease-out"
        >
          <option value={UserStatus.ACTIVE}>نشط</option>
          <option value={UserStatus.DISABLED}>معطل</option>
          <option value={UserStatus.PENDING_DELETE}>قيد الحذف</option>
        </select>
      </td>

      {/* Created At */}
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-sm font-medium text-[#64748b]">{formatDate(user.createdAt)}</div>
      </td>

      {/* Actions */}
      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
        <div className="flex items-center gap-2 justify-end">
          <button
            onClick={() => onEdit?.(user)}
            className="p-2 rounded-lg bg-[#6366f1] text-white hover:bg-[#4f46e5] transition-all duration-150 ease-out shadow-sm hover:scale-[1.02]"
            title="تعديل"
          >
            <Edit className="w-4 h-4" />
          </button>
          <button
            onClick={() => onDelete?.(user)}
            className="p-2 rounded-lg bg-[#f59e0b] text-white hover:bg-[#d97706] transition-all duration-150 ease-out shadow-sm hover:scale-[1.02]"
            title="وضع علامة للحذف"
          >
            <Trash2 className="w-4 h-4" />
          </button>
          {user.status === UserStatus.PENDING_DELETE && onHardDelete && (
            <button
              onClick={() => onHardDelete(user)}
              className="p-2 rounded-lg bg-[#ef4444] text-white hover:bg-[#dc2626] transition-all duration-150 ease-out shadow-sm hover:scale-[1.02]"
              title="حذف نهائي"
            >
              <Trash className="w-4 h-4" />
            </button>
          )}
        </div>
      </td>
    </tr>
  )
}

