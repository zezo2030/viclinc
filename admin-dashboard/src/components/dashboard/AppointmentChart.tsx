import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts'
import { metricsApi } from '@/api/metrics'
import type { AppointmentChartProps } from '@/types'
import { formatDate } from '@/utils/format'

type RangeOption = '7d' | '30d' | '90d'

export default function AppointmentChart({
  range: initialRange = '30d',
  onRangeChange: externalOnRangeChange,
}: Partial<AppointmentChartProps>) {
  const [range, setRange] = useState<RangeOption>(initialRange as RangeOption)

  const { data, isLoading, error } = useQuery({
    queryKey: ['metrics', 'appointments', range],
    queryFn: () =>
      metricsApi.getAppointments({
        range,
        groupBy: range === '7d' ? 'day' : range === '30d' ? 'day' : 'week',
      }),
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 30,
  })

  const handleRangeChange = (newRange: RangeOption) => {
    setRange(newRange)
    externalOnRangeChange?.(newRange)
  }

  if (error) {
    return (
      <div className="rounded-lg border border-red-200 bg-white p-6">
        <div className="flex h-80 items-center justify-center">
          <div className="text-center">
            <p className="text-red-600">حدث خطأ في تحميل البيانات</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-2 text-sm text-primary-600 hover:underline"
            >
              إعادة المحاولة
            </button>
          </div>
        </div>
      </div>
    )
  }

  const chartData = data?.series?.map((point) => ({
    date: point.date,
    formattedDate: formatDate(point.date, 'dd/MM'),
    value: point.value,
    المواعيد: point.value,
  })) || []

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">المواعيد</h3>
          <p className="text-sm text-gray-600">إحصائيات المواعيد حسب الفترة الزمنية</p>
        </div>
        <div className="flex gap-2">
          {(['7d', '30d', '90d'] as RangeOption[]).map((option) => (
            <button
              key={option}
              onClick={() => handleRangeChange(option)}
              className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                range === option
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {option === '7d'
                ? '7 أيام'
                : option === '30d'
                  ? '30 يوماً'
                  : '90 يوماً'}
            </button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className="h-80 w-full animate-pulse rounded bg-gray-100"></div>
      ) : chartData.length === 0 ? (
        <div className="flex h-80 items-center justify-center">
          <p className="text-gray-500">لا توجد بيانات للعرض</p>
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={320}>
          <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="colorAppointments" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis
              dataKey="formattedDate"
              stroke="#6b7280"
              fontSize={12}
              tick={{ fill: '#6b7280' }}
            />
            <YAxis stroke="#6b7280" fontSize={12} tick={{ fill: '#6b7280' }} />
            <Tooltip
              contentStyle={{
                backgroundColor: '#fff',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                fontSize: '12px',
              }}
              labelFormatter={(label) => `التاريخ: ${label}`}
              formatter={(value: number) => [value, 'المواعيد']}
            />
            <Legend />
            <Area
              type="monotone"
              dataKey="value"
              stroke="#3b82f6"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#colorAppointments)"
              name="المواعيد"
            />
          </AreaChart>
        </ResponsiveContainer>
      )}
    </div>
  )
}



