import { useMemo, useState } from 'react'
import { usePayments } from '@/hooks/usePayments'
import type { Payment, PaymentMethod, PaymentStatus } from '@/api/payments'
import { PaymentStatusBadge } from './PaymentStatusBadge'

interface Props {
  onSelectPayment?: (payment: Payment) => void
}

const statusOptions: PaymentStatus[] = ['PENDING', 'COMPLETED', 'FAILED', 'REFUNDED']
const methodOptions: PaymentMethod[] = ['CREDIT_CARD', 'DEBIT_CARD', 'BANK_TRANSFER', 'DIGITAL_WALLET']

export function PaymentsTable({ onSelectPayment }: Props) {
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState<PaymentStatus | ''>('')
  const [method, setMethod] = useState<PaymentMethod | ''>('')
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(10)

  const params = useMemo(
    () => ({ search: search || undefined, status: (status as any) || undefined, method: (method as any) || undefined, page, limit }),
    [search, status, method, page, limit]
  )

  const { data, isLoading, isError, refetch } = usePayments(params)

  const payments = data?.data || []
  const meta = data?.meta

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-center">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="بحث (transaction/intent/المريض/الطبيب)"
          className="border rounded px-3 py-2 w-64"
        />
        <select value={status} onChange={(e) => setStatus(e.target.value as any)} className="border rounded px-3 py-2">
          <option value="">كل الحالات</option>
          {statusOptions.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
        <select value={method} onChange={(e) => setMethod(e.target.value as any)} className="border rounded px-3 py-2">
          <option value="">كل الطرق</option>
          {methodOptions.map((m) => (
            <option key={m} value={m}>{m}</option>
          ))}
        </select>
        <button onClick={() => refetch()} className="px-4 py-2 bg-gray-100 rounded">تطبيق</button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto border rounded">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">المريض</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">الطبيب/الموعد</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">المبلغ</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">الحالة</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">التاريخ</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500">إجراءات</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {isLoading && (
              <tr><td colSpan={6} className="px-4 py-6 text-center text-gray-500">جاري التحميل...</td></tr>
            )}
            {isError && !isLoading && (
              <tr><td colSpan={6} className="px-4 py-6 text-center text-red-600">حدث خطأ أثناء التحميل</td></tr>
            )}
            {!isLoading && !isError && payments.length === 0 && (
              <tr><td colSpan={6} className="px-4 py-6 text-center text-gray-500">لا توجد نتائج</td></tr>
            )}
            {payments.map((p) => (
              <tr key={p.id} className="hover:bg-gray-50">
                <td className="px-4 py-3">{p.patient?.name || '-'}</td>
                <td className="px-4 py-3">{p.doctor?.name || '-'}{p.appointment?.startAt ? ` • ${new Date(p.appointment.startAt).toLocaleString()}` : ''}</td>
                <td className="px-4 py-3 font-medium">{p.amount} {p.currency}</td>
                <td className="px-4 py-3"><PaymentStatusBadge status={p.status} /></td>
                <td className="px-4 py-3">{new Date(p.createdAt).toLocaleString()}</td>
                <td className="px-4 py-3">
                  <button onClick={() => onSelectPayment?.(p)} className="text-primary-600 hover:underline">تفاصيل</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {!!meta && meta.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">المجموع: {meta.total}</span>
          <div className="flex items-center gap-2">
            <button disabled={page <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))} className="px-3 py-1 border rounded disabled:opacity-50">السابق</button>
            <span className="text-sm">صفحة {meta.page} من {meta.totalPages}</span>
            <button disabled={meta.page >= meta.totalPages} onClick={() => setPage((p) => p + 1)} className="px-3 py-1 border rounded disabled:opacity-50">التالي</button>
          </div>
        </div>
      )}
    </div>
  )
}


