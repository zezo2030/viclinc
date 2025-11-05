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
    <tr className="border-b border-gray-200 hover:bg-gradient-to-r hover:from-blue-50/50 hover:to-cyan-50/50 transition-all duration-300 group">
      {/* Name */}
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="font-bold text-gray-900 group-hover:text-blue-600 transition-colors">{user.name}</div>
      </td>

      {/* Email */}
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-sm font-medium text-gray-600">{user.email}</div>
      </td>

      {/* Phone */}
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-sm font-medium text-gray-600">{user.phone || 'غير متوفر'}</div>
      </td>

      {/* Role */}
      <td className="px-6 py-4 whitespace-nowrap">
        <select
          value={user.role}
          onChange={(e) => onRoleChange?.(user, e.target.value as UserRole)}
          className="px-3 py-1.5 text-sm font-semibold border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white hover:border-blue-300 transition-all duration-300"
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
          className="px-3 py-1.5 text-sm font-semibold border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white hover:border-blue-300 transition-all duration-300"
        >
          <option value={UserStatus.ACTIVE}>نشط</option>
          <option value={UserStatus.DISABLED}>معطل</option>
          <option value={UserStatus.PENDING_DELETE}>قيد الحذف</option>
        </select>
      </td>

      {/* Created At */}
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-sm font-medium text-gray-600">{formatDate(user.createdAt)}</div>
      </td>

      {/* Actions */}
      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
        <div className="flex items-center gap-2 justify-end">
          <button
            onClick={() => onEdit?.(user)}
            className="p-2 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-500 text-white hover:scale-110 transition-all duration-300 shadow-lg shadow-blue-500/30 hover:shadow-xl"
            title="تعديل"
          >
            <Edit className="w-4 h-4" />
          </button>
          <button
            onClick={() => onDelete?.(user)}
            className="p-2 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 text-white hover:scale-110 transition-all duration-300 shadow-lg shadow-orange-500/30 hover:shadow-xl"
            title="وضع علامة للحذف"
          >
            <Trash2 className="w-4 h-4" />
          </button>
          {user.status === UserStatus.PENDING_DELETE && onHardDelete && (
            <button
              onClick={() => onHardDelete(user)}
              className="p-2 rounded-xl bg-gradient-to-r from-red-500 to-rose-500 text-white hover:scale-110 transition-all duration-300 shadow-lg shadow-red-500/30 hover:shadow-xl"
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

