
import { useQuery } from '@tanstack/react-query';
import { adminService } from '@clinic/shared';
import { MetricCard } from './MetricCard';
import { 
  Calendar, 
  Users, 
  UserCheck, 
  DollarSign,
  TrendingUp,
  TrendingDown
} from 'lucide-react';

export function MetricsOverview() {
  const { data: metrics, isLoading, error } = useQuery({
    queryKey: ['admin-metrics-overview'],
    queryFn: () => adminService.getOverviewMetrics(),
  });

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-white p-6 rounded-lg border animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
            <div className="h-8 bg-gray-200 rounded w-1/2"></div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-600">خطأ في تحميل البيانات</p>
      </div>
    );
  }

  const metricCards = [
    {
      title: 'إجمالي المواعيد',
      value: metrics?.overview?.totalAppointments || 0,
      change: 12,
      changeType: 'increase' as const,
      icon: Calendar,
      color: 'blue' as const,
    },
    {
      title: 'المواعيد المؤكدة',
      value: metrics?.overview?.confirmedAppointments || 0,
      change: 8,
      changeType: 'increase' as const,
      icon: UserCheck,
      color: 'green' as const,
    },
    {
      title: 'إجمالي الأطباء',
      value: metrics?.users?.totalDoctors || 0,
      change: 2,
      changeType: 'increase' as const,
      icon: Users,
      color: 'purple' as const,
    },
    {
      title: 'إجمالي الإيرادات',
      value: `$${metrics?.revenue?.totalRevenue || 0}`,
      change: 15,
      changeType: 'increase' as const,
      icon: DollarSign,
      color: 'green' as const,
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {metricCards.map((metric, index) => (
        <MetricCard key={index} {...metric} />
      ))}
    </div>
  );
}
