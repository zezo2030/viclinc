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
      <div className="rounded-xl border border-red-100 bg-gradient-to-br from-red-50 to-red-100/50 p-6 shadow-lg">
        <div className="flex h-80 items-center justify-center">
          <div className="text-center">
            <p className="text-lg font-semibold text-red-600">حدث خطأ في تحميل البيانات</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-4 rounded-lg bg-gradient-to-r from-red-500 to-red-600 px-6 py-2 text-sm font-medium text-white shadow-lg shadow-red-500/30 transition-all hover:scale-105 hover:shadow-xl"
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
    <div className="rounded-xl border border-green-100 bg-gradient-to-br from-white to-green-50/30 p-6 shadow-lg transition-all duration-300 hover:shadow-2xl">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h3 className="bg-gradient-to-r from-green-600 to-emerald-800 bg-clip-text text-xl font-bold text-transparent">
            الإيرادات
          </h3>
          <p className="mt-1 text-sm font-medium text-gray-600">
            إحصائيات الإيرادات حسب الفترة الزمنية ({currentCurrency})
          </p>
        </div>
        <div className="flex gap-2">
          {(['7d', '30d', '90d'] as RangeOption[]).map((option) => (
            <button
              key={option}
              onClick={() => handleRangeChange(option)}
              className={`rounded-lg px-4 py-2 text-sm font-semibold shadow-sm transition-all duration-300 ${
                range === option
                  ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-lg shadow-green-500/30 scale-105'
                  : 'bg-white text-gray-700 hover:bg-gray-50 hover:scale-105 border border-gray-200'
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
        <div className="h-80 w-full animate-pulse rounded-lg bg-gradient-to-r from-gray-100 via-gray-200 to-gray-100"></div>
      ) : chartData.length === 0 ? (
        <div className="flex h-80 items-center justify-center rounded-lg bg-gradient-to-br from-gray-50 to-gray-100/50">
          <p className="text-lg font-medium text-gray-500">لا توجد بيانات للعرض</p>
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={340}>
          <LineChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="colorCurrent" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
              </linearGradient>
              <filter id="shadowRevenue">
                <feDropShadow dx="0" dy="4" stdDeviation="4" floodOpacity="0.3"/>
              </filter>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#d1fae5" vertical={false} />
            <XAxis
              dataKey="formattedDate"
              stroke="#6b7280"
              fontSize={12}
              fontWeight={500}
              tick={{ fill: '#6b7280' }}
              axisLine={{ stroke: '#e5e7eb' }}
            />
            <YAxis
              stroke="#6b7280"
              fontSize={12}
              fontWeight={500}
              tick={{ fill: '#6b7280' }}
              axisLine={{ stroke: '#e5e7eb' }}
              tickFormatter={(value) => formatCurrency(value, currentCurrency)}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#fff',
                border: 'none',
                borderRadius: '12px',
                fontSize: '13px',
                fontWeight: 500,
                boxShadow: '0 10px 40px rgba(0, 0, 0, 0.1)',
                padding: '12px 16px',
              }}
              labelStyle={{ fontWeight: 600, color: '#1f2937', marginBottom: '4px' }}
              labelFormatter={(label) => `التاريخ: ${label}`}
              formatter={(value: number) => formatCurrency(value, currentCurrency)}
            />
            <Legend 
              wrapperStyle={{ paddingTop: '20px', fontWeight: 600 }}
              iconType="circle"
            />
            <Line
              type="monotone"
              dataKey="current"
              stroke="#10b981"
              strokeWidth={3}
              dot={{ fill: '#10b981', r: 5, strokeWidth: 2, stroke: '#fff' }}
              activeDot={{ r: 7, strokeWidth: 2, stroke: '#10b981', fill: '#fff' }}
              name="الفترة الحالية"
              filter="url(#shadowRevenue)"
            />
            {hasComparison && (
              <Line
                type="monotone"
                dataKey="previous"
                stroke="#94a3b8"
                strokeWidth={2.5}
                strokeDasharray="8 4"
                dot={{ fill: '#94a3b8', r: 4, strokeWidth: 2, stroke: '#fff' }}
                activeDot={{ r: 6, strokeWidth: 2 }}
                name="الفترة السابقة"
              />
            )}
          </LineChart>
        </ResponsiveContainer>
      )}
    </div>
  )
}





