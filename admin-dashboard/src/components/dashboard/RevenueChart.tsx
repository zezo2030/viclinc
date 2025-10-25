
import { useQuery } from '@tanstack/react-query';
import { adminService } from '@clinic/shared';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export function RevenueChart() {
  const { data: metrics, isLoading } = useQuery({
    queryKey: ['admin-revenue-metrics'],
    queryFn: () => adminService.getRevenueMetrics(),
  });

  if (isLoading) {
    return (
      <div className="h-80 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-admin-primary"></div>
      </div>
    );
  }

  // Transform data for chart
  const chartData = metrics?.data?.dailyRevenue?.map((item: any) => ({
    date: item._id,
    revenue: item.totalAmount,
    count: item.count,
  })) || [];

  return (
    <div className="h-80">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis />
          <Tooltip formatter={(value) => [`$${value}`, 'الإيرادات']} />
          <Bar dataKey="revenue" fill="#059669" name="الإيرادات" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
