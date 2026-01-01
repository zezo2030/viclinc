import type { PaymentStatus } from '@/api/payments'

interface Props {
  status: PaymentStatus
}

const colors: Record<PaymentStatus, string> = {
  PENDING: 'bg-amber-100 text-amber-800 border border-amber-200',
  COMPLETED: 'bg-green-100 text-green-800 border border-green-200',
  FAILED: 'bg-[#D62828]/10 text-[#D62828] border border-[#D62828]/30',
  REFUNDED: 'bg-[#213F6A]/10 text-[#213F6A] border border-[#213F6A]/30',
}

const labels: Record<PaymentStatus, string> = {
  PENDING: 'معلق',
  COMPLETED: 'مكتمل',
  FAILED: 'فاشل',
  REFUNDED: 'مسترد',
}

export function PaymentStatusBadge({ status }: Props) {
  const cls = colors[status] || 'bg-gray-100 text-gray-800 border border-gray-200'
  const label = labels[status] || status
  return (
    <span className={`inline-flex items-center px-3 py-1.5 rounded-xl text-xs font-bold ${cls}`}>
      {label}
    </span>
  )
}


