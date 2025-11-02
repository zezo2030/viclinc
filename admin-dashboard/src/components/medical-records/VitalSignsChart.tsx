import { useState } from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { Activity, Thermometer, Heart, Gauge } from 'lucide-react'
import type { VitalSignsChartProps } from '@/types'
import { format } from 'date-fns'

export default function VitalSignsChart({ records, selectedSign }: VitalSignsChartProps) {
  const [activeSign, setActiveSign] = useState<'bloodPressure' | 'temperature' | 'heartRate' | 'weight' | undefined>(
    selectedSign
  )

  if (!records || records.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
        <Activity className="w-16 h-16 mx-auto mb-4 text-gray-300" />
        <p className="text-gray-600">لا توجد بيانات للعرض</p>
      </div>
    )
  }

  // Prepare chart data
  const chartData = records
    .filter((record) => record.vitalSigns && record.createdAt)
    .map((record) => {
      const vital = record.vitalSigns!
      const bp = vital.bloodPressure
      const bpSys = bp ? parseInt(bp.split('/')[0]) : null
      const bpDia = bp ? parseInt(bp.split('/')[1]) : null

      return {
        date: format(new Date(record.createdAt), 'MM-dd HH:mm'),
        bloodPressureSys: bpSys,
        bloodPressureDia: bpDia,
        temperature: vital.temperature,
        heartRate: vital.heartRate,
        weight: vital.weight,
      }
    })

  const signs = [
    { key: 'bloodPressure', label: 'ضغط الدم', icon: Heart, color: '#ef4444' },
    { key: 'temperature', label: 'درجة الحرارة', icon: Thermometer, color: '#f97316' },
    { key: 'heartRate', label: 'معدل النبض', icon: Activity, color: '#ec4899' },
    { key: 'weight', label: 'الوزن', icon: Gauge, color: '#3b82f6' },
  ] as const

  const renderChart = () => {
    if (activeSign === 'bloodPressure') {
      return (
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="bloodPressureSys" stroke="#ef4444" name="الانقباضي" />
            <Line type="monotone" dataKey="bloodPressureDia" stroke="#dc2626" name="الانبساطي" />
          </LineChart>
        </ResponsiveContainer>
      )
    }

    if (activeSign) {
      const config = signs.find((s) => s.key === activeSign)
      if (!config) return null

      return (
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line
              type="monotone"
              dataKey={activeSign}
              stroke={config.color}
              name={config.label}
              strokeWidth={2}
              dot={{ r: 4 }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      )
    }

    // Show all in one chart
    return (
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis yAxisId="left" />
          <YAxis yAxisId="right" orientation="right" />
          <Tooltip />
          <Legend />
          <Line type="monotone" dataKey="temperature" stroke="#f97316" name="درجة الحرارة" yAxisId="left" />
          <Line type="monotone" dataKey="heartRate" stroke="#ec4899" name="معدل النبض" yAxisId="left" />
          <Line type="monotone" dataKey="weight" stroke="#3b82f6" name="الوزن" yAxisId="right" />
        </LineChart>
      </ResponsiveContainer>
    )
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">العلامات الحيوية على الزمن</h3>
        <div className="flex items-center gap-2">
          {signs.map((sign) => {
            const Icon = sign.icon
            const isActive = activeSign === sign.key
            return (
              <button
                key={sign.key}
                onClick={() => setActiveSign(isActive ? undefined : sign.key)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-primary-100 text-primary-700 border border-primary-300'
                    : 'bg-gray-100 text-gray-700 border border-transparent hover:bg-gray-200'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{sign.label}</span>
              </button>
            )
          })}
        </div>
      </div>
      {renderChart()}
    </div>
  )
}

