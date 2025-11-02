import { useMemo, useState } from 'react'
import { usePayment, useRefundPayment } from '@/hooks/usePayments'
import { PaymentStatusBadge } from './PaymentStatusBadge'

interface Props {
  paymentId?: string
  onClose?: () => void
}

export function PaymentDetails({ paymentId, onClose }: Props) {
  const { data, isLoading, isError } = usePayment(paymentId)
  const refundMutation = useRefundPayment()
  const [reason, setReason] = useState('')

  const canRefund = useMemo(() => data && data.status !== 'REFUNDED' && data.status !== 'FAILED', [data])

  if (!paymentId) return null

  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">تفاصيل الدفع</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">إغلاق</button>
        </div>

        {isLoading && <div className="py-10 text-center text-gray-500">جاري التحميل...</div>}
        {isError && <div className="py-10 text-center text-red-600">فشل تحميل التفاصيل</div>}

        {data && (
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="text-2xl font-bold">{data.amount} {data.currency}</div>
              <PaymentStatusBadge status={data.status} />
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <div className="text-gray-500">الموعد</div>
                <div>{data.appointment?.startAt ? new Date(data.appointment.startAt).toLocaleString() : '-'}</div>
              </div>
              <div>
                <div className="text-gray-500">الطريقة</div>
                <div>{data.paymentMethod}</div>
              </div>
              <div>
                <div className="text-gray-500">Transaction ID</div>
                <div>{data.transactionId || '-'}</div>
              </div>
              <div>
                <div className="text-gray-500">Intent ID</div>
                <div>{data.intentId || '-'}</div>
              </div>
              <div>
                <div className="text-gray-500">المريض</div>
                <div>{data.patient?.name || '-'}</div>
              </div>
              <div>
                <div className="text-gray-500">الطبيب</div>
                <div>{data.doctor?.name || '-'}</div>
              </div>
              <div>
                <div className="text-gray-500">تاريخ الإنشاء</div>
                <div>{new Date(data.createdAt).toLocaleString()}</div>
              </div>
              <div>
                <div className="text-gray-500">آخر تحديث</div>
                <div>{new Date(data.updatedAt).toLocaleString()}</div>
              </div>
            </div>

            <div className="border-t pt-4">
              <div className="text-sm font-medium mb-2">استرداد المبلغ (Refund)</div>
              <div className="flex items-center gap-3">
                <input
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  maxLength={500}
                  placeholder="سبب اختياري"
                  className="border rounded px-3 py-2 flex-1"
                />
                <button
                  disabled={!canRefund || refundMutation.isPending}
                  onClick={() => {
                    if (!paymentId) return
                    if (!window.confirm('تأكيد استرداد المبلغ؟')) return
                    refundMutation.mutate({ id: paymentId, reason })
                  }}
                  className="px-4 py-2 bg-red-600 text-white rounded disabled:opacity-50"
                >
                  {refundMutation.isPending ? 'جارٍ التنفيذ...' : 'استرداد'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}


