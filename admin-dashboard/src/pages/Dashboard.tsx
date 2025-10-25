import { AdminLayout } from '@/components/layout/AdminLayout';
import { DashboardOverview } from '@/components/dashboard/DashboardOverview';
import { MetricsOverview } from '@/components/metrics/MetricsOverview';
import { RecentActivity } from '@/components/dashboard/RecentActivity';
import { QuickActions } from '@/components/dashboard/QuickActions';

export function Dashboard() {
  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">لوحة الإدارة</h1>
            <p className="text-gray-600">نظرة عامة على أداء النظام</p>
          </div>
          <div className="flex items-center space-x-4 space-x-reverse">
            <button className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50">
              تصدير التقرير
            </button>
            <button className="px-4 py-2 text-sm font-medium text-white bg-blue-800 rounded-md hover:bg-blue-700">
              إضافة جديد
            </button>
          </div>
        </div>

        {/* Metrics Overview */}
        <MetricsOverview />

        {/* Dashboard Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Dashboard */}
          <div className="lg:col-span-2">
            <DashboardOverview />
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <QuickActions />
            <RecentActivity />
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
