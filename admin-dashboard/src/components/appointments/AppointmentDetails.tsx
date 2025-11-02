import type { Appointment } from '@/types/appointment.types'

interface AppointmentDetailsProps {
  appointment: Appointment | null
  onClose: () => void
  onChangeStatus?: (status: string) => void
}

export default function AppointmentDetails({ appointment, onClose, onChangeStatus }: AppointmentDetailsProps) {
  if (!appointment) return null
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40">
      <div className="w-full sm:max-w-lg bg-white rounded-t-2xl sm:rounded-2xl shadow-xl border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <h3 className="text-lg font-semibold">تفاصيل الموعد</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">×</button>
        </div>
        <div className="p-6 space-y-3 text-sm">
          <div className="flex items-center justify-between">
            <span className="text-gray-500">التاريخ</span>
            <span className="text-gray-900">{new Date(appointment.startAt).toLocaleString('ar-SA')}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-500">الحالة</span>
            <span className="text-gray-900">{appointment.status}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-500">النوع</span>
            <span className="text-gray-900">{appointment.type}</span>
          </div>
          {appointment.price !== undefined && (
            <div className="flex items-center justify-between">
              <span className="text-gray-500">السعر</span>
              <span className="text-gray-900">{appointment.price}</span>
            </div>
          )}
        </div>
        <div className="px-6 pb-6 flex items-center justify-end gap-2">
          <button onClick={() => onChangeStatus?.('CONFIRMED')} className="px-3 py-2 text-sm bg-green-600 text-white rounded-lg">تأكيد</button>
          <button onClick={() => onChangeStatus?.('CANCELLED')} className="px-3 py-2 text-sm bg-red-600 text-white rounded-lg">إلغاء</button>
          <button onClick={onClose} className="px-3 py-2 text-sm border rounded-lg">إغلاق</button>
        </div>
      </div>
    </div>
  )
}


