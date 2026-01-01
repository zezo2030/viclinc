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
    primary: 'border-[#6366f1]/20 bg-white hover:bg-[#6366f1]/5',
    success: 'border-[#10b981]/20 bg-white hover:bg-[#10b981]/5',
    warning: 'border-[#f59e0b]/20 bg-white hover:bg-[#f59e0b]/5',
    danger: 'border-[#ef4444]/20 bg-white hover:bg-[#ef4444]/5',
    neutral: 'border-[#e2e8f0] bg-white hover:bg-[#f8fafc]',
  }

  const iconStyles = {
    primary: 'bg-[#6366f1] text-white shadow-sm',
    success: 'bg-[#10b981] text-white shadow-sm',
    warning: 'bg-[#f59e0b] text-white shadow-sm',
    danger: 'bg-[#ef4444] text-white shadow-sm',
    neutral: 'bg-[#64748b] text-white shadow-sm',
  }

  if (isLoading) {
    return (
      <div className="rounded-xl border border-[#e2e8f0] bg-white p-6 shadow-sm">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="mb-2 h-4 w-24 animate-pulse rounded bg-[#e2e8f0]"></div>
            <div className="mb-4 h-8 w-32 animate-pulse rounded bg-[#e2e8f0]"></div>
            <div className="h-4 w-16 animate-pulse rounded bg-[#e2e8f0]"></div>
          </div>
          <div className="h-12 w-12 animate-pulse rounded-xl bg-[#e2e8f0]"></div>
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
        'group rounded-xl border p-6 shadow-sm transition-all duration-150 ease-out hover:shadow-sm hover:scale-[1.02] cursor-pointer',
        variantStyles[variant]
      )}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-[#64748b] uppercase tracking-wide">{title}</p>
          <p className="mt-3 text-3xl font-semibold text-[#0f172a] transition-all duration-150 ease-out">
            {formatValue(value)}
          </p>
          {renderDelta()}
        </div>
        {icon && (
          <div className={cn(
            'rounded-lg p-3 transition-all duration-150 ease-out',
            iconStyles[variant]
          )}>
            {icon}
          </div>
        )}
      </div>
    </div>
  )
}





