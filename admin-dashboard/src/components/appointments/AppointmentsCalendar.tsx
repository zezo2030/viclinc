import type { Appointment } from '@/types/appointment.types'

interface AppointmentsCalendarProps {
  view: 'day' | 'week' | 'month'
  onViewChange?: (view: 'day' | 'week' | 'month') => void
  appointments: Appointment[]
}

export default function AppointmentsCalendar({ view, onViewChange, appointments }: AppointmentsCalendarProps) {
  // Placeholder minimal calendar: header + simple list by startAt
  return (
    <div className="bg-white rounded-lg border border-gray-200">
      <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between">
        <h3 className="font-semibold">التقويم</h3>
        <div className="flex items-center gap-2">
          <button
            onClick={() => onViewChange?.('day')}
            className={`px-3 py-1.5 text-sm rounded-lg border ${view === 'day' ? 'bg-primary-600 text-white border-primary-600' : 'bg-white'}`}
          >
            يوم
          </button>
          <button
            onClick={() => onViewChange?.('week')}
            className={`px-3 py-1.5 text-sm rounded-lg border ${view === 'week' ? 'bg-primary-600 text-white border-primary-600' : 'bg-white'}`}
          >
            أسبوع
          </button>
          <button
            onClick={() => onViewChange?.('month')}
            className={`px-3 py-1.5 text-sm rounded-lg border ${view === 'month' ? 'bg-primary-600 text-white border-primary-600' : 'bg-white'}`}
          >
            شهر
          </button>
        </div>
      </div>
      <div className="p-4 space-y-2">
        {appointments.length === 0 ? (
          <div className="text-gray-500 text-sm">لا توجد مواعيد.</div>
        ) : (
          appointments
            .slice(0, 10)
            .map((a) => (
              <div key={a.id} className="p-3 border rounded-lg flex items-center justify-between">
                <div className="text-sm text-gray-900">{new Date(a.startAt).toLocaleString('ar-SA')}</div>
                <div className="text-xs text-gray-600">{a.type}</div>
                <div className="text-xs">{a.status}</div>
              </div>
            ))
        )}
      </div>
    </div>
  )
}


