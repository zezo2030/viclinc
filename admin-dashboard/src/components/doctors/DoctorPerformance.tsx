import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { doctorsApi } from '@/api/doctors'
import { Spinner } from '@/components/common/Spinner'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'

interface DoctorPerformanceProps {
  doctorId: string
}

type Appointment = {
  id: string
  status: 'PENDING_CONFIRM' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED' | 'NO_SHOW' | 'REJECTED'
  amount?: number
}

export default function DoctorPerformance({ doctorId }: DoctorPerformanceProps) {
  const { data, isLoading, error } = useQuery({
    queryKey: ['doctor-appointments', doctorId],
    queryFn: () => doctorsApi.getAppointments(doctorId, { page: 1, limit: 200 }),
  })

  const { confirmed, completed, cancelled, revenue } = useMemo(() => {
    const list: Appointment[] = data?.data || []
    const counts = {
      confirmed: list.filter((a) => a.status === 'CONFIRMED').length,
      completed: list.filter((a) => a.status === 'COMPLETED').length,
      cancelled: list.filter((a) => a.status === 'CANCELLED').length,
      revenue: list.reduce((sum, a) => sum + (a.amount || 0), 0),
    }
    return counts
  }, [data])

  const chartData = [
    { name: 'مؤكدة', value: confirmed },
    { name: 'مكتملة', value: completed },
    { name: 'ملغاة', value: cancelled },
  ]

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-8 flex items-center justify-center">
        <Spinner />
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg border border-red-200 p-6 text-center">
        <p className="text-red-600">تعذر تحميل أداء الطبيب</p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200">
      <div className="px-4 py-3 border-b border-gray-200">
        <h3 className="font-semibold">أداء الطبيب</h3>
      </div>
      <div className="p-4 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 border rounded-lg">
          <div className="text-gray-500 text-sm">المواعيد المؤكدة</div>
          <div className="text-2xl font-semibold mt-1">{confirmed}</div>
        </div>
        <div className="p-4 border rounded-lg">
          <div className="text-gray-500 text-sm">المواعيد المكتملة</div>
          <div className="text-2xl font-semibold mt-1">{completed}</div>
        </div>
        <div className="p-4 border rounded-lg">
          <div className="text-gray-500 text-sm">المواعيد الملغاة</div>
          <div className="text-2xl font-semibold mt-1">{cancelled}</div>
        </div>
      </div>
      <div className="px-4 pb-4" style={{ height: 280 }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData}>
            <XAxis dataKey="name" />
            <YAxis allowDecimals={false} />
            <Tooltip />
            <Bar dataKey="value" fill="#3B82F6" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
      <div className="px-4 pb-4">
        <div className="p-4 border rounded-lg">
          <div className="text-gray-500 text-sm">إجمالي الإيرادات (تقريبي)</div>
          <div className="text-xl font-semibold mt-1">{revenue.toLocaleString()} ﷼</div>
        </div>
      </div>
    </div>
  )
}


