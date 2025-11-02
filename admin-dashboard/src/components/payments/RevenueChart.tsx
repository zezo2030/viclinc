import { useEffect, useMemo, useState } from 'react'
import { metricsApi } from '@/api/metrics'

type Range = '7d' | '30d' | '90d'

export function RevenueChart() {
  const [range, setRange] = useState<Range>('30d')
  const [state, setState] = useState<{ loading: boolean; error?: string; series: { date: string; value: number }[]; currency: string }>({ loading: true, series: [], currency: 'SAR' })

  useEffect(() => {
    let cancelled = false
    setState((s) => ({ ...s, loading: true, error: undefined }))
    metricsApi
      .getRevenue({ range })
      .then((res) => {
        if (cancelled) return
        setState({ loading: false, series: res.series, currency: res.currency, error: undefined })
      })
      .catch((e) => {
        if (cancelled) return
        setState((s) => ({ ...s, loading: false, error: 'فشل تحميل الإيرادات' }))
      })
    return () => {
      cancelled = true
    }
  }, [range])

  const total = useMemo(() => state.series.reduce((sum, p) => sum + (p.value || 0), 0), [state.series])
  const average = useMemo(() => (state.series.length ? total / state.series.length : 0), [state.series, total])

  return (
    <div className="border rounded p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold">الإيرادات</h3>
        <select value={range} onChange={(e) => setRange(e.target.value as Range)} className="border rounded px-2 py-1 text-sm">
          <option value="7d">7 أيام</option>
          <option value="30d">30 يوم</option>
          <option value="90d">90 يوم</option>
        </select>
      </div>

      {state.loading && <div className="py-8 text-center text-gray-500">جاري التحميل...</div>}
      {state.error && !state.loading && <div className="py-8 text-center text-red-600">{state.error}</div>}

      {!state.loading && !state.error && (
        <div className="space-y-3">
          <div className="text-sm text-gray-600">الإجمالي: <span className="font-medium">{total.toFixed(2)} {state.currency}</span></div>
          <div className="text-sm text-gray-600">المتوسط: <span className="font-medium">{average.toFixed(2)} {state.currency}</span></div>
          <div className="h-24 grid grid-cols-12 gap-1 items-end">
            {state.series.slice(-12).map((p, idx) => (
              <div key={idx} title={`${p.date} - ${p.value}`} className="bg-green-500/70" style={{ height: `${Math.min(100, (p.value / (average || 1)) * 40 + 10)}%` }} />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}


