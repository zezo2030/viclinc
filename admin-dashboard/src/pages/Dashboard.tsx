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

      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">لوحة التحكم</h1>
        <p className="mt-1 text-gray-600">مرحباً بك في لوحة الإدارة</p>
      </div>

      {/* المؤشرات العامة */}
      <div className="mb-6">
        <MetricsOverview />
      </div>

      {/* المخططات */}
      <div className="mb-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <AppointmentChart />
        <RevenueChart />
      </div>

      {/* الإجراءات السريعة */}
      <div className="mb-6">
        <QuickActions />
      </div>
    </AdminLayout>
  )
}

