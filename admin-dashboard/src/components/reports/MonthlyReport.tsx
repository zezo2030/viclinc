import { useState } from 'react'
import { PieChart, Pie, Cell, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import { useMonthlyReport } from '@/hooks/useReports'
import MetricCard from '@/components/dashboard/MetricCard'
import ReportSkeleton from './ReportSkeleton'
import ExportButtons from './ExportButtons'
import { Calendar, Users, DollarSign, TrendingUp, Stethoscope } from 'lucide-react'
import { formatDate, formatCurrency, formatNumber } from '@/utils/format'

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899']

export default function MonthlyReport() {
  const currentMonth = new Date().toISOString().slice(0, 7) // YYYY-MM
  const [selectedMonth, setSelectedMonth] = useState<string>(currentMonth)

  const { data, isLoading, error } = useMonthlyReport(selectedMonth)

  if (error) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-center">
        <p className="text-red-600">حدث خطأ في تحميل التقرير الشهري</p>
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

  const summary = data?.summary || {}
  const appointments = data?.appointments || {}
  const payments = data?.payments || {}
  const newPatients = data?.newPatients || 0
  const departmentStats = data?.departmentStats || []
  const weeklyBreakdown = data?.weeklyBreakdown || []

  // إعداد بيانات التصدير
  const exportHeaders = ['الأسبوع', 'المواعيد', 'الإيرادات', 'المرضى الجدد']
  const exportRows = weeklyBreakdown.map((week) => [
    `الأسبوع ${week.week}`,
    week.appointments,
    formatCurrency(week.revenue),
    week.newPatients,
  ])
  const exportSummary = {
    'الشهر': formatDate(selectedMonth + '-01', 'MMMM yyyy'),
    'إجمالي المواعيد': summary.totalAppointments || 0,
    'الإيرادات': formatCurrency(summary.totalRevenue || 0),
    'المرضى الجدد': summary.newPatients || 0,
    'الأطباء النشطين': summary.activeDoctors || 0,
  }

  // بيانات الرسم البياني الدائري للأقسام
  const pieData = departmentStats.map((dept) => ({
    name: dept.departmentName,
    value: dept.sharePercentage,
    revenue: dept.revenue,
  }))

  // بيانات الرسم البياني الخطي للأأسابيع
  const lineData = weeklyBreakdown.map((week) => ({
    أسبوع: `أسبوع ${week.week}`,
    المواعيد: week.appointments,
    الإيرادات: week.revenue,
  }))

  return (
    <div className="space-y-6">
      {/* هيدر التقرير */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">التقرير الشهري</h2>
          <p className="mt-1 text-sm text-gray-600">
            بيانات وإحصائيات {formatDate(selectedMonth + '-01', 'MMMM yyyy')}
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-gray-500" />
            <input
              type="month"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <ExportButtons
            title={`التقرير الشهري - ${formatDate(selectedMonth + '-01', 'MMMM yyyy')}`}
            headers={exportHeaders}
            rows={exportRows}
            summary={exportSummary}
          />
        </div>
      </div>

      {/* بطاقات الملخص الرئيسية */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="إجمالي المواعيد"
          value={summary.totalAppointments || 0}
          icon={<Calendar className="h-6 w-6" />}
          isLoading={isLoading}
          variant="primary"
        />
        <MetricCard
          title="المواعيد المؤكدة"
          value={summary.confirmedAppointments || 0}
          icon={<TrendingUp className="h-6 w-6" />}
          isLoading={isLoading}
          variant="success"
        />
        <MetricCard
          title="إجمالي الإيرادات"
          value={formatCurrency(summary.totalRevenue || 0)}
          icon={<DollarSign className="h-6 w-6" />}
          isLoading={isLoading}
          variant="success"
        />
        <MetricCard
          title="المرضى الجدد"
          value={summary.newPatients || 0}
          icon={<Users className="h-6 w-6" />}
          isLoading={isLoading}
          variant="warning"
        />
      </div>

      {/* تفاصيل إضافية */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <div className="rounded-lg border border-gray-200 bg-red-50 p-4">
          <p className="text-sm font-medium text-gray-600">الملغاة</p>
          <p className="mt-1 text-2xl font-bold text-red-900">{summary.cancelledAppointments || 0}</p>
        </div>
        <div className="rounded-lg border border-gray-200 bg-yellow-50 p-4">
          <p className="text-sm font-medium text-gray-600">غير الحاضرين</p>
          <p className="mt-1 text-2xl font-bold text-yellow-900">{summary.noShowAppointments || 0}</p>
        </div>
        <div className="rounded-lg border border-gray-200 bg-green-50 p-4">
          <p className="text-sm font-medium text-gray-600">الأطباء النشطين</p>
          <p className="mt-1 text-2xl font-bold text-green-900">{summary.activeDoctors || 0}</p>
        </div>
        <div className="rounded-lg border border-gray-200 bg-blue-50 p-4">
          <p className="text-sm font-medium text-gray-600">متوسط الإيراد/موعد</p>
          <p className="mt-1 text-2xl font-bold text-blue-900">
            {summary.totalAppointments > 0
              ? formatCurrency((summary.totalRevenue || 0) / summary.totalAppointments)
              : formatCurrency(0)}
          </p>
        </div>
      </div>

      {/* الرسوم البيانية */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* رسم بياني دائري لتوزيع الإيرادات */}
        {pieData.length > 0 && (
          <div className="rounded-lg border border-gray-200 bg-white p-6">
            <h3 className="mb-4 text-lg font-semibold text-gray-900">توزيع الإيرادات حسب الأقسام</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value: number) => `${value.toFixed(1)}%`}
                  contentStyle={{
                    backgroundColor: '#fff',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                  }}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* رسم بياني خطي للأسابيع */}
        {lineData.length > 0 && (
          <div className="rounded-lg border border-gray-200 bg-white p-6">
            <h3 className="mb-4 text-lg font-semibold text-gray-900">اتجاهات الأسابيع</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={lineData} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="أسبوع" stroke="#6b7280" fontSize={12} tick={{ fill: '#6b7280' }} />
                <YAxis yAxisId="left" stroke="#6b7280" fontSize={12} tick={{ fill: '#6b7280' }} />
                <YAxis
                  yAxisId="right"
                  orientation="right"
                  stroke="#10b981"
                  fontSize={12}
                  tick={{ fill: '#10b981' }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#fff',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    fontSize: '12px',
                  }}
                  formatter={(value: number, name: string) => [
                    name === 'المواعيد' ? value : formatCurrency(value),
                    name,
                  ]}
                />
                <Legend />
                <Line
                  yAxisId="left"
                  type="monotone"
                  dataKey="المواعيد"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  dot={{ fill: '#3b82f6', r: 4 }}
                  activeDot={{ r: 6 }}
                />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="الإيرادات"
                  stroke="#10b981"
                  strokeWidth={2}
                  dot={{ fill: '#10b981', r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* جدول إحصائيات الأقسام */}
      {departmentStats.length > 0 && (
        <div className="rounded-lg border border-gray-200 bg-white">
          <div className="border-b border-gray-200 p-4">
            <h3 className="text-lg font-semibold text-gray-900">إحصائيات الأقسام</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="p-4 text-right text-sm font-semibold text-gray-900">القسم</th>
                  <th className="p-4 text-right text-sm font-semibold text-gray-900">عدد المواعيد</th>
                  <th className="p-4 text-right text-sm font-semibold text-gray-900">الإيرادات</th>
                  <th className="p-4 text-right text-sm font-semibold text-gray-900">النسبة</th>
                </tr>
              </thead>
              <tbody>
                {departmentStats.map((dept, index) => (
                  <tr key={dept.departmentId} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                    <td className="p-4 text-sm text-gray-900">{dept.departmentName}</td>
                    <td className="p-4 text-sm text-gray-600">{formatNumber(dept.appointments)}</td>
                    <td className="p-4 text-sm text-gray-600">{formatCurrency(dept.revenue)}</td>
                    <td className="p-4 text-sm text-gray-600">
                      <span className="rounded-full bg-blue-100 px-3 py-1 text-blue-800">
                        {typeof dept.sharePercentage === 'number' ? dept.sharePercentage.toFixed(1) : '0.0'}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* حالة فارغة */}
      {!isLoading && departmentStats.length === 0 && weeklyBreakdown.length === 0 && (
        <div className="rounded-lg border border-gray-200 bg-white p-12 text-center">
          <Calendar className="mx-auto h-12 w-12 text-gray-400" />
          <p className="mt-4 text-lg font-medium text-gray-900">لا توجد بيانات متاحة</p>
          <p className="mt-1 text-sm text-gray-600">لا توجد مواعيد أو إحصائيات للشهر المحدد</p>
        </div>
      )}
    </div>
  )
}

