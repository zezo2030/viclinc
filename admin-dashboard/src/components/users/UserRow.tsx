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
    <tr className="border-b border-gray-200 hover:bg-gray-50 transition-colors">
      {/* Name */}
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="font-medium text-gray-900">{user.name}</div>
      </td>

      {/* Email */}
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-sm text-gray-600">{user.email}</div>
      </td>

      {/* Phone */}
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-sm text-gray-600">{user.phone}</div>
      </td>

      {/* Role */}
      <td className="px-6 py-4 whitespace-nowrap">
        <select
          value={user.role}
          onChange={(e) => onRoleChange?.(user, e.target.value as UserRole)}
          className="px-3 py-1 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white"
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
          className="px-3 py-1 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white"
        >
          <option value={UserStatus.ACTIVE}>نشط</option>
          <option value={UserStatus.DISABLED}>معطل</option>
          <option value={UserStatus.PENDING_DELETE}>قيد الحذف</option>
        </select>
      </td>

      {/* Created At */}
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-sm text-gray-600">{formatDate(user.createdAt)}</div>
      </td>

      {/* Actions */}
      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
        <div className="flex items-center gap-2 justify-end">
          <button
            onClick={() => onEdit?.(user)}
            className="text-primary-600 hover:text-primary-900 p-2 rounded-lg hover:bg-primary-50 transition-colors"
            title="تعديل"
          >
            <Edit className="w-4 h-4" />
          </button>
          <button
            onClick={() => onDelete?.(user)}
            className="text-orange-600 hover:text-orange-900 p-2 rounded-lg hover:bg-orange-50 transition-colors"
            title="وضع علامة للحذف"
          >
            <Trash2 className="w-4 h-4" />
          </button>
          {user.status === UserStatus.PENDING_DELETE && onHardDelete && (
            <button
              onClick={() => onHardDelete(user)}
              className="text-red-600 hover:text-red-900 p-2 rounded-lg hover:bg-red-50 transition-colors"
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

