import AdminLayout from '@/components/layout/AdminLayout'
import Breadcrumbs from '@/components/layout/Breadcrumbs'
import MetricsOverview from '@/components/dashboard/MetricsOverview'
import AppointmentChart from '@/components/dashboard/AppointmentChart'
import RevenueChart from '@/components/dashboard/RevenueChart'
import QuickActions from '@/components/dashboard/QuickActions'

export default function Dashboard() {
  return (
    <AdminLayout>
      <Breadcrumbs />

      {/* Welcome Header */}
      <div className="mb-8 relative overflow-hidden rounded-xl bg-[#6366f1] p-8 shadow-sm">
        <div className="relative z-10">
          <h1 className="text-3xl font-semibold text-white">
            لوحة التحكم
          </h1>
          <p className="mt-2 text-base font-medium text-white/90">
            مرحباً بك في لوحة الإدارة - نظرة شاملة على أداء عيادتك
          </p>
        </div>
      </div>

      {/* المؤشرات العامة */}
      <div className="mb-8">
        <MetricsOverview />
      </div>

      {/* المخططات */}
      <div className="mb-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <AppointmentChart />
        <RevenueChart />
      </div>

      {/* الإجراءات السريعة */}
      <div className="mb-8">
        <QuickActions />
      </div>
    </AdminLayout>
  )
}

