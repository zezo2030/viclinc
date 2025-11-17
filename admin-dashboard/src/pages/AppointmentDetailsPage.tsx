import { useNavigate, useParams } from 'react-router-dom'
import toast from 'react-hot-toast'
import AdminLayout from '@/components/layout/AdminLayout'
import Breadcrumbs from '@/components/layout/Breadcrumbs'
import AppointmentDetails from '@/components/appointments/AppointmentDetails'
import { useAppointment, useUpdateAppointmentStatus } from '@/hooks/useAppointments'
import { Spinner } from '@/components/common/Spinner'

export default function AppointmentDetailsPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { data: appointment, isLoading, error } = useAppointment(id || '')
  const updateStatus = useUpdateAppointmentStatus()

  const handleChangeStatus = async (status: string) => {
    if (!appointment) return
    try {
      await updateStatus.mutateAsync({ id: appointment.id, status })
      toast.success('تم تحديث حالة الموعد')
      // بعد التحديث نرجع إلى صفحة المواعيد
      navigate('/appointments')
    } catch (e: any) {
      toast.error(e?.response?.data?.message || 'فشل تحديث حالة الموعد')
    }
  }

  return (
    <AdminLayout>
      <Breadcrumbs />

      {isLoading && (
        <div className="flex items-center justify-center py-16">
          <Spinner size="lg" />
        </div>
      )}

      {error && !isLoading && (
        <div className="p-6">
          <div className="rounded-2xl bg-gradient-to-br from-red-50 to-red-100/50 border border-red-200 p-8 text-center shadow-lg">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-200 mb-4">
              <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p className="text-xl font-bold text-red-800 mb-2">حدث خطأ في تحميل تفاصيل الموعد</p>
            <p className="text-sm text-red-600 mb-4">يرجى المحاولة مرة أخرى</p>
            <button
              onClick={() => navigate('/appointments')}
              className="px-6 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl font-semibold hover:scale-105 transition-all duration-300 shadow-lg shadow-red-500/30"
            >
              الرجوع للمواعيد
            </button>
          </div>
        </div>
      )}

      {appointment && !isLoading && !error && (
        <AppointmentDetails
          appointment={appointment}
          onClose={() => navigate('/appointments')}
          onChangeStatus={handleChangeStatus}
        />
      )}
    </AdminLayout>
  )
}


