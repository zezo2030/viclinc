import { useState, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { X, Building2, AlertCircle, Wrench, Users, Plus, Edit, Trash2, Mail, Clock, DollarSign, Loader2 } from 'lucide-react'
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" dir="rtl">
      <div className="w-full max-w-5xl max-h-[90vh] bg-white rounded-xl shadow-sm border border-[#e2e8f0] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 bg-[#6366f1] flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-lg bg-white/20 overflow-hidden flex items-center justify-center border border-white/30">
              {(data?.logoUrl || data?.logoPath) && !imageError ? (
                <img
                  src={resolveLogoUrl(data.logoPath || data.logoUrl)}
                  alt={data.name || 'قسم'}
                  className="w-full h-full object-cover"
                  onError={() => setImageError(true)}
                />
              ) : (
                <Building2 className="w-7 h-7 text-white/80" />
              )}
            </div>
            <div>
              <h3 className="text-xl font-semibold text-white">{data?.name || 'تفاصيل القسم'}</h3>
              {data?.description && <p className="text-sm text-white/90 mt-1">{data.description}</p>}
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg bg-white/20 hover:bg-white/30 text-white transition-colors duration-150"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="px-6 border-b border-[#e2e8f0] bg-[#f8fafc] flex gap-2">
          <button
            onClick={() => setActiveTab('services')}
            className={`py-3 px-4 border-b-2 font-medium relative transition-colors duration-150 ${
              activeTab === 'services'
                ? 'border-[#6366f1] text-[#6366f1]'
                : 'border-transparent text-[#64748b] hover:text-[#0f172a]'
            }`}
          >
            <span className="flex items-center gap-2">
              <span>الخدمات</span>
              <span className="inline-flex items-center justify-center w-5 h-5 text-xs font-medium bg-[#6366f1]/10 text-[#6366f1] rounded-full">
                {data?.services?.length || 0}
              </span>
            </span>
          </button>
          <button
            onClick={() => setActiveTab('doctors')}
            className={`py-3 px-4 border-b-2 font-medium relative transition-colors duration-150 ${
              activeTab === 'doctors'
                ? 'border-[#6366f1] text-[#6366f1]'
                : 'border-transparent text-[#64748b] hover:text-[#0f172a]'
            }`}
          >
            <span className="flex items-center gap-2">
              <span>الأطباء</span>
              <span className="inline-flex items-center justify-center w-5 h-5 text-xs font-medium bg-[#6366f1]/10 text-[#6366f1] rounded-full">
                {data?.doctors?.length || 0}
              </span>
            </span>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 bg-white">
          {isLoading ? (
            <div className="flex items-center justify-center py-16">
              <div className="text-center">
                <Spinner size="lg" />
                <p className="mt-4 text-base font-semibold text-[#0f172a]">جاري التحميل...</p>
              </div>
            </div>
          ) : error ? (
            <div className="text-center py-16">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-lg bg-[#ef4444]/10 mb-4">
                <AlertCircle className="w-7 h-7 text-[#ef4444]" />
              </div>
              <p className="text-lg font-semibold text-[#ef4444] mb-4">حدث خطأ في تحميل البيانات</p>
              <button
                onClick={() => refetch()}
                className="px-6 py-3 bg-[#6366f1] text-white rounded-lg font-medium shadow-sm hover:bg-[#4f46e5] transition-colors duration-150"
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
        <h4 className="text-lg font-semibold text-[#0f172a]">خدمات القسم</h4>
        <button
          onClick={() => setIsCreateOpen(true)}
          className="px-4 py-2 bg-[#6366f1] text-white rounded-lg font-medium shadow-sm hover:bg-[#4f46e5] transition-colors duration-150 flex items-center gap-2"
        >
          <span className="text-lg">+</span>
          <span>إضافة خدمة</span>
        </button>
      </div>

      {services.length === 0 ? (
        <div className="text-center py-16 rounded-xl bg-[#f8fafc] border border-[#e2e8f0]">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-lg bg-[#6366f1]/10 mb-4">
            <Wrench className="w-8 h-8 text-[#6366f1]" />
          </div>
          <p className="text-lg font-semibold text-[#0f172a] mb-2">لا توجد خدمات</p>
          <p className="text-[#64748b] mb-6">ابدأ بإضافة خدمات لهذا القسم</p>
          <button
            onClick={() => setIsCreateOpen(true)}
            className="px-6 py-3 bg-[#6366f1] text-white rounded-lg font-medium shadow-sm hover:bg-[#4f46e5] transition-colors duration-150"
          >
            <Plus className="w-4 h-4 inline ml-1" />
            إضافة خدمة جديدة
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
    <div className="group relative overflow-hidden rounded-xl border border-[#e2e8f0] bg-white p-5 shadow-sm hover:shadow-sm transition-all duration-150">
      {/* Status Badge */}
      <div className="absolute top-3 left-3">
        <span
          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium shadow-sm ${
            service.isActive
              ? 'bg-[#10b981] text-white'
              : 'bg-[#64748b] text-white'
          }`}
        >
          <span className="w-2 h-2 rounded-full bg-white"></span>
          {service.isActive ? 'نشط' : 'غير نشط'}
        </span>
      </div>

      <div className="pt-8">
        {/* Service Name */}
        <h5 className="text-lg font-semibold text-[#0f172a] mb-2 group-hover:text-[#6366f1] transition-colors duration-150">
          {service.name}
        </h5>

        {/* Description */}
        {service.description && (
          <p className="text-sm text-[#64748b] mb-4 line-clamp-2">{service.description}</p>
        )}

        {/* Price and Duration */}
        <div className="flex items-center gap-3 mb-4">
          {service.basePrice !== undefined && service.basePrice !== null && (
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[#10b981]/10 border border-[#10b981]/20">
              <DollarSign className="w-4 h-4 text-[#10b981]" />
              <div className="text-right">
                <p className="text-xs text-[#64748b] font-medium">السعر</p>
                <p className="text-sm font-semibold text-[#10b981]">{service.basePrice} ر.س</p>
              </div>
            </div>
          )}
          {service.baseDuration !== undefined && service.baseDuration !== null && (
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[#6366f1]/10 border border-[#6366f1]/20">
              <Clock className="w-4 h-4 text-[#6366f1]" />
              <div className="text-right">
                <p className="text-xs text-[#64748b] font-medium">المدة</p>
                <p className="text-sm font-semibold text-[#6366f1]">{service.baseDuration} د</p>
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          <button
            onClick={onEdit}
            className="flex-1 px-4 py-2.5 text-sm font-medium bg-[#6366f1] text-white rounded-lg shadow-sm hover:bg-[#4f46e5] transition-colors duration-150 flex items-center justify-center gap-1"
          >
            <Edit className="w-4 h-4" />
            <span>تعديل</span>
          </button>
          <button
            onClick={handleDelete}
            disabled={isDeleting}
            className="px-4 py-2.5 text-sm font-medium bg-[#ef4444] text-white rounded-lg shadow-sm hover:bg-[#dc2626] transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
          >
            {isDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
          </button>
        </div>
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
      <div className="text-center py-16 rounded-xl bg-[#f8fafc] border border-[#e2e8f0]">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-lg bg-[#6366f1]/10 mb-4">
          <Users className="w-8 h-8 text-[#6366f1]" />
        </div>
        <p className="text-lg font-semibold text-[#0f172a] mb-2">لا يوجد أطباء</p>
        <p className="text-[#64748b]">لم يتم تعيين أطباء لهذا القسم بعد</p>
      </div>
    )
  }

  return (
    <div>
      <h4 className="text-lg font-semibold text-[#0f172a] mb-6">أطباء القسم</h4>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {doctors.map((doctor) => (
          <div
            key={doctor._id || doctor.id}
            className="group relative overflow-hidden rounded-xl border border-[#e2e8f0] bg-white p-5 shadow-sm hover:shadow-sm transition-all duration-150"
          >
            {/* Status Badge */}
            <div className="absolute top-3 left-3">
              <span
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium shadow-sm ${
                  doctor.status === 'APPROVED'
                    ? 'bg-[#10b981] text-white'
                    : 'bg-[#f59e0b] text-white'
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-white"></span>
                {doctor.status === 'APPROVED' ? 'معتمد' : doctor.status || 'قيد المراجعة'}
              </span>
            </div>

            {/* Doctor Info */}
            <div className="pt-8 flex items-start gap-4">
              <div className="w-12 h-12 rounded-lg bg-[#6366f1]/10 flex items-center justify-center border border-[#6366f1]/20">
                <Users className="w-6 h-6 text-[#6366f1]" />
              </div>
              <div className="flex-1">
                <h5 className="text-base font-semibold text-[#0f172a] mb-1 group-hover:text-[#6366f1] transition-colors duration-150">
                  د. {doctor.name || doctor.userId?.name || 'غير محدد'}
                </h5>
                {doctor.userId?.email && (
                  <div className="flex items-center gap-2 text-sm text-[#64748b]">
                    <Mail className="w-4 h-4" />
                    <span className="truncate">{doctor.userId.email}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

