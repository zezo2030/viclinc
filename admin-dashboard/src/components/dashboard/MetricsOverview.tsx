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
      <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-center">
        <p className="text-red-600">حدث خطأ في تحميل المؤشرات</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
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
  )
}



