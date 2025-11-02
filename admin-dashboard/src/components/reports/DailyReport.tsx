import { useState } from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import { useDailyReport } from '@/hooks/useReports'
import MetricCard from '@/components/dashboard/MetricCard'
import ReportSkeleton from './ReportSkeleton'
import ExportButtons from './ExportButtons'
import { Calendar, Users, DollarSign, TrendingUp } from 'lucide-react'
import { formatDate, formatCurrency, formatNumber } from '@/utils/format'

export default function DailyReport() {
  const today = new Date().toISOString().split('T')[0]
  const [selectedDate, setSelectedDate] = useState<string>(today)

  const { data, isLoading, error } = useDailyReport(selectedDate)

  if (error) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-center">
        <p className="text-red-600">حدث خطأ في تحميل التقرير اليومي</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-4 rounded-lg bg-red-600 px-4 py-2 text-white hover:bg-red-700"
        >
          إعادة المحاولة
        </button>
      </div>
    )
  }

  if (isLoading) {
    return <ReportSkeleton showCharts={true} />
  }

  const appointments = data?.appointments || {}
  const payments = data?.payments || {}
  const newPatients = data?.newPatients || 0
  const doctorStats = data?.doctorStats || []
  const hourlyData = data?.hourlyDistribution || []

  // إعداد بيانات التصدير - معالجة أمنة للأنواع
  const exportHeaders = ['الساعة', 'عدد المواعيد']
  const exportRows = hourlyData.map((item) => {
    const countValue = typeof item.count === 'number' 
      ? item.count 
      : typeof item.count === 'object' 
        ? (item.count as any)?.count || 0 
        : 0
    return [item.hour + ':00', countValue]
  })
  
  const exportSummary = {
    'التاريخ': formatDate(selectedDate, 'dd/MM/yyyy'),
    'إجمالي المواعيد': typeof appointments.total === 'number' ? appointments.total : 0,
    'المواعيد المؤكدة': typeof appointments.confirmed === 'number' ? appointments.confirmed : 0,
    'الإيرادات': typeof payments.paid === 'number' ? formatCurrency(payments.paid) : formatCurrency(0),
    'المرضى الجدد': typeof newPatients === 'number' ? newPatients : 0,
  }

  // إعداد بيانات الرسم البياني للساعات
  const chartData = hourlyData.map((item) => ({
    hour: `${item.hour}:00`,
    المواعيد: typeof item.count === 'number' ? item.count : typeof item.count === 'object' ? (item.count as any)?.count || 0 : 0,
  }))

  return (
    <div className="space-y-6">
      {/* هيدر التقرير */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">التقرير اليومي</h2>
          <p className="mt-1 text-sm text-gray-600">
            بيانات وإحصائيات {formatDate(selectedDate, 'EEEE، dd MMMM yyyy')}
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-gray-500" />
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <ExportButtons
            title={`التقرير اليومي - ${formatDate(selectedDate, 'dd/MM/yyyy')}`}
            headers={exportHeaders}
            rows={exportRows}
            summary={exportSummary}
          />
        </div>
      </div>

      {/* بطاقات الملخص */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="إجمالي المواعيد"
          value={typeof appointments.total === 'number' ? appointments.total : 0}
          icon={<TrendingUp className="h-6 w-6" />}
          isLoading={isLoading}
          variant="primary"
        />
        <MetricCard
          title="المواعيد المؤكدة"
          value={typeof appointments.confirmed === 'number' ? appointments.confirmed : 0}
          delta={
            typeof appointments.total === 'number' && typeof appointments.confirmed === 'number' && appointments.total > 0
              ? (appointments.confirmed / appointments.total) * 100
              : undefined
          }
          icon={<Calendar className="h-6 w-6" />}
          isLoading={isLoading}
          variant="success"
        />
        <MetricCard
          title="الإيرادات"
          value={formatCurrency(typeof payments.paid === 'number' ? payments.paid : 0)}
          icon={<DollarSign className="h-6 w-6" />}
          isLoading={isLoading}
          variant="success"
        />
        <MetricCard
          title="المرضى الجدد"
          value={typeof newPatients === 'number' ? newPatients : 0}
          icon={<Users className="h-6 w-6" />}
          isLoading={isLoading}
          variant="warning"
        />
      </div>

      {/* تفاصيل المواعيد */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <div className="rounded-lg border border-gray-200 bg-blue-50 p-4">
          <p className="text-sm font-medium text-gray-600">المكتملة</p>
          <p className="mt-1 text-2xl font-bold text-blue-900">{typeof appointments.completed === 'number' ? appointments.completed : 0}</p>
        </div>
        <div className="rounded-lg border border-gray-200 bg-yellow-50 p-4">
          <p className="text-sm font-medium text-gray-600">الملغاة</p>
          <p className="mt-1 text-2xl font-bold text-yellow-900">{typeof appointments.cancelled === 'number' ? appointments.cancelled : 0}</p>
        </div>
        <div className="rounded-lg border border-gray-200 bg-red-50 p-4">
          <p className="text-sm font-medium text-gray-600">غير الحاضرين</p>
          <p className="mt-1 text-2xl font-bold text-red-900">{typeof appointments.noShow === 'number' ? appointments.noShow : 0}</p>
        </div>
        <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
          <p className="text-sm font-medium text-gray-600">المعلقة</p>
          <p className="mt-1 text-2xl font-bold text-gray-900">{typeof payments.pending === 'number' ? payments.pending : 0}</p>
        </div>
      </div>

      {/* الرسم البياني لتوزيع المواعيد حسب الساعة */}
      {chartData.length > 0 && (
        <div className="rounded-lg border border-gray-200 bg-white p-6">
          <h3 className="mb-4 text-lg font-semibold text-gray-900">توزيع المواعيد حسب الساعة</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="hour" stroke="#6b7280" fontSize={12} tick={{ fill: '#6b7280' }} />
              <YAxis stroke="#6b7280" fontSize={12} tick={{ fill: '#6b7280' }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#fff',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  fontSize: '12px',
                }}
                formatter={(value: number) => [value, 'المواعيد']}
              />
              <Legend />
              <Bar dataKey="المواعيد" fill="#3b82f6" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* جدول أداء الأطباء */}
      {doctorStats.length > 0 && (
        <div className="rounded-lg border border-gray-200 bg-white">
          <div className="border-b border-gray-200 p-4">
            <h3 className="text-lg font-semibold text-gray-900">أداء الأطباء</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="p-4 text-right text-sm font-semibold text-gray-900">الطبيب</th>
                  <th className="p-4 text-right text-sm font-semibold text-gray-900">عدد المواعيد</th>
                  <th className="p-4 text-right text-sm font-semibold text-gray-900">الإيرادات</th>
                </tr>
              </thead>
              <tbody>
                {doctorStats.map((doctor, index) => (
                  <tr key={doctor.doctorId} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                    <td className="p-4 text-sm text-gray-900">{doctor.doctorName}</td>
                    <td className="p-4 text-sm text-gray-600">{formatNumber(doctor.appointmentCount)}</td>
                    <td className="p-4 text-sm text-gray-600">{formatCurrency(doctor.revenue || 0)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* حالة فارغة */}
      {!isLoading && doctorStats.length === 0 && hourlyData.length === 0 && (
        <div className="rounded-lg border border-gray-200 bg-white p-12 text-center">
          <Calendar className="mx-auto h-12 w-12 text-gray-400" />
          <p className="mt-4 text-lg font-medium text-gray-900">لا توجد بيانات متاحة</p>
          <p className="mt-1 text-sm text-gray-600">لا توجد مواعيد أو إحصائيات للتاريخ المحدد</p>
        </div>
      )}
    </div>
  )
}

