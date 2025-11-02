import type { AppointmentStatus } from '@/types/appointment.types'

export default function AppointmentStatusBadge({ status }: { status: AppointmentStatus }) {
  const map = {
    PENDING_CONFIRM: 'bg-yellow-50 text-yellow-700 border-yellow-200',
    CONFIRMED: 'bg-blue-50 text-blue-700 border-blue-200',
    CANCELLED: 'bg-red-50 text-red-700 border-red-200',
    COMPLETED: 'bg-green-50 text-green-700 border-green-200',
    NO_SHOW: 'bg-orange-50 text-orange-700 border-orange-200',
    REJECTED: 'bg-gray-100 text-gray-700 border-gray-200',
  } as Record<string, string>
  const label = {
    PENDING_CONFIRM: 'قيد التأكيد',
    CONFIRMED: 'مؤكد',
    CANCELLED: 'ملغى',
    COMPLETED: 'مكتمل',
    NO_SHOW: 'عدم حضور',
    REJECTED: 'مرفوض',
  } as Record<string, string>
  return (
    <span className={`px-2.5 py-1 rounded-lg text-xs border ${map[status] || ''}`}>{label[status] || status}</span>
  )
}


