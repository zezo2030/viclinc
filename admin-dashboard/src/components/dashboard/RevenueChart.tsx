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
    <div className="rounded-lg border border-gray-200 bg-white p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">الإيرادات</h3>
          <p className="text-sm text-gray-600">
            إحصائيات الإيرادات حسب الفترة الزمنية ({currentCurrency})
          </p>
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
          <LineChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis
              dataKey="formattedDate"
              stroke="#6b7280"
              fontSize={12}
              tick={{ fill: '#6b7280' }}
            />
            <YAxis
              stroke="#6b7280"
              fontSize={12}
              tick={{ fill: '#6b7280' }}
              tickFormatter={(value) => formatCurrency(value, currentCurrency)}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#fff',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                fontSize: '12px',
              }}
              labelFormatter={(label) => `التاريخ: ${label}`}
              formatter={(value: number) => formatCurrency(value, currentCurrency)}
            />
            <Legend />
            <Line
              type="monotone"
              dataKey="current"
              stroke="#10b981"
              strokeWidth={2}
              dot={{ fill: '#10b981', r: 4 }}
              activeDot={{ r: 6 }}
              name="الفترة الحالية"
            />
            {hasComparison && (
              <Line
                type="monotone"
                dataKey="previous"
                stroke="#94a3b8"
                strokeWidth={2}
                strokeDasharray="5 5"
                dot={{ fill: '#94a3b8', r: 4 }}
                name="الفترة السابقة"
              />
            )}
          </LineChart>
        </ResponsiveContainer>
      )}
    </div>
  )
}



