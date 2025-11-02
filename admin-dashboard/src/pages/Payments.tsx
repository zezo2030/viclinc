import { useState } from 'react'
import AdminLayout from '@/components/layout/AdminLayout'
import Breadcrumbs from '@/components/layout/Breadcrumbs'
import { PaymentsTable } from '@/components/payments/PaymentsTable'
import { PaymentDetails } from '@/components/payments/PaymentDetails'
import { RevenueChart } from '@/components/payments/RevenueChart'
import type { Payment } from '@/api/payments'

export default function Payments() {
  const [selected, setSelected] = useState<Payment | null>(null)

  return (
    <AdminLayout>
      <Breadcrumbs />

      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">المدفوعات</h1>
        <p className="mt-1 text-gray-600">إدارة المعاملات، التفاصيل، والاسترداد</p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-4">
            <PaymentsTable onSelectPayment={(p) => setSelected(p)} />
          </div>
        </div>
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-4">
            <RevenueChart />
          </div>
        </div>
      </div>

      {selected && (
        <PaymentDetails paymentId={selected.id} onClose={() => setSelected(null)} />
      )}
    </AdminLayout>
  )
}


