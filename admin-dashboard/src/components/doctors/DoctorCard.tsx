import type { DoctorProfile } from '@/types/doctor.types'

interface DoctorCardProps {
  doctor: DoctorProfile
  onClick?: (doctor: DoctorProfile) => void
}

export default function DoctorCard({ doctor, onClick }: DoctorCardProps) {
  const statusLabel =
    doctor.status === 'APPROVED' ? 'مقبول' : doctor.status === 'SUSPENDED' ? 'موقوف' : 'قيد المراجعة'
  const statusClass =
    doctor.status === 'APPROVED'
      ? 'bg-green-50 text-green-700 border-green-200'
      : doctor.status === 'SUSPENDED'
      ? 'bg-red-50 text-red-700 border-red-200'
      : 'bg-yellow-50 text-yellow-700 border-yellow-200'

  return (
    <div
      className="p-4 border rounded-xl hover:shadow-sm transition cursor-pointer"
      onClick={() => onClick?.(doctor)}
    >
      <div className="flex items-center justify-between mb-3">
        <div className={`px-2.5 py-1 rounded-lg text-xs border ${statusClass}`}>{statusLabel}</div>
      </div>
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center text-gray-600">
          {doctor.name?.charAt(0) || 'ط'}
        </div>
        <div className="flex-1 text-right">
          <div className="font-semibold text-gray-900">{doctor.name}</div>
          <div className="text-sm text-gray-500">قسم: {doctor.departmentId}</div>
        </div>
      </div>
      <div className="mt-3 text-sm text-gray-600">خبرة: {doctor.yearsOfExperience} سنوات</div>
    </div>
  )
}


