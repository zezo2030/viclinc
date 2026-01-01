import { useState, useMemo } from 'react'
import { CreditCard, DollarSign, TrendingUp, AlertCircle } from 'lucide-react'
import AdminLayout from '@/components/layout/AdminLayout'
import Breadcrumbs from '@/components/layout/Breadcrumbs'
import { PaymentsTable } from '@/components/payments/PaymentsTable'
import { PaymentDetails } from '@/components/payments/PaymentDetails'
import RevenueChart from '@/components/dashboard/RevenueChart'
import MetricCard from '@/components/dashboard/MetricCard'
import type { Payment } from '@/api/payments'
import { usePayments } from '@/hooks/usePayments'

export default function Payments() {
  const [selected, setSelected] = useState<Payment | null>(null)
  const { data: paymentsData } = usePayments({ limit: 1000 })

  const payments = paymentsData?.data || []
  const meta = paymentsData?.meta

  // Calculate metrics
  const metrics = useMemo(() => {
    const total = payments.reduce((sum, p) => sum + (p.amount || 0), 0)
    const completed = payments.filter((p) => p.status === 'COMPLETED')
    const pending = payments.filter((p) => p.status === 'PENDING')
    const failed = payments.filter((p) => p.status === 'FAILED')
    const completedTotal = completed.reduce((sum, p) => sum + (p.amount || 0), 0)

    return {
      totalRevenue: completedTotal,
      totalPayments: payments.length,
      pendingPayments: pending.length,
      failedPayments: failed.length,
    }
  }, [payments])

  return (
    <AdminLayout>
      <Breadcrumbs />

      {/* Welcome Header with Gradient */}
      <div className="mb-8 relative overflow-hidden rounded-2xl bg-[#D62828] p-8 shadow-2xl">
        <div className="relative z-10">
          <h1 className="text-4xl font-black text-white drop-shadow-lg">
            إدارة المدفوعات
          </h1>
          <p className="mt-2 text-lg font-medium text-white/90">
            عرض وإدارة جميع المعاملات المالية والمدفوعات
          </p>
        </div>
        {/* Decorative Elements */}
        <div className="absolute top-0 left-0 w-64 h-64 bg-white/10 rounded-full -translate-x-32 -translate-y-32 blur-3xl"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-white/10 rounded-full translate-x-32 translate-y-32 blur-3xl"></div>
      </div>

      {/* Metrics Overview */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="h-1 w-1 rounded-full bg-[#D62828]"></div>
          <h2 className="text-xl font-bold text-[#213F6A]">المؤشرات الرئيسية</h2>
          <div className="h-0.5 flex-1 bg-[#D62828] opacity-20"></div>
        </div>
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4">
          <MetricCard
            title="إجمالي الإيرادات"
            value={`${metrics.totalRevenue.toFixed(2)} ر.س`}
            icon={<DollarSign className="h-6 w-6" />}
            variant="success"
          />
          <MetricCard
            title="إجمالي المدفوعات"
            value={metrics.totalPayments}
            icon={<CreditCard className="h-6 w-6" />}
            variant="primary"
          />
          <MetricCard
            title="المدفوعات المعلقة"
            value={metrics.pendingPayments}
            icon={<AlertCircle className="h-6 w-6" />}
            variant="warning"
          />
          <MetricCard
            title="المدفوعات الفاشلة"
            value={metrics.failedPayments}
            icon={<TrendingUp className="h-6 w-6" />}
            variant="danger"
          />
          </div>
        </div>

      {/* Charts and Table */}
      <div className="mb-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
            <RevenueChart />
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-lg">
          <div className="mb-6 flex items-center gap-3">
            <div className="h-1 w-1 rounded-full bg-[#D62828]"></div>
            <h3 className="text-xl font-bold text-[#213F6A]">إحصائيات سريعة</h3>
            <div className="h-1 flex-1 rounded-full bg-[#D62828] opacity-20"></div>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-[#E8E8E8] rounded-xl">
              <span className="text-sm font-semibold text-[#333333]">إجمالي المعاملات</span>
              <span className="text-lg font-bold text-[#213F6A]">{meta?.total || 0}</span>
            </div>
            <div className="flex items-center justify-between p-4 bg-[#E8E8E8] rounded-xl">
              <span className="text-sm font-semibold text-[#333333]">المتوسط اليومي</span>
              <span className="text-lg font-bold text-[#D62828]">
                {meta?.total ? (metrics.totalRevenue / meta.total).toFixed(2) : '0.00'} ر.س
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Payments Table */}
      <div className="mb-8">
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-lg">
          <div className="mb-6 flex items-center gap-3">
            <div className="h-1 w-1 rounded-full bg-[#D62828]"></div>
            <h3 className="text-xl font-bold text-[#213F6A]">قائمة المدفوعات</h3>
            <div className="h-1 flex-1 rounded-full bg-[#D62828] opacity-20"></div>
          </div>
          <PaymentsTable onSelectPayment={(p) => setSelected(p)} />
        </div>
      </div>

      {selected && (
        <PaymentDetails paymentId={selected.id} onClose={() => setSelected(null)} />
      )}
    </AdminLayout>
  )
}


