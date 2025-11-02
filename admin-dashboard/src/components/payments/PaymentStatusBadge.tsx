import type { PaymentStatus } from '@/api/payments'

interface Props {
  status: PaymentStatus
}

const colors: Record<PaymentStatus, string> = {
  PENDING: 'bg-yellow-100 text-yellow-800',
  COMPLETED: 'bg-green-100 text-green-800',
  FAILED: 'bg-red-100 text-red-800',
  REFUNDED: 'bg-blue-100 text-blue-800',
}

export function PaymentStatusBadge({ status }: Props) {
  const cls = colors[status] || 'bg-gray-100 text-gray-800'
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded text-xs font-medium ${cls}`}>
      {status}
    </span>
  )
}


