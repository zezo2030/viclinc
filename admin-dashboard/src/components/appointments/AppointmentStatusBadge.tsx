import type { AppointmentStatus } from '@/types/appointment.types'

export default function AppointmentStatusBadge({ status }: { status: AppointmentStatus }) {
  const map = {
    PENDING_CONFIRM: 'bg-[#f59e0b]/10 text-[#f59e0b] border-[#f59e0b]/20',
    CONFIRMED: 'bg-[#10b981]/10 text-[#10b981] border-[#10b981]/20',
    CANCELLED: 'bg-[#ef4444]/10 text-[#ef4444] border-[#ef4444]/20',
    COMPLETED: 'bg-[#6366f1]/10 text-[#6366f1] border-[#6366f1]/20',
    NO_SHOW: 'bg-[#64748b]/10 text-[#64748b] border-[#64748b]/20',
    REJECTED: 'bg-[#ef4444]/10 text-[#ef4444] border-[#ef4444]/20',
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


