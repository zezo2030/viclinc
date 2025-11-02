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
    primary: 'border-blue-200 bg-blue-50',
    success: 'border-green-200 bg-green-50',
    warning: 'border-yellow-200 bg-yellow-50',
    danger: 'border-red-200 bg-red-50',
    neutral: 'border-gray-200 bg-white',
  }

  const iconColors = {
    primary: 'text-blue-600',
    success: 'text-green-600',
    warning: 'text-yellow-600',
    danger: 'text-red-600',
    neutral: 'text-gray-600',
  }

  if (isLoading) {
    return (
      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="mb-2 h-4 w-24 animate-pulse rounded bg-gray-200"></div>
            <div className="mb-4 h-8 w-32 animate-pulse rounded bg-gray-200"></div>
          </div>
          <div className="h-10 w-10 animate-pulse rounded-full bg-gray-200"></div>
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
          'flex items-center gap-1 text-sm font-medium',
          isNeutral
            ? 'text-gray-600'
            : isPositive
              ? 'text-green-600'
              : 'text-red-600'
        )}
      >
        {isNeutral ? (
          <Minus className="h-4 w-4" />
        ) : isPositive ? (
          <TrendingUp className="h-4 w-4" />
        ) : (
          <TrendingDown className="h-4 w-4" />
        )}
        <span>{deltaValue.toFixed(1)}%</span>
      </div>
    )
  }

  return (
    <div
      className={cn(
        'rounded-lg border p-6 transition-shadow hover:shadow-md',
        variantStyles[variant]
      )}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="mt-2 text-2xl font-bold text-gray-900">
            {formatValue(value)}
          </p>
          {renderDelta()}
        </div>
        {icon && (
          <div className={cn('rounded-full p-2', iconColors[variant])}>
            {icon}
          </div>
        )}
      </div>
    </div>
  )
}



