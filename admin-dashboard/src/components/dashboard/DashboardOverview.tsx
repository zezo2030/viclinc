
import { Card, CardHeader, CardContent } from '@clinic/shared';
import { AppointmentChart } from './AppointmentChart';
import { RevenueChart } from './RevenueChart';

export function DashboardOverview() {
  return (
    <div className="space-y-6">
      {/* Appointments Chart */}
      <Card>
        <CardHeader 
          title="إحصائيات المواعيد" 
          subtitle="توزيع المواعيد خلال الشهر الماضي"
        />
        <CardContent>
          <AppointmentChart />
        </CardContent>
      </Card>

      {/* Revenue Chart */}
      <Card>
        <CardHeader 
          title="الإيرادات" 
          subtitle="الإيرادات اليومية خلال الشهر الماضي"
        />
        <CardContent>
          <RevenueChart />
        </CardContent>
      </Card>
    </div>
  );
}
