import { useState } from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import { useWeeklyReport } from '@/hooks/useReports'
import MetricCard from '@/components/dashboard/MetricCard'
import ReportSkeleton from './ReportSkeleton'
import ExportButtons from './ExportButtons'
import { Calendar, Users, DollarSign, TrendingUp, TrendingDown } from 'lucide-react'
import { formatDate, formatCurrency, formatNumber } from '@/utils/format'
import { subWeeks, format } from 'date-fns'

export default function WeeklyReport() {
  // الحصول على بداية الأسبوع الحالي (الأحد)
  const getWeekStart = (date: Date) => {
    const d = new Date(date)
    const day = d.getDay()
    const diff = d.getDate() - day // الأحد = 0
    return new Date(d.setDate(diff))
  }

  const [weekStart, setWeekStart] = useState<string>(format(getWeekStart(new Date()), 'yyyy-MM-dd'))

  const { data, isLoading, error } = useWeeklyReport(weekStart)

  // تحديث التاريخ
  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setWeekStart(e.target.value)
  }

  // الأسبوع السابق
  const handlePreviousWeek = () => {
    const newDate = subWeeks(new Date(weekStart), 1)
    setWeekStart(format(newDate, 'yyyy-MM-dd'))
  }

  // الأسبوع التالي
  const handleNextWeek = () => {
    const newDate = subWeeks(new Date(weekStart), 7)
    setWeekStart(format(newDate, 'yyyy-MM-dd'))
  }

  if (error) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-center">
        <p className="text-red-600">حدث خطأ في تحميل التقرير الأسبوعي</p>
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
  const dailyBreakdown = data?.dailyBreakdown || []
  const comparison = data?.comparison

  // إعداد بيانات التصدير
  const exportHeaders = ['اليوم', 'المواعيد', 'الإيرادات', 'المرضى الجدد']
  const exportRows = dailyBreakdown.map((day) => [
    formatDate(day.date, 'EEEE dd/MM'),
    typeof day.appointments === 'number' ? day.appointments : 0,
    formatCurrency(typeof day.revenue === 'number' ? day.revenue : 0),
    typeof day.newPatients === 'number' ? day.newPatients : 0,
  ])
  const exportSummary = {
    'الفترة': `${formatDate(weekStart, 'dd/MM/yyyy')} - ${formatDate(data?.weekEnd || '', 'dd/MM/yyyy')}`,
    'إجمالي المواعيد': appointments.total || 0,
    'الإيرادات': formatCurrency(payments.paid || 0),
    'المرضى الجدد': newPatients,
  }

  // بيانات الرسم البياني
  const chartData = dailyBreakdown.map((day) => ({
    يوم: formatDate(day.date, 'EEE'),
    المواعيد: typeof day.appointments === 'number' ? day.appointments : 0,
    الإيرادات: typeof day.revenue === 'number' ? day.revenue : 0,
  }))

  return (
    <div className="space-y-6">
      {/* هيدر التقرير */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">التقرير الأسبوعي</h2>
          <p className="mt-1 text-sm text-gray-600">
            {data?.weekEnd && `${formatDate(weekStart, 'dd/MM/yyyy')} - ${formatDate(data.weekEnd, 'dd/MM/yyyy')}`}
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <button
              onClick={handlePreviousWeek}
              className="rounded-lg border border-gray-300 px-3 py-2 hover:bg-gray-50"
            >
              ‹ السابق
            </button>
            <input
              type="date"
              value={weekStart}
              onChange={handleDateChange}
              className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
            <button
              onClick={handleNextWeek}
              className="rounded-lg border border-gray-300 px-3 py-2 hover:bg-gray-50"
            >
              التالي ›
            </button>
          </div>
          <ExportButtons
            title={`التقرير الأسبوعي - ${formatDate(weekStart, 'dd/MM/yyyy')}`}
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
          delta={typeof comparison?.change.appointments === 'number' ? comparison.change.appointments : undefined}
          icon={<Calendar className="h-6 w-6" />}
          isLoading={isLoading}
          variant="primary"
        />
        <MetricCard
          title="المواعيد المؤكدة"
          value={typeof appointments.confirmed === 'number' ? appointments.confirmed : 0}
          icon={<TrendingUp className="h-6 w-6" />}
          isLoading={isLoading}
          variant="success"
        />
        <MetricCard
          title="الإيرادات"
          value={formatCurrency(typeof payments.paid === 'number' ? payments.paid : 0)}
          delta={typeof comparison?.change.revenue === 'number' ? comparison.change.revenue : undefined}
          icon={<DollarSign className="h-6 w-6" />}
          isLoading={isLoading}
          variant="success"
        />
        <MetricCard
          title="المرضى الجدد"
          value={typeof newPatients === 'number' ? newPatients : 0}
          delta={typeof comparison?.change.newPatients === 'number' ? comparison.change.newPatients : undefined}
          icon={<Users className="h-6 w-6" />}
          isLoading={isLoading}
          variant="warning"
        />
      </div>

      {/* مقارنة مع الأسبوع السابق */}
      {comparison && (
        <div className="rounded-lg border border-gray-200 bg-white p-6">
          <h3 className="mb-4 text-lg font-semibold text-gray-900">مقارنة مع الأسبوع السابق</h3>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
              <p className="text-sm font-medium text-gray-600">المواعيد</p>
              <div className="mt-2 flex items-center gap-2">
                <span className="text-2xl font-bold text-blue-900">{comparison.previousWeek.appointments}</span>
                {comparison.change.appointments !== 0 && (
                  <span
                    className={`flex items-center gap-1 text-sm font-medium ${
                      comparison.change.appointments > 0 ? 'text-green-600' : 'text-red-600'
                    }`}
                  >
                    {comparison.change.appointments > 0 ? (
                      <TrendingUp className="h-4 w-4" />
                    ) : (
                      <TrendingDown className="h-4 w-4" />
                    )}
                    {Math.abs(comparison.change.appointments)}%
                  </span>
                )}
              </div>
            </div>
            <div className="rounded-lg border border-green-200 bg-green-50 p-4">
              <p className="text-sm font-medium text-gray-600">الإيرادات</p>
              <div className="mt-2 flex items-center gap-2">
                <span className="text-2xl font-bold text-green-900">
                  {formatCurrency(comparison.previousWeek.revenue)}
                </span>
                {comparison.change.revenue !== 0 && (
                  <span
                    className={`flex items-center gap-1 text-sm font-medium ${
                      comparison.change.revenue > 0 ? 'text-green-600' : 'text-red-600'
                    }`}
                  >
                    {comparison.change.revenue > 0 ? (
                      <TrendingUp className="h-4 w-4" />
                    ) : (
                      <TrendingDown className="h-4 w-4" />
                    )}
                    {Math.abs(comparison.change.revenue)}%
                  </span>
                )}
              </div>
            </div>
            <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4">
              <p className="text-sm font-medium text-gray-600">المرضى الجدد</p>
              <div className="mt-2 flex items-center gap-2">
                <span className="text-2xl font-bold text-yellow-900">{comparison.previousWeek.newPatients}</span>
                {comparison.change.newPatients !== 0 && (
                  <span
                    className={`flex items-center gap-1 text-sm font-medium ${
                      comparison.change.newPatients > 0 ? 'text-green-600' : 'text-red-600'
                    }`}
                  >
                    {comparison.change.newPatients > 0 ? (
                      <TrendingUp className="h-4 w-4" />
                    ) : (
                      <TrendingDown className="h-4 w-4" />
                    )}
                    {Math.abs(comparison.change.newPatients)}%
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* الرسم البياني لتوزيع المواعيد والإيرادات */}
      {chartData.length > 0 && (
        <div className="rounded-lg border border-gray-200 bg-white p-6">
          <h3 className="mb-4 text-lg font-semibold text-gray-900">اتجاهات الأسبوع</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="يوم" stroke="#6b7280" fontSize={12} tick={{ fill: '#6b7280' }} />
              <YAxis yAxisId="left" stroke="#6b7280" fontSize={12} tick={{ fill: '#6b7280' }} />
              <YAxis yAxisId="right" orientation="right" stroke="#10b981" fontSize={12} tick={{ fill: '#10b981' }} />
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
      {!isLoading && doctorStats.length === 0 && dailyBreakdown.length === 0 && (
        <div className="rounded-lg border border-gray-200 bg-white p-12 text-center">
          <Calendar className="mx-auto h-12 w-12 text-gray-400" />
          <p className="mt-4 text-lg font-medium text-gray-900">لا توجد بيانات متاحة</p>
          <p className="mt-1 text-sm text-gray-600">لا توجد مواعيد أو إحصائيات للأسبوع المحدد</p>
        </div>
      )}
    </div>
  )
}

