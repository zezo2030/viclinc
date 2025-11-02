import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { doctorsApi } from '@/api/doctors'
import { Spinner } from '@/components/common/Spinner'

interface DoctorScheduleProps {
  doctorId: string
}

export default function DoctorSchedule({ doctorId }: DoctorScheduleProps) {
  const [view, setView] = useState<'day' | 'week'>('week')
  const { data, isLoading, error } = useQuery({
    queryKey: ['doctor-schedule', doctorId],
    queryFn: () => doctorsApi.getSchedule(doctorId),
  })

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
        <p className="text-red-600">تعذر تحميل جدول الطبيب</p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200">
      <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between">
        <h3 className="font-semibold">الجدول الزمني للطبيب</h3>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setView('day')}
            className={`px-3 py-1.5 text-sm rounded-lg border ${view === 'day' ? 'bg-primary-600 text-white border-primary-600' : 'bg-white'}`}
          >
            يوم
          </button>
          <button
            onClick={() => setView('week')}
            className={`px-3 py-1.5 text-sm rounded-lg border ${view === 'week' ? 'bg-primary-600 text-white border-primary-600' : 'bg-white'}`}
          >
            أسبوع
          </button>
        </div>
      </div>

      <div className="p-4">
        {/* Placeholder simple rendering until exact shape is finalized */}
        <pre className="text-xs bg-gray-50 border border-gray-200 rounded-md p-3 overflow-auto">
{JSON.stringify({ view, schedule: data }, null, 2)}
        </pre>
      </div>
    </div>
  )
}


