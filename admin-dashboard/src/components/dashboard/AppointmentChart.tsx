
import { useQuery } from '@tanstack/react-query';
import { adminService } from '@clinic/shared';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export function AppointmentChart() {
  const { data: metrics, isLoading } = useQuery({
    queryKey: ['admin-appointment-metrics'],
    queryFn: () => adminService.getAppointmentMetrics(),
  });

  if (isLoading) {
    return (
      <div className="h-80 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-admin-primary"></div>
      </div>
    );
  }

  // Transform data for chart
  const chartData = metrics?.data?.dailyBreakdown?.map((item: any) => ({
    date: item._id,
    appointments: item.count,
    confirmed: item.confirmed,
    cancelled: item.cancelled,
  })) || [];

  return (
    <div className="h-80">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis />
          <Tooltip />
          <Line 
            type="monotone" 
            dataKey="appointments" 
            stroke="#1e40af" 
            strokeWidth={2}
            name="إجمالي المواعيد"
          />
          <Line 
            type="monotone" 
            dataKey="confirmed" 
            stroke="#059669" 
            strokeWidth={2}
            name="المواعيد المؤكدة"
          />
          <Line 
            type="monotone" 
            dataKey="cancelled" 
            stroke="#dc2626" 
            strokeWidth={2}
            name="المواعيد الملغية"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
