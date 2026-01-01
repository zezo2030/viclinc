import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts'
import { metricsApi } from '@/api/metrics'
import type { RevenueChartProps } from '@/types'
import { formatDate, formatCurrency } from '@/utils/format'

type RangeOption = '7d' | '30d' | '90d'

export default function RevenueChart({
  range: initialRange = '30d',
  currency = 'SAR',
  onRangeChange: externalOnRangeChange,
}: Partial<RevenueChartProps>) {
  const [range, setRange] = useState<RangeOption>(initialRange as RangeOption)

  const { data, isLoading, error } = useQuery({
    queryKey: ['metrics', 'revenue', range],
    queryFn: () => metricsApi.getRevenue({ range }),
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

  const currentCurrency = data?.currency || currency

  // دمج البيانات الحالية والمقارنة
  const chartData =
    data?.series?.map((point, index) => {
      const comparisonValue =
        data?.comparison?.[index]?.value !== undefined
          ? data.comparison[index].value
          : null

      return {
        date: point.date,
        formattedDate: formatDate(point.date, 'dd/MM'),
        current: point.value,
        previous: comparisonValue,
      }
    }) || []

  const hasComparison = data?.comparison && data.comparison.length > 0

  return (
    <div className="rounded-xl border border-[#e2e8f0] bg-white p-6 shadow-sm transition-all duration-150 ease-out">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h3 className="text-xl font-semibold text-[#0f172a]">
            الإيرادات
          </h3>
          <p className="mt-1 text-sm font-medium text-[#64748b]">
            إحصائيات الإيرادات حسب الفترة الزمنية ({currentCurrency})
          </p>
        </div>
        <div className="flex gap-2">
          {(['7d', '30d', '90d'] as RangeOption[]).map((option) => (
            <button
              key={option}
              onClick={() => handleRangeChange(option)}
              className={`rounded-lg px-4 py-2 text-sm font-medium shadow-sm transition-all duration-150 ease-out ${
                range === option
                  ? 'bg-[#8b5cf6] text-white shadow-sm'
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
          <LineChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="colorCurrent" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.2} />
                <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
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
              tickFormatter={(value) => formatCurrency(value, currentCurrency)}
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
              formatter={(value: number) => formatCurrency(value, currentCurrency)}
            />
            <Legend 
              wrapperStyle={{ paddingTop: '20px', fontWeight: 500 }}
              iconType="circle"
            />
            <Line
              type="monotone"
              dataKey="current"
              stroke="#10b981"
              strokeWidth={2}
              dot={{ fill: '#10b981', r: 4, strokeWidth: 2, stroke: '#fff' }}
              activeDot={{ r: 6, strokeWidth: 2, stroke: '#10b981', fill: '#fff' }}
              name="الفترة الحالية"
            />
            {hasComparison && (
              <Line
                type="monotone"
                dataKey="previous"
                stroke="#94a3b8"
                strokeWidth={2}
                strokeDasharray="8 4"
                dot={{ fill: '#94a3b8', r: 3, strokeWidth: 2, stroke: '#fff' }}
                activeDot={{ r: 5, strokeWidth: 2 }}
                name="الفترة السابقة"
              />
            )}
          </LineChart>
        </ResponsiveContainer>
      )}
    </div>
  )
}





