import { useQuery } from '@tanstack/react-query'
import { metricsApi } from '@/api/metrics'
import MetricCard from './MetricCard'
import { Users, Stethoscope, Calendar, DollarSign } from 'lucide-react'
import { formatCurrency } from '@/utils/format'

export default function MetricsOverview() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['metrics', 'overview'],
    queryFn: () => metricsApi.getOverview(),
    staleTime: 1000 * 60 * 5, // 5 دقائق
    gcTime: 1000 * 60 * 30, // 30 دقيقة
  })

  if (error) {
    return (
      <div className="rounded-xl border border-red-100 bg-gradient-to-br from-red-50 to-red-100/50 p-6 text-center shadow-lg">
        <p className="text-lg font-semibold text-red-600">حدث خطأ في تحميل المؤشرات</p>
        <button 
          onClick={() => window.location.reload()}
          className="mt-3 px-4 py-2 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg text-sm font-medium shadow-lg shadow-red-500/30 transition-all hover:scale-105"
        >
          إعادة المحاولة
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Section Header */}
      <div className="flex items-center gap-3">
        <div className="h-1 w-1 rounded-full bg-gradient-to-r from-blue-500 to-purple-600"></div>
        <h2 className="text-xl font-bold text-gray-900">المؤشرات الرئيسية</h2>
        <div className="h-0.5 flex-1 bg-gradient-to-r from-purple-600 to-pink-600 opacity-20"></div>
      </div>

      {/* Metrics Grid with Animation */}
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          title="إجمالي المستخدمين"
          value={data?.totalUsers ?? 0}
          delta={data?.deltas?.users}
          icon={<Users className="h-6 w-6" />}
          isLoading={isLoading}
          variant="primary"
        />
        <MetricCard
          title="إجمالي الأطباء"
          value={data?.totalDoctors ?? 0}
          delta={data?.deltas?.doctors}
          icon={<Stethoscope className="h-6 w-6" />}
          isLoading={isLoading}
          variant="success"
        />
        <MetricCard
          title="إجمالي المواعيد"
          value={data?.totalAppointments ?? 0}
          delta={data?.deltas?.appointments}
          icon={<Calendar className="h-6 w-6" />}
          isLoading={isLoading}
          variant="warning"
        />
        <MetricCard
          title="إجمالي الإيرادات"
          value={formatCurrency(data?.totalRevenue ?? 0)}
          delta={data?.deltas?.revenue}
          icon={<DollarSign className="h-6 w-6" />}
          isLoading={isLoading}
          variant="success"
        />
      </div>
    </div>
  )
}





