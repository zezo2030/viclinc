import type { AppointmentStatus, AppointmentType } from '@/types/appointment.types'

interface AppointmentFiltersValue {
  status?: AppointmentStatus | 'ALL'
  type?: AppointmentType | 'ALL'
  doctorId?: string
  patientId?: string
  startDate?: string
  endDate?: string
  search?: string
}

interface AppointmentFiltersProps {
  value: AppointmentFiltersValue
  onChange: (value: AppointmentFiltersValue) => void
  onReset: () => void
}

export default function AppointmentFilters({ value, onChange, onReset }: AppointmentFiltersProps) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 grid grid-cols-1 md:grid-cols-6 gap-3">
      <input
        className="w-full border rounded-lg px-3 py-2 md:col-span-2"
        placeholder="بحث بالمريض/الطبيب"
        value={value.search || ''}
        onChange={(e) => onChange({ ...value, search: e.target.value })}
      />
      <select
        className="w-full border rounded-lg px-3 py-2"
        value={value.status || 'ALL'}
        onChange={(e) => onChange({ ...value, status: e.target.value as any })}
      >
        <option value="ALL">كل الحالات</option>
        <option value="PENDING_CONFIRM">قيد التأكيد</option>
        <option value="CONFIRMED">مؤكد</option>
        <option value="CANCELLED">ملغى</option>
        <option value="COMPLETED">مكتمل</option>
        <option value="NO_SHOW">عدم حضور</option>
        <option value="REJECTED">مرفوض</option>
      </select>
      <select
        className="w-full border rounded-lg px-3 py-2"
        value={value.type || 'ALL'}
        onChange={(e) => onChange({ ...value, type: e.target.value as any })}
      >
        <option value="ALL">كل الأنواع</option>
        <option value="IN_PERSON">حضوري</option>
        <option value="VIDEO">فيديو</option>
        <option value="CHAT">شات</option>
      </select>
      <input
        type="date"
        className="w-full border rounded-lg px-3 py-2"
        value={value.startDate || ''}
        onChange={(e) => onChange({ ...value, startDate: e.target.value })}
      />
      <input
        type="date"
        className="w-full border rounded-lg px-3 py-2"
        value={value.endDate || ''}
        onChange={(e) => onChange({ ...value, endDate: e.target.value })}
      />
      <div className="flex items-center justify-end">
        <button onClick={onReset} className="px-4 py-2 border rounded-lg">إعادة التعيين</button>
      </div>
    </div>
  )
}


