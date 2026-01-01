import { Spinner } from '@/components/common/Spinner'
import type { Appointment } from '@/types/appointment.types'

interface AppointmentsTableProps {
  appointments: Appointment[]
  isLoading?: boolean
  pagination?: { page: number; totalPages: number; total: number }
  onPageChange?: (page: number) => void
  onOpenDetails?: (appointment: Appointment) => void
  onDelete?: (appointment: Appointment) => void
}

export default function AppointmentsTable({
  appointments,
  isLoading,
  pagination,
  onPageChange,
  onOpenDetails,
  onDelete,
}: AppointmentsTableProps) {
  if (isLoading) {
    return (
      <div className="rounded-2xl bg-gradient-to-br from-white to-gray-50 border border-gray-100 p-12 shadow-lg">
        <div className="flex flex-col items-center justify-center gap-6">
          <div className="relative">
            <Spinner size="lg" />
            <div className="absolute inset-0 animate-ping opacity-20">
              <Spinner size="lg" />
            </div>
          </div>
          <div className="text-center">
            <p className="text-xl font-bold text-gray-900">جاري التحميل...</p>
            <p className="text-sm text-gray-500 mt-1">يرجى الانتظار</p>
          </div>
        </div>
      </div>
    )
  }

  if (!appointments || appointments.length === 0) {
    return (
      <div className="rounded-2xl bg-white border border-gray-200 p-12 shadow-lg">
        <div className="flex flex-col items-center justify-center gap-6">
          <div className="inline-flex items-center justify-center w-24 h-24 rounded-2xl bg-[#E8E8E8]">
            <svg className="w-12 h-12 text-[#D62828]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-[#213F6A] mb-2">لا توجد مواعيد</p>
            <p className="text-[#333333]">ابدأ بإضافة أول موعد لنظامك</p>
          </div>
        </div>
      </div>
    )
  }

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { label: string; class: string }> = {
      PENDING_CONFIRM: { label: 'قيد التأكيد', class: 'bg-gradient-to-r from-amber-400 to-orange-500 text-white shadow-lg shadow-amber-400/30' },
      CONFIRMED: { label: 'مؤكد', class: 'bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-lg shadow-green-500/30' },
      CANCELLED: { label: 'ملغى', class: 'bg-gradient-to-r from-red-500 to-rose-600 text-white shadow-lg shadow-red-500/30' },
      COMPLETED: { label: 'مكتمل', class: 'bg-[#213F6A] text-white shadow-lg shadow-[#213F6A]/30' },
      NO_SHOW: { label: 'عدم حضور', class: 'bg-gradient-to-r from-gray-500 to-gray-600 text-white shadow-lg shadow-gray-500/30' },
      REJECTED: { label: 'مرفوض', class: 'bg-gradient-to-r from-red-600 to-red-700 text-white shadow-lg shadow-red-600/30' },
    }
    const config = statusConfig[status] || { label: status, class: 'bg-gradient-to-r from-gray-400 to-gray-500 text-white' }
    return config
  }

  const getTypeBadge = (type: string) => {
    const typeConfig: Record<string, { label: string; icon: string }> = {
      IN_PERSON: { label: 'حضوري', icon: '🏥' },
      VIDEO: { label: 'فيديو', icon: '📹' },
      CHAT: { label: 'شات', icon: '💬' },
    }
    return typeConfig[type] || { label: type, icon: '📅' }
  }

  return (
    <div className="rounded-2xl bg-white border border-gray-200 overflow-hidden shadow-lg">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-[#E8E8E8]">
            <tr>
              <th className="px-6 py-4 text-right text-xs font-bold text-[#213F6A] uppercase tracking-wider">📅 التاريخ</th>
              <th className="px-6 py-4 text-right text-xs font-bold text-[#213F6A] uppercase tracking-wider">⏰ الوقت</th>
              <th className="px-6 py-4 text-right text-xs font-bold text-[#213F6A] uppercase tracking-wider">👤 المريض</th>
              <th className="px-6 py-4 text-right text-xs font-bold text-[#213F6A] uppercase tracking-wider">👨‍⚕️ الطبيب</th>
              <th className="px-6 py-4 text-right text-xs font-bold text-[#213F6A] uppercase tracking-wider">🎯 النوع</th>
              <th className="px-6 py-4 text-right text-xs font-bold text-[#213F6A] uppercase tracking-wider">✅ الحالة</th>
              <th className="px-6 py-4 text-right text-xs font-bold text-[#213F6A] uppercase tracking-wider">⚙️ الإجراءات</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {appointments.map((a) => {
              const statusConfig = getStatusBadge(a.status)
              const typeConfig = getTypeBadge(a.type)
              
              return (
                <tr key={a.id} className="border-b border-gray-200 hover:bg-[#E8E8E8]/50 transition-all duration-300 group">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-bold text-[#213F6A] group-hover:text-[#D62828] transition-colors">
                      {new Date(a.startAt).toLocaleDateString('ar-SA', { weekday: 'short', year: 'numeric', month: 'long', day: 'numeric' })}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-[#213F6A]">
                      {a.patientName ??
                        (
                          (a as any).patient?.name ??
                          (typeof (a as any).patientId === 'object'
                            ? (a as any).patientId?.name ?? (a as any).patientId?._id
                            : (a as any).patientId)
                        ) ??
                        'غير محدد'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {a.doctorName ??
                        (
                          (a as any).doctor?.name ??
                          (typeof (a as any).doctorId === 'object'
                            ? (a as any).doctorId?.name ?? (a as any).doctorId?._id
                            : (a as any).doctorId)
                        ) ??
                        'غير محدد'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-[#213F6A]/10 text-[#213F6A] border border-[#213F6A]/30">
                      <span>{typeConfig.icon}</span>
                      <span>{typeConfig.label}</span>
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold ${statusConfig.class}`}>
                      <span className="w-2 h-2 rounded-full bg-white animate-pulse"></span>
                      {statusConfig.label}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => onOpenDetails?.(a)}
                        className="px-4 py-2 text-sm font-semibold bg-[#213F6A] text-white rounded-xl hover:bg-[#1e3a8a] hover:scale-105 transition-all duration-300 shadow-lg shadow-[#213F6A]/30 hover:shadow-xl"
                      >
                        📋 التفاصيل
                      </button>
                      {a.status === 'CANCELLED' && (
                        <button
                          onClick={() => onDelete?.(a)}
                          className="px-3 py-2 text-xs font-semibold bg-[#D62828] text-white rounded-xl hover:bg-[#b91c1c] hover:scale-105 transition-all duration-300 shadow-md shadow-[#D62828]/30 hover:shadow-lg"
                        >
                          🗑 حذف
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
      {pagination && pagination.totalPages > 1 && (
        <div className="bg-[#E8E8E8] px-6 py-4 border-t border-gray-200">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-sm font-medium text-[#333333]">
              عرض{' '}
              <span className="font-bold text-[#D62828]">
                {((pagination.page - 1) * 10 + 1)} - {Math.min(pagination.page * 10, pagination.total)}
              </span>{' '}
              من <span className="font-bold text-[#D62828]">{pagination.total}</span> موعد
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => onPageChange?.(pagination.page - 1)}
                disabled={pagination.page === 1}
                className="px-4 py-2 text-sm font-semibold text-[#213F6A] bg-white border-2 border-gray-300 rounded-xl hover:bg-white hover:border-[#D62828] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 hover:scale-105 shadow-sm"
              >
                السابق
              </button>
              <div className="flex items-center gap-1">
                {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    onClick={() => onPageChange?.(page)}
                    className={`px-4 py-2 text-sm font-semibold rounded-xl transition-all duration-300 ${
                      page === pagination.page
                        ? 'bg-[#D62828] text-white shadow-lg shadow-[#D62828]/30 scale-105'
                        : 'text-[#213F6A] bg-white border-2 border-gray-300 hover:bg-white hover:border-[#D62828] hover:scale-105 shadow-sm'
                    }`}
                  >
                    {page}
                  </button>
                ))}
              </div>
              <button
                onClick={() => onPageChange?.(pagination.page + 1)}
                disabled={pagination.page === pagination.totalPages}
                className="px-4 py-2 text-sm font-semibold text-[#213F6A] bg-white border-2 border-gray-300 rounded-xl hover:bg-white hover:border-[#D62828] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 hover:scale-105 shadow-sm"
              >
                التالي
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}


