import { cn } from '@/utils/cn'
import type { MetricCardProps } from '@/types'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'

export default function MetricCard({
  title,
  value,
  delta,
  icon,
  isLoading = false,
  variant = 'neutral',
}: MetricCardProps) {
  const variantStyles = {
    primary: 'border-blue-100 bg-gradient-to-br from-blue-50 to-blue-100/50 hover:from-blue-100 hover:to-blue-200/50',
    success: 'border-green-100 bg-gradient-to-br from-green-50 to-green-100/50 hover:from-green-100 hover:to-green-200/50',
    warning: 'border-amber-100 bg-gradient-to-br from-amber-50 to-amber-100/50 hover:from-amber-100 hover:to-amber-200/50',
    danger: 'border-red-100 bg-gradient-to-br from-red-50 to-red-100/50 hover:from-red-100 hover:to-red-200/50',
    neutral: 'border-gray-100 bg-gradient-to-br from-white to-gray-50 hover:from-gray-50 hover:to-gray-100',
  }

  const iconStyles = {
    primary: 'bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-500/30',
    success: 'bg-gradient-to-br from-green-500 to-green-600 text-white shadow-lg shadow-green-500/30',
    warning: 'bg-gradient-to-br from-amber-500 to-amber-600 text-white shadow-lg shadow-amber-500/30',
    danger: 'bg-gradient-to-br from-red-500 to-red-600 text-white shadow-lg shadow-red-500/30',
    neutral: 'bg-gradient-to-br from-gray-500 to-gray-600 text-white shadow-lg shadow-gray-500/30',
  }

  if (isLoading) {
    return (
      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="mb-2 h-4 w-24 animate-pulse rounded bg-gray-200"></div>
            <div className="mb-4 h-8 w-32 animate-pulse rounded bg-gray-200"></div>
            <div className="h-4 w-16 animate-pulse rounded bg-gray-200"></div>
          </div>
          <div className="h-12 w-12 animate-pulse rounded-xl bg-gray-200"></div>
        </div>
      </div>
    )
  }

  const formatValue = (val: number | string): string => {
    if (typeof val === 'number') {
      // تنسيق الأرقام الكبيرة
      if (val >= 1000000) {
        return `${(val / 1000000).toFixed(1)}م`
      }
      if (val >= 1000) {
        return `${(val / 1000).toFixed(1)}ك`
      }
      return val.toLocaleString('ar-SA')
    }
    return val
  }

  const renderDelta = () => {
    if (delta === undefined || delta === null) return null

    const isPositive = delta > 0
    const isNeutral = delta === 0
    const deltaValue = Math.abs(delta)

    return (
      <div
        className={cn(
          'mt-2 inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold',
          isNeutral
            ? 'bg-gray-100 text-gray-700'
            : isPositive
              ? 'bg-green-100 text-green-700'
              : 'bg-red-100 text-red-700'
        )}
      >
        {isNeutral ? (
          <Minus className="h-3 w-3" />
        ) : isPositive ? (
          <TrendingUp className="h-3 w-3" />
        ) : (
          <TrendingDown className="h-3 w-3" />
        )}
        <span>{deltaValue.toFixed(1)}%</span>
      </div>
    )
  }

  return (
    <div
      className={cn(
        'group rounded-xl border p-6 shadow-sm transition-all duration-300 hover:shadow-xl hover:scale-105 cursor-pointer',
        variantStyles[variant]
      )}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-semibold text-gray-600 uppercase tracking-wide">{title}</p>
          <p className="mt-3 text-3xl font-bold text-gray-900 transition-all duration-300 group-hover:scale-110">
            {formatValue(value)}
          </p>
          {renderDelta()}
        </div>
        {icon && (
          <div className={cn(
            'rounded-xl p-3 transition-all duration-300 group-hover:scale-110 group-hover:rotate-6',
            iconStyles[variant]
          )}>
            {icon}
          </div>
        )}
      </div>
    </div>
  )
}





