import type { Appointment } from '@/types/appointment.types'

interface AppointmentDetailsProps {
  appointment: Appointment | null
  onClose: () => void
  onChangeStatus?: (status: string) => void
}

export default function AppointmentDetails({ appointment, onClose, onChangeStatus }: AppointmentDetailsProps) {
  if (!appointment) return null

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { label: string; class: string }> = {
      PENDING_CONFIRM: { label: 'قيد التأكيد', class: 'bg-gradient-to-r from-amber-400 to-orange-500 text-white shadow-lg shadow-amber-400/30' },
      CONFIRMED: { label: 'مؤكد', class: 'bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-lg shadow-green-500/30' },
      CANCELLED: { label: 'ملغى', class: 'bg-[#D62828] text-white shadow-lg shadow-[#D62828]/30' },
      COMPLETED: { label: 'مكتمل', class: 'bg-[#213F6A] text-white shadow-lg shadow-[#213F6A]/30' },
      NO_SHOW: { label: 'عدم حضور', class: 'bg-gradient-to-r from-gray-500 to-gray-600 text-white shadow-lg shadow-gray-500/30' },
      REJECTED: { label: 'مرفوض', class: 'bg-[#D62828] text-white shadow-lg shadow-[#D62828]/30' },
    }
    return statusConfig[status] || { label: status, class: 'bg-gradient-to-r from-gray-400 to-gray-500 text-white' }
  }

  const getTypeBadge = (type: string) => {
    const typeConfig: Record<string, { label: string; icon: string }> = {
      IN_PERSON: { label: 'حضوري', icon: '🏥' },
      VIDEO: { label: 'فيديو', icon: '📹' },
      CHAT: { label: 'شات', icon: '💬' },
    }
    return typeConfig[type] || { label: type, icon: '📅' }
  }

  const statusConfig = getStatusBadge(appointment.status)
  const typeConfig = getTypeBadge(appointment.type)

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-gradient-to-br from-black/60 to-black/40 backdrop-blur-sm p-4 animate-fade-in">
      <div className="w-full sm:max-w-2xl bg-gradient-to-br from-white to-gray-50 rounded-3xl sm:rounded-3xl shadow-2xl border border-gray-200 overflow-hidden animate-slide-in-up">
        {/* Header with Gradient */}
        <div className="relative px-8 py-6 bg-[#D62828] flex items-center justify-between overflow-hidden">
          <div className="relative z-10 flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-lg">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="text-2xl font-black text-white drop-shadow-lg">تفاصيل الموعد</h3>
          </div>
          <button 
            onClick={onClose} 
            className="relative z-10 w-10 h-10 flex items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white transition-all duration-300 hover:scale-110 hover:rotate-90 shadow-lg"
          >
            <span className="text-2xl font-bold">×</span>
          </button>
          {/* Decorative Elements */}
          <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -translate-y-20 translate-x-20 blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-40 h-40 bg-white/10 rounded-full translate-y-20 -translate-x-20 blur-3xl"></div>
        </div>

        {/* Content */}
        <div className="p-8 space-y-6 bg-white">
          {/* Date & Time */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-gradient-to-br from-white to-pink-50 border border-pink-100">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-2xl">📅</span>
                <span className="text-sm font-semibold text-gray-600">التاريخ</span>
              </div>
              <p className="text-lg font-bold text-gray-900">{new Date(appointment.startAt).toLocaleDateString('ar-SA', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
            </div>
            <div className="p-4 rounded-xl bg-gradient-to-br from-white to-pink-50 border border-pink-100">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-2xl">⏰</span>
                <span className="text-sm font-semibold text-gray-600">الوقت</span>
              </div>
              <p className="text-lg font-bold text-gray-900">{new Date(appointment.startAt).toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' })}</p>
            </div>
          </div>

          {/* Status & Type */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-gradient-to-br from-white to-pink-50 border border-pink-100">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-2xl">✅</span>
                <span className="text-sm font-semibold text-gray-600">الحالة</span>
              </div>
              <span className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-bold ${statusConfig.class}`}>
                <span className="w-2 h-2 rounded-full bg-white animate-pulse"></span>
                {statusConfig.label}
              </span>
            </div>
            <div className="p-4 rounded-xl bg-gradient-to-br from-white to-pink-50 border border-pink-100">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-2xl">🎯</span>
                <span className="text-sm font-semibold text-gray-600">النوع</span>
              </div>
              <span className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-bold bg-gradient-to-r from-blue-50 to-cyan-50 text-blue-700 border border-blue-200">
                <span>{typeConfig.icon}</span>
                <span>{typeConfig.label}</span>
              </span>
            </div>
          </div>

          {/* Patient & Doctor */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-gradient-to-br from-white to-pink-50 border border-pink-100">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-2xl">👤</span>
                <span className="text-sm font-semibold text-gray-600">المريض</span>
              </div>
              <p className="text-lg font-bold text-gray-900">{
                (
                  (appointment as any).patient?.name ??
                  (typeof (appointment as any).patientId === 'object'
                    ? (appointment as any).patientId?.name ?? (appointment as any).patientId?._id
                    : (appointment as any).patientId)
                ) ?? 'غير محدد'
              }</p>
            </div>
            <div className="p-4 rounded-xl bg-gradient-to-br from-white to-pink-50 border border-pink-100">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-2xl">👨‍⚕️</span>
                <span className="text-sm font-semibold text-gray-600">الطبيب</span>
              </div>
              <p className="text-lg font-bold text-gray-900">{
                (
                  (appointment as any).doctor?.name ??
                  (typeof (appointment as any).doctorId === 'object'
                    ? (appointment as any).doctorId?.name ?? (appointment as any).doctorId?._id
                    : (appointment as any).doctorId)
                ) ?? 'غير محدد'
              }</p>
            </div>
          </div>

          {/* Price */}
          {appointment.price !== undefined && (
            <div className="p-4 rounded-xl bg-gradient-to-br from-white to-pink-50 border border-pink-100">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-2xl">💵</span>
                <span className="text-sm font-semibold text-gray-600">السعر</span>
              </div>
              <p className="text-2xl font-black text-gray-900">{appointment.price} <span className="text-lg">ر.س</span></p>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="px-8 pb-6 pt-4 bg-gradient-to-br from-white to-pink-50/30 flex flex-wrap items-center justify-end gap-3">
          {appointment.status === 'PENDING_CONFIRM' && (
            <button 
              onClick={() => onChangeStatus?.('CONFIRMED')} 
              className="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl font-bold hover:scale-105 transition-all duration-300 shadow-lg shadow-green-500/30 hover:shadow-xl flex items-center gap-2"
            >
              <span>✅</span>
              <span>تأكيد</span>
            </button>
          )}
          {appointment.status !== 'CANCELLED' && appointment.status !== 'COMPLETED' && (
            <button 
              onClick={() => onChangeStatus?.('CANCELLED')} 
              className="px-6 py-3 bg-gradient-to-r from-red-500 to-rose-600 text-white rounded-xl font-bold hover:scale-105 transition-all duration-300 shadow-lg shadow-red-500/30 hover:shadow-xl flex items-center gap-2"
            >
              <span>❌</span>
              <span>إلغاء</span>
            </button>
          )}
          <button 
            onClick={onClose} 
            className="px-6 py-3 rounded-xl border-2 border-gray-300 text-gray-700 font-semibold hover:bg-gray-50 hover:border-gray-400 transition-all duration-300 hover:scale-105"
          >
            إغلاق
          </button>
        </div>
      </div>
    </div>
  )
}


