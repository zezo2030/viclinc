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
      <div className="rounded-xl border border-[#ef4444]/20 bg-[#ef4444]/5 p-6 shadow-sm">
        <div className="flex h-80 items-center justify-center">
          <div className="text-center">
            <p className="text-base font-medium text-[#ef4444]">حدث خطأ في تحميل البيانات</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-4 rounded-lg bg-[#ef4444] px-6 py-2 text-sm font-medium text-white shadow-sm transition-all duration-150 ease-out hover:scale-[1.02]"
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
    <div className="rounded-xl border border-[#e2e8f0] bg-white p-6 shadow-sm transition-all duration-150 ease-out">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h3 className="text-xl font-semibold text-[#0f172a]">
            المواعيد
          </h3>
          <p className="mt-1 text-sm font-medium text-[#64748b]">إحصائيات المواعيد حسب الفترة الزمنية</p>
        </div>
        <div className="flex gap-2">
          {(['7d', '30d', '90d'] as RangeOption[]).map((option) => (
            <button
              key={option}
              onClick={() => handleRangeChange(option)}
              className={`rounded-lg px-4 py-2 text-sm font-medium shadow-sm transition-all duration-150 ease-out ${
                range === option
                  ? 'bg-[#6366f1] text-white shadow-sm'
                  : 'bg-white text-[#64748b] hover:bg-[#f8fafc] hover:text-[#0f172a] border border-[#e2e8f0]'
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
        <div className="h-80 w-full animate-pulse rounded-lg bg-[#e2e8f0]"></div>
      ) : chartData.length === 0 ? (
        <div className="flex h-80 items-center justify-center rounded-lg bg-[#f8fafc]">
          <p className="text-base font-medium text-[#64748b]">لا توجد بيانات للعرض</p>
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={340}>
          <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="colorAppointments" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#6366f1" stopOpacity={0.05} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
            <XAxis
              dataKey="formattedDate"
              stroke="#64748b"
              fontSize={12}
              fontWeight={400}
              tick={{ fill: '#64748b' }}
              axisLine={{ stroke: '#e2e8f0' }}
            />
            <YAxis 
              stroke="#64748b" 
              fontSize={12} 
              fontWeight={400}
              tick={{ fill: '#64748b' }}
              axisLine={{ stroke: '#e2e8f0' }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#fff',
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                fontSize: '13px',
                fontWeight: 400,
                boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
                padding: '12px 16px',
              }}
              labelStyle={{ fontWeight: 500, color: '#0f172a', marginBottom: '4px' }}
              labelFormatter={(label) => `التاريخ: ${label}`}
              formatter={(value: number) => [value, 'المواعيد']}
            />
            <Legend 
              wrapperStyle={{ paddingTop: '20px', fontWeight: 500 }}
              iconType="circle"
            />
            <Area
              type="monotone"
              dataKey="value"
              stroke="#6366f1"
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





