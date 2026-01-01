import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Clock, User, Stethoscope } from 'lucide-react'
import type { Appointment } from '@/types/appointment.types'

interface AppointmentsCalendarProps {
  view: 'day' | 'week' | 'month'
  onViewChange?: (view: 'day' | 'week' | 'month') => void
  appointments: Appointment[]
}

export default function AppointmentsCalendar({ view, onViewChange, appointments }: AppointmentsCalendarProps) {
  const navigate = useNavigate()
  const [currentDate, setCurrentDate] = useState(new Date())

  // Get start of week (Sunday = 0, but we want Saturday = 6 for Arabic)
  const getWeekStart = (date: Date) => {
    const d = new Date(date)
    const day = d.getDay() // 0 = Sunday, 6 = Saturday
    const diff = day === 6 ? 0 : day + 1 // Adjust for Arabic week (Saturday = start)
    d.setDate(d.getDate() - diff)
    d.setHours(0, 0, 0, 0)
    return d
  }

  const getMonthStart = (date: Date) => {
    const d = new Date(date)
    d.setDate(1)
    d.setHours(0, 0, 0, 0)
    return d
  }

  const weekStart = useMemo(() => getWeekStart(currentDate), [currentDate])
  const monthStart = useMemo(() => getMonthStart(currentDate), [currentDate])

  // Navigation functions
  const goToPrevious = () => {
    const newDate = new Date(currentDate)
    if (view === 'day') {
      newDate.setDate(newDate.getDate() - 1)
    } else if (view === 'week') {
      newDate.setDate(newDate.getDate() - 7)
    } else {
      newDate.setMonth(newDate.getMonth() - 1)
    }
    setCurrentDate(newDate)
  }

  const goToNext = () => {
    const newDate = new Date(currentDate)
    if (view === 'day') {
      newDate.setDate(newDate.getDate() + 1)
    } else if (view === 'week') {
      newDate.setDate(newDate.getDate() + 7)
    } else {
      newDate.setMonth(newDate.getMonth() + 1)
    }
    setCurrentDate(newDate)
  }

  const goToToday = () => {
    setCurrentDate(new Date())
  }

  // Get appointments for a specific date
  const getAppointmentsForDate = (date: Date) => {
    const dateStr = date.toDateString()
    return appointments.filter((apt) => {
      const aptDate = new Date(apt.startAt)
      return aptDate.toDateString() === dateStr
    })
  }

  // Get status color
  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      PENDING_CONFIRM: 'bg-gradient-to-r from-amber-400 to-orange-500 border-amber-300',
      CONFIRMED: 'bg-gradient-to-r from-green-500 to-emerald-600 border-green-300',
      CANCELLED: 'bg-[#D62828] border-[#D62828]',
      COMPLETED: 'bg-[#213F6A] border-[#213F6A]',
      NO_SHOW: 'bg-gradient-to-r from-gray-500 to-gray-600 border-gray-300',
      REJECTED: 'bg-[#D62828] border-[#D62828]',
    }
    return colors[status] || 'bg-gradient-to-r from-gray-400 to-gray-500 border-gray-300'
  }

  // Get type icon
  const getTypeIcon = (type: string) => {
    if (type === 'VIDEO') return '📹'
    if (type === 'CHAT') return '💬'
    return '🏥'
  }

  // Format date for display
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('ar-SA', { weekday: 'short', day: 'numeric', month: 'short' })
  }

  // Day view
  const renderDayView = () => {
    const dayAppointments = getAppointmentsForDate(currentDate)
    const isToday = currentDate.toDateString() === new Date().toDateString()

    return (
      <div className="space-y-4">
        <div className={`p-6 rounded-2xl border-2 ${isToday ? 'bg-[#E8E8E8] border-[#D62828]' : 'bg-white border-gray-200'}`}>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-2xl font-bold text-[#213F6A]">
                {currentDate.toLocaleDateString('ar-SA', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              </h3>
              {isToday && (
                <span className="inline-flex items-center gap-1 mt-1 px-3 py-1 bg-[#D62828] text-white text-xs font-semibold rounded-full">
                  اليوم
                </span>
              )}
            </div>
          </div>
          <div className="space-y-3">
            {dayAppointments.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <CalendarIcon className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                <p>لا توجد مواعيد في هذا اليوم</p>
              </div>
            ) : (
              dayAppointments
                .sort((a, b) => new Date(a.startAt).getTime() - new Date(b.startAt).getTime())
                .map((apt) => (
                  <button
                    key={apt.id}
                    onClick={() => navigate(`/appointments/${apt.id}`)}
                    className={`w-full p-4 rounded-xl border-2 ${getStatusColor(apt.status)} text-white text-right hover:scale-[1.02] transition-all duration-300 shadow-lg hover:shadow-xl`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        <span className="text-sm font-semibold">
                          {new Date(apt.startAt).toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <span className="text-lg">{getTypeIcon(apt.type)}</span>
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-sm">
                        <User className="w-4 h-4" />
                        <span className="font-medium">{(apt as any).patientName || 'مريض'}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Stethoscope className="w-4 h-4" />
                        <span>{(apt as any).doctorName || 'طبيب'}</span>
                      </div>
                    </div>
                  </button>
                ))
            )}
          </div>
        </div>
      </div>
    )
  }

  // Week view
  const renderWeekView = () => {
    const weekDays = Array.from({ length: 7 }, (_, i) => {
      const date = new Date(weekStart)
      date.setDate(weekStart.getDate() + i)
      return date
    })

    return (
      <div className="space-y-4">
        <div className="grid grid-cols-7 gap-2">
          {weekDays.map((day, index) => {
            const dayAppointments = getAppointmentsForDate(day)
            const isToday = day.toDateString() === new Date().toDateString()
            const isWeekend = day.getDay() === 5 || day.getDay() === 6 // Friday or Saturday

            return (
              <div
                key={index}
                className={`rounded-xl border-2 p-3 min-h-[200px] ${
                  isToday
                    ? 'bg-[#E8E8E8] border-[#D62828] shadow-lg'
                    : isWeekend
                    ? 'bg-gray-50 border-gray-200'
                    : 'bg-white border-gray-200'
                }`}
              >
                <div className="mb-2">
                  <div className="flex items-center justify-between mb-1">
                    <span className={`text-xs font-semibold ${isWeekend ? 'text-gray-500' : 'text-gray-600'}`}>
                      {day.toLocaleDateString('ar-SA', { weekday: 'short' })}
                    </span>
                    {isToday && (
                      <span className="w-2 h-2 bg-[#D62828] rounded-full"></span>
                    )}
                  </div>
                  <span className={`text-lg font-bold ${isToday ? 'text-[#D62828]' : 'text-[#213F6A]'}`}>
                    {day.getDate()}
                  </span>
                </div>
                <div className="space-y-1.5 max-h-[140px] overflow-y-auto">
                  {dayAppointments.slice(0, 3).map((apt) => (
                    <button
                      key={apt.id}
                      onClick={() => navigate(`/appointments/${apt.id}`)}
                      className={`w-full p-2 rounded-lg border text-xs text-right hover:scale-105 transition-all duration-200 ${getStatusColor(apt.status)} text-white shadow-sm`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs">{getTypeIcon(apt.type)}</span>
                        <span className="font-semibold">
                          {new Date(apt.startAt).toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <div className="truncate text-xs">
                        {(apt as any).patientName || 'مريض'}
                      </div>
                    </button>
                  ))}
                  {dayAppointments.length > 3 && (
                    <div className="text-xs text-gray-500 text-center py-1">
                      +{dayAppointments.length - 3} أكثر
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    )
  }

  // Month view
  const renderMonthView = () => {
    const year = monthStart.getFullYear()
    const month = monthStart.getMonth()
    
    // Get first day of month and adjust for Arabic week (Saturday = 0)
    const firstDay = new Date(year, month, 1)
    const firstDayWeekDay = firstDay.getDay()
    const startOffset = firstDayWeekDay === 6 ? 0 : firstDayWeekDay + 1
    
    // Get last day of month
    const lastDay = new Date(year, month + 1, 0)
    const daysInMonth = lastDay.getDate()
    
    // Create calendar grid
    const days: (Date | null)[] = []
    
    // Add empty cells for days before month starts
    for (let i = 0; i < startOffset; i++) {
      days.push(null)
    }
    
    // Add days of month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day))
    }
    
    // Fill remaining cells to complete grid (6 rows x 7 columns = 42 cells)
    while (days.length < 42) {
      days.push(null)
    }

    const weekDays = ['سبت', 'أحد', 'اثنين', 'ثلاثاء', 'أربعاء', 'خميس', 'جمعة']

    return (
      <div className="space-y-4">
        {/* Week day headers */}
        <div className="grid grid-cols-7 gap-2">
          {weekDays.map((day, index) => (
            <div
              key={index}
              className={`text-center py-2 font-bold text-sm ${
                index === 5 || index === 6 ? 'text-gray-500' : 'text-gray-700'
              }`}
            >
              {day}
            </div>
          ))}
        </div>

        {/* Calendar grid */}
        <div className="grid grid-cols-7 gap-2">
          {days.map((day, index) => {
            if (!day) {
              return <div key={index} className="min-h-[120px]"></div>
            }

            const dayAppointments = getAppointmentsForDate(day)
            const isToday = day.toDateString() === new Date().toDateString()
            const isWeekend = day.getDay() === 5 || day.getDay() === 6
            const isCurrentMonth = day.getMonth() === month

            return (
              <div
                key={index}
                className={`min-h-[120px] rounded-xl border-2 p-2 ${
                  !isCurrentMonth
                    ? 'bg-gray-50 border-gray-100 opacity-50'
                    : isToday
                    ? 'bg-[#E8E8E8] border-[#D62828] shadow-lg'
                    : isWeekend
                    ? 'bg-gray-50 border-gray-200'
                    : 'bg-white border-gray-200'
                }`}
              >
                <div className="mb-1">
                  <span
                    className={`text-sm font-bold ${
                      isToday ? 'text-[#D62828]' : !isCurrentMonth ? 'text-gray-400' : 'text-[#213F6A]'
                    }`}
                  >
                    {day.getDate()}
                  </span>
                  {isToday && (
                    <span className="mr-1 w-1.5 h-1.5 bg-[#D62828] rounded-full inline-block"></span>
                  )}
                </div>
                <div className="space-y-1 max-h-[80px] overflow-y-auto">
                  {dayAppointments.slice(0, 2).map((apt) => (
                    <button
                      key={apt.id}
                      onClick={() => navigate(`/appointments/${apt.id}`)}
                      className={`w-full p-1.5 rounded-lg border text-[10px] text-right hover:scale-105 transition-all duration-200 ${getStatusColor(apt.status)} text-white shadow-sm`}
                    >
                      <div className="flex items-center justify-between">
                        <span>{getTypeIcon(apt.type)}</span>
                        <span className="font-semibold truncate">
                          {new Date(apt.startAt).toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </button>
                  ))}
                  {dayAppointments.length > 2 && (
                    <div className="text-[10px] text-gray-500 text-center py-0.5">
                      +{dayAppointments.length - 2}
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    )
  }

  const getViewTitle = () => {
    if (view === 'day') {
      return currentDate.toLocaleDateString('ar-SA', { year: 'numeric', month: 'long', day: 'numeric' })
    } else if (view === 'week') {
      const weekEnd = new Date(weekStart)
      weekEnd.setDate(weekStart.getDate() + 6)
      return `${weekStart.toLocaleDateString('ar-SA', { day: 'numeric', month: 'short' })} - ${weekEnd.toLocaleDateString('ar-SA', { day: 'numeric', month: 'short', year: 'numeric' })}`
    } else {
      return currentDate.toLocaleDateString('ar-SA', { year: 'numeric', month: 'long' })
    }
  }

  return (
    <div className="mb-8 rounded-2xl bg-white border border-gray-200 overflow-hidden shadow-lg">
      {/* Header */}
      <div className="px-6 py-4 bg-[#E8E8E8] border-b border-gray-200">
        <div className="flex items-center justify-between flex-wrap gap-4">
          {/* Navigation */}
          <div className="flex items-center gap-3">
            <button
              onClick={goToPrevious}
              className="p-2 rounded-xl bg-white border border-gray-200 hover:bg-gray-50 hover:scale-105 transition-all duration-300 shadow-sm"
            >
              <ChevronLeft className="w-5 h-5 text-gray-700" />
            </button>
            <button
              onClick={goToToday}
              className="px-4 py-2 rounded-xl bg-[#D62828] text-white text-sm font-semibold hover:bg-[#b91c1c] hover:scale-105 transition-all duration-300 shadow-lg shadow-[#D62828]/30"
            >
              اليوم
            </button>
            <button
              onClick={goToNext}
              className="p-2 rounded-xl bg-white border border-gray-200 hover:bg-gray-50 hover:scale-105 transition-all duration-300 shadow-sm"
            >
              <ChevronRight className="w-5 h-5 text-gray-700" />
            </button>
            <div className="mr-4">
              <h2 className="text-xl font-bold text-[#213F6A]">{getViewTitle()}</h2>
            </div>
          </div>

          {/* View switcher */}
          <div className="flex items-center gap-2 bg-white rounded-xl p-1 border border-gray-200 shadow-sm">
            <button
              onClick={() => onViewChange?.('day')}
              className={`px-4 py-2 text-sm font-semibold rounded-lg transition-all duration-300 ${
                view === 'day'
                  ? 'bg-[#D62828] text-white shadow-lg shadow-[#D62828]/30'
                  : 'text-[#213F6A] hover:bg-[#E8E8E8]'
              }`}
            >
              يوم
            </button>
            <button
              onClick={() => onViewChange?.('week')}
              className={`px-4 py-2 text-sm font-semibold rounded-lg transition-all duration-300 ${
                view === 'week'
                  ? 'bg-[#D62828] text-white shadow-lg shadow-[#D62828]/30'
                  : 'text-[#213F6A] hover:bg-[#E8E8E8]'
              }`}
            >
              أسبوع
            </button>
            <button
              onClick={() => onViewChange?.('month')}
              className={`px-4 py-2 text-sm font-semibold rounded-lg transition-all duration-300 ${
                view === 'month'
                  ? 'bg-[#D62828] text-white shadow-lg shadow-[#D62828]/30'
                  : 'text-[#213F6A] hover:bg-[#E8E8E8]'
              }`}
            >
              شهر
            </button>
          </div>
        </div>
      </div>

      {/* Calendar content */}
      <div className="p-6">
        {view === 'day' && renderDayView()}
        {view === 'week' && renderWeekView()}
        {view === 'month' && renderMonthView()}
      </div>
    </div>
  )
}
