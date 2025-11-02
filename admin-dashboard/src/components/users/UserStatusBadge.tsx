import { UserStatus } from '../../types/user.types'

interface UserStatusBadgeProps {
  status: UserStatus
}

const statusColors = {
  [UserStatus.ACTIVE]: 'bg-green-100 text-green-800 border-green-200',
  [UserStatus.DISABLED]: 'bg-gray-100 text-gray-800 border-gray-200',
  [UserStatus.PENDING_DELETE]: 'bg-red-100 text-red-800 border-red-200',
}

const statusLabels = {
  [UserStatus.ACTIVE]: 'نشط',
  [UserStatus.DISABLED]: 'معطل',
  [UserStatus.PENDING_DELETE]: 'قيد الحذف',
}

export default function UserStatusBadge({ status }: UserStatusBadgeProps) {
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${statusColors[status]}`}
    >
      {statusLabels[status]}
    </span>
  )
}

