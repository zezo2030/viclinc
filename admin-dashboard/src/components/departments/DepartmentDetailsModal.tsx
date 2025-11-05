import { useState, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { departmentsDetailsApi } from '@/api/services'
import { Spinner } from '@/components/common/Spinner'
import { API_URL } from '@/utils/constants'
import type { DepartmentDetails } from '@/types/service.types'
import CreateServiceModal from './CreateServiceModal'
import EditServiceModal from './EditServiceModal'

interface DepartmentDetailsModalProps {
  isOpen: boolean
  onClose: () => void
  departmentId: string
  onServiceCreated?: () => void
  onServiceUpdated?: () => void
  onServiceDeleted?: () => void
}

type Tab = 'services' | 'doctors'

export default function DepartmentDetailsModal({
  isOpen,
  onClose,
  departmentId,
  onServiceCreated,
  onServiceUpdated,
  onServiceDeleted,
}: DepartmentDetailsModalProps) {
  const [activeTab, setActiveTab] = useState<Tab>('services')
  const [imageError, setImageError] = useState(false)

  const { data, isLoading, error, refetch } = useQuery<DepartmentDetails>({
    queryKey: ['department-details', departmentId],
    queryFn: () => departmentsDetailsApi.getDetails(departmentId),
    enabled: isOpen && !!departmentId,
  })

  useEffect(() => {
    if (isOpen) {
      refetch()
      setImageError(false) // Reset image error when modal opens
    }
  }, [isOpen, refetch])

  // Reset image error when data changes
  useEffect(() => {
    setImageError(false)
  }, [data?.logoPath, data?.logoUrl])

  const handleServiceAction = () => {
    refetch()
    onServiceCreated?.()
    onServiceUpdated?.()
    onServiceDeleted?.()
  }

  if (!isOpen) return null

  const resolveLogoUrl = (path?: string) => {
    if (!path) return undefined
    if (path.startsWith('http')) return path
    try {
      const origin = new URL(API_URL).origin
      if (path.startsWith('/')) return `${origin}${path}`
      return `${origin}/${path}`
    } catch {
      return path
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-black/60 to-black/40 backdrop-blur-sm p-4">
      <div className="w-full max-w-5xl max-h-[90vh] bg-gradient-to-br from-white to-gray-50 rounded-3xl shadow-2xl border border-gray-200 flex flex-col overflow-hidden">
        {/* Header with Gradient */}
        <div className="relative px-8 py-6 bg-gradient-to-r from-purple-500 via-pink-500 to-rose-500 flex items-center justify-between overflow-hidden">
          <div className="relative z-10 flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-sm overflow-hidden flex items-center justify-center shadow-xl ring-4 ring-white/30">
              {(data?.logoUrl || data?.logoPath) && !imageError ? (
                <img
                  src={resolveLogoUrl(data.logoPath || data.logoUrl)}
                  alt={data.name || 'قسم'}
                  className="w-full h-full object-cover"
                  onError={() => setImageError(true)}
                />
              ) : (
                <svg className="w-8 h-8 text-white/80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              )}
            </div>
            <div>
              <h3 className="text-2xl font-black text-white drop-shadow-lg">{data?.name || 'تفاصيل القسم'}</h3>
              {data?.description && <p className="text-sm text-white/90 mt-1 font-medium">{data.description}</p>}
            </div>
          </div>
          <button
            onClick={onClose}
            className="relative z-10 w-10 h-10 flex items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white shadow-lg"
          >
            <span className="text-2xl font-bold">×</span>
          </button>
          {/* Decorative Elements */}
          <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -translate-y-20 translate-x-20 blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-40 h-40 bg-white/10 rounded-full translate-y-20 -translate-x-20 blur-3xl"></div>
        </div>

        {/* Tabs */}
        <div className="px-8 border-b border-gray-200 bg-white/50 backdrop-blur-sm flex gap-2">
          <button
            onClick={() => setActiveTab('services')}
            className={`py-4 px-6 border-b-4 font-bold relative ${
              activeTab === 'services'
                ? 'border-purple-600 text-purple-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <span className="flex items-center gap-2">
              <span>🛠️</span>
              <span>الخدمات</span>
              <span className="inline-flex items-center justify-center w-6 h-6 text-xs font-bold bg-purple-100 text-purple-600 rounded-full">
                {data?.services?.length || 0}
              </span>
            </span>
          </button>
          <button
            onClick={() => setActiveTab('doctors')}
            className={`py-4 px-6 border-b-4 font-bold relative ${
              activeTab === 'doctors'
                ? 'border-purple-600 text-purple-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <span className="flex items-center gap-2">
              <span>👨‍⚕️</span>
              <span>الأطباء</span>
              <span className="inline-flex items-center justify-center w-6 h-6 text-xs font-bold bg-purple-100 text-purple-600 rounded-full">
                {data?.doctors?.length || 0}
              </span>
            </span>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-8 bg-gradient-to-br from-white to-purple-50/30">
          {isLoading ? (
            <div className="flex items-center justify-center py-16">
              <div className="text-center">
                <div className="relative inline-block">
                  <Spinner size="lg" />
                  <div className="absolute inset-0 animate-ping opacity-20">
                    <Spinner size="lg" />
                  </div>
                </div>
                <p className="mt-4 text-lg font-bold text-gray-900">جاري التحميل...</p>
              </div>
            </div>
          ) : error ? (
            <div className="text-center py-16">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-100 mb-4">
                <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <p className="text-xl font-bold text-red-600 mb-4">حدث خطأ في تحميل البيانات</p>
              <button
                onClick={() => refetch()}
                className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-semibold shadow-lg shadow-purple-500/30"
              >
                إعادة المحاولة
              </button>
            </div>
          ) : activeTab === 'services' ? (
            <ServicesTab
              services={data?.services || []}
              departmentId={departmentId}
              onAction={handleServiceAction}
            />
          ) : (
            <DoctorsTab doctors={data?.doctors || []} />
          )}
        </div>
      </div>
    </div>
  )
}

// Services Tab Component
interface ServicesTabProps {
  services: any[]
  departmentId: string
  onAction: () => void
}

function ServicesTab({ services, departmentId, onAction }: ServicesTabProps) {
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [editingService, setEditingService] = useState<any>(null)

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h4 className="text-xl font-bold text-gray-900">خدمات القسم</h4>
        <button
          onClick={() => setIsCreateOpen(true)}
          className="group px-5 py-2.5 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-bold shadow-lg shadow-purple-500/30 flex items-center gap-2"
        >
          <span className="text-xl">+</span>
          <span>إضافة خدمة</span>
        </button>
      </div>

      {services.length === 0 ? (
        <div className="text-center py-16 rounded-2xl bg-gradient-to-br from-white to-purple-50 border border-purple-100">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-purple-100 to-pink-100 mb-4">
            <svg className="w-10 h-10 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
          </div>
          <p className="text-xl font-bold text-gray-900 mb-2">لا توجد خدمات</p>
          <p className="text-gray-600 mb-6">ابدأ بإضافة خدمات لهذا القسم</p>
          <button
            onClick={() => setIsCreateOpen(true)}
            className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-semibold shadow-lg shadow-purple-500/30"
          >
            + إضافة خدمة جديدة
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {services.map((service, index) => (
            <div 
              key={service.id || service._id}
            >
              <ServiceCard
                service={service}
                onEdit={() => setEditingService(service)}
                onDelete={onAction}
              />
            </div>
          ))}
        </div>
      )}

      {/* Create Service Modal */}
      {isCreateOpen && (
        <CreateServiceModal
          isOpen={isCreateOpen}
          onClose={() => setIsCreateOpen(false)}
          departmentId={departmentId}
          onSubmit={async () => {
            setIsCreateOpen(false)
            onAction()
          }}
        />
      )}

      {/* Edit Service Modal */}
      {editingService && (
        <EditServiceModal
          isOpen={!!editingService}
          onClose={() => setEditingService(null)}
          service={editingService}
          onSubmit={async () => {
            setEditingService(null)
            onAction()
          }}
        />
      )}
    </div>
  )
}

// Service Card Component
interface ServiceCardProps {
  service: any
  onEdit: () => void
  onDelete: () => void
}

function ServiceCard({ service, onEdit, onDelete }: ServiceCardProps) {
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = async () => {
    if (!confirm(`هل أنت متأكد من حذف الخدمة "${service.name}"؟`)) return
    setIsDeleting(true)
    try {
      const { servicesApi } = await import('@/api/services')
      await servicesApi.delete(service.id || service._id)
      onDelete()
    } catch (error: any) {
      alert(error?.response?.data?.message || 'فشل حذف الخدمة')
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <div className="group relative overflow-hidden rounded-2xl border border-gray-100 bg-gradient-to-br from-white to-blue-50/30 p-5 shadow-md">
      {/* Status Badge */}
      <div className="absolute top-3 left-3">
        <span
          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold shadow-lg ${
            service.isActive
              ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-green-500/30'
              : 'bg-gradient-to-r from-gray-400 to-gray-500 text-white shadow-gray-400/30'
          }`}
        >
          <span className="w-2 h-2 rounded-full bg-white animate-pulse"></span>
          {service.isActive ? 'نشط' : 'غير نشط'}
        </span>
      </div>

      <div className="pt-8">
        {/* Service Name */}
        <h5 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-purple-600 transition-colors">
          {service.name}
        </h5>

        {/* Description */}
        {service.description && (
          <p className="text-sm text-gray-600 mb-4 line-clamp-2">{service.description}</p>
        )}

        {/* Price and Duration */}
        <div className="flex items-center gap-3 mb-4">
          {service.basePrice !== undefined && service.basePrice !== null && (
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200">
              <span className="text-xl">💵</span>
              <div className="text-right">
                <p className="text-xs text-gray-600 font-medium">السعر</p>
                <p className="text-sm font-bold text-green-600">{service.basePrice} ر.س</p>
              </div>
            </div>
          )}
          {service.baseDuration !== undefined && service.baseDuration !== null && (
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gradient-to-r from-blue-50 to-cyan-50 border border-blue-200">
              <span className="text-xl">⏱️</span>
              <div className="text-right">
                <p className="text-xs text-gray-600 font-medium">المدة</p>
                <p className="text-sm font-bold text-blue-600">{service.baseDuration} د</p>
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          <button
            onClick={onEdit}
            className="flex-1 px-4 py-2.5 text-sm font-semibold bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-xl shadow-lg shadow-blue-500/30"
          >
            ✏️ تعديل
          </button>
          <button
            onClick={handleDelete}
            disabled={isDeleting}
            className="px-4 py-2.5 text-sm font-semibold bg-gradient-to-r from-red-500 to-rose-500 text-white rounded-xl shadow-lg shadow-red-500/30 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isDeleting ? '⏳' : '🗑️'}
          </button>
        </div>
      </div>

      {/* Decorative Element */}
      <div className="absolute inset-0 opacity-0 pointer-events-none">
        <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-blue-400/20 to-cyan-400/20 rounded-full blur-2xl"></div>
      </div>
    </div>
  )
}

// Doctors Tab Component
interface DoctorsTabProps {
  doctors: any[]
}

function DoctorsTab({ doctors }: DoctorsTabProps) {
  if (doctors.length === 0) {
    return (
      <div className="text-center py-16 rounded-2xl bg-gradient-to-br from-white to-cyan-50 border border-cyan-100">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-cyan-100 to-blue-100 mb-4">
          <svg className="w-10 h-10 text-cyan-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
        </div>
        <p className="text-xl font-bold text-gray-900 mb-2">لا يوجد أطباء</p>
        <p className="text-gray-600">لم يتم تعيين أطباء لهذا القسم بعد</p>
      </div>
    )
  }

  return (
    <div>
      <h4 className="text-xl font-bold text-gray-900 mb-6">أطباء القسم</h4>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {doctors.map((doctor, index) => (
          <div
            key={doctor._id || doctor.id}
            className="group relative overflow-hidden rounded-2xl border border-gray-100 bg-gradient-to-br from-white to-cyan-50/30 p-5 shadow-md"
          >
            {/* Status Badge */}
            <div className="absolute top-3 left-3">
              <span
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold shadow-lg ${
                  doctor.status === 'APPROVED'
                    ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-green-500/30'
                    : 'bg-gradient-to-r from-amber-400 to-orange-500 text-white shadow-amber-400/30'
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-white animate-pulse"></span>
                {doctor.status === 'APPROVED' ? 'معتمد' : doctor.status || 'قيد المراجعة'}
              </span>
            </div>

            {/* Doctor Info */}
            <div className="pt-8 flex items-start gap-4">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-cyan-100 to-blue-100 flex items-center justify-center shadow-lg ring-4 ring-white">
                <svg className="w-7 h-7 text-cyan-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <div className="flex-1">
                <h5 className="text-lg font-bold text-gray-900 mb-1 group-hover:text-cyan-600 transition-colors">
                  د. {doctor.name || doctor.userId?.name || 'غير محدد'}
                </h5>
                {doctor.userId?.email && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    <span className="truncate">{doctor.userId.email}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Decorative Element */}
            <div className="absolute inset-0 opacity-0 pointer-events-none">
              <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-cyan-400/20 to-blue-400/20 rounded-full blur-2xl"></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

