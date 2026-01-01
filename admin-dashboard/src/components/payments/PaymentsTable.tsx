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
      <div className="flex flex-wrap gap-3 items-center p-4 bg-[#E8E8E8] rounded-xl">
        <div className="relative flex-1 min-w-[200px]">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="بحث (transaction/intent/المريض/الطبيب)"
            className="w-full border-2 border-gray-200 rounded-xl px-4 py-2.5 pr-12 focus:border-[#D62828] focus:ring-2 focus:ring-[#D62828]/20 transition-all duration-300 bg-white hover:border-gray-300"
          />
          <svg className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        <select 
          value={status} 
          onChange={(e) => setStatus(e.target.value as any)} 
          className="border-2 border-gray-200 rounded-xl px-4 py-2.5 focus:border-[#D62828] focus:ring-2 focus:ring-[#D62828]/20 transition-all duration-300 bg-white hover:border-gray-300 font-medium"
        >
          <option value="">كل الحالات</option>
          {statusOptions.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
        <select 
          value={method} 
          onChange={(e) => setMethod(e.target.value as any)} 
          className="border-2 border-gray-200 rounded-xl px-4 py-2.5 focus:border-[#D62828] focus:ring-2 focus:ring-[#D62828]/20 transition-all duration-300 bg-white hover:border-gray-300 font-medium"
        >
          <option value="">كل الطرق</option>
          {methodOptions.map((m) => (
            <option key={m} value={m}>{m}</option>
          ))}
        </select>
        <button 
          onClick={() => refetch()} 
          className="px-6 py-2.5 bg-[#D62828] text-white rounded-xl font-semibold hover:bg-[#b91c1c] transition-all duration-300 shadow-lg shadow-[#D62828]/30 hover:scale-105"
        >
          تطبيق
        </button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-xl border border-gray-200">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-[#E8E8E8]">
            <tr>
              <th className="px-6 py-4 text-right text-xs font-bold text-[#213F6A] uppercase tracking-wider">المريض</th>
              <th className="px-6 py-4 text-right text-xs font-bold text-[#213F6A] uppercase tracking-wider">الطبيب/الموعد</th>
              <th className="px-6 py-4 text-right text-xs font-bold text-[#213F6A] uppercase tracking-wider">المبلغ</th>
              <th className="px-6 py-4 text-right text-xs font-bold text-[#213F6A] uppercase tracking-wider">الحالة</th>
              <th className="px-6 py-4 text-right text-xs font-bold text-[#213F6A] uppercase tracking-wider">التاريخ</th>
              <th className="px-6 py-4 text-right text-xs font-bold text-[#213F6A] uppercase tracking-wider">إجراءات</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {isLoading && (
              <tr><td colSpan={6} className="px-6 py-8 text-center text-[#333333]">جاري التحميل...</td></tr>
            )}
            {isError && !isLoading && (
              <tr><td colSpan={6} className="px-6 py-8 text-center text-[#D62828]">حدث خطأ أثناء التحميل</td></tr>
            )}
            {!isLoading && !isError && payments.length === 0 && (
              <tr><td colSpan={6} className="px-6 py-8 text-center text-[#333333]">لا توجد نتائج</td></tr>
            )}
            {payments.map((p) => (
              <tr key={p.id} className="hover:bg-[#E8E8E8]/50 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-[#213F6A]">{p.patient?.name || '-'}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-[#333333]">{p.doctor?.name || '-'}{p.appointment?.startAt ? ` • ${new Date(p.appointment.startAt).toLocaleString()}` : ''}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-[#213F6A]">{p.amount} {p.currency}</td>
                <td className="px-6 py-4 whitespace-nowrap"><PaymentStatusBadge status={p.status} /></td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-[#333333]">{new Date(p.createdAt).toLocaleString()}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <button 
                    onClick={() => onSelectPayment?.(p)} 
                    className="px-4 py-2 text-sm font-semibold text-[#D62828] hover:bg-[#D62828]/10 rounded-xl transition-all duration-300 hover:scale-105"
                  >
                    تفاصيل
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {!!meta && meta.totalPages > 1 && (
        <div className="flex items-center justify-between pt-4 border-t border-gray-200">
          <span className="text-sm font-semibold text-[#333333]">المجموع: <span className="text-[#D62828]">{meta.total}</span></span>
          <div className="flex items-center gap-2">
            <button 
              disabled={page <= 1} 
              onClick={() => setPage((p) => Math.max(1, p - 1))} 
              className="px-4 py-2 text-sm font-semibold text-[#213F6A] bg-white border-2 border-gray-200 rounded-xl hover:border-[#D62828] hover:bg-[#D62828]/10 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              السابق
            </button>
            <span className="text-sm font-semibold text-[#213F6A] px-4">صفحة {meta.page} من {meta.totalPages}</span>
            <button 
              disabled={meta.page >= meta.totalPages} 
              onClick={() => setPage((p) => p + 1)} 
              className="px-4 py-2 text-sm font-semibold text-[#213F6A] bg-white border-2 border-gray-200 rounded-xl hover:border-[#D62828] hover:bg-[#D62828]/10 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              التالي
            </button>
          </div>
        </div>
      )}
    </div>
  )
}


