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

      {/* Welcome Header with Gradient */}
      <div className="mb-8 relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-500 via-purple-600 to-pink-500 p-8 shadow-2xl">
        <div className="relative z-10">
          <h1 className="text-4xl font-black text-white drop-shadow-lg">
            لوحة التحكم
          </h1>
          <p className="mt-2 text-lg font-medium text-blue-100">
            مرحباً بك في لوحة الإدارة - نظرة شاملة على أداء عيادتك
          </p>
        </div>
        {/* Decorative Elements */}
        <div className="absolute top-0 left-0 w-64 h-64 bg-white/10 rounded-full -translate-x-32 -translate-y-32 blur-3xl"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-white/10 rounded-full translate-x-32 translate-y-32 blur-3xl"></div>
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

