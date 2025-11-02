import { useMemo, useState } from 'react'
import { Plus } from 'lucide-react'
import toast from 'react-hot-toast'
import AdminLayout from '@/components/layout/AdminLayout'
import Breadcrumbs from '@/components/layout/Breadcrumbs'
import DoctorsTable from '@/components/doctors/DoctorsTable'
import CreateDoctorModal from '@/components/doctors/CreateDoctorModal'
import EditDoctorModal from '@/components/doctors/EditDoctorModal'
import DoctorSchedule from '@/components/doctors/DoctorSchedule'
import DoctorPerformance from '@/components/doctors/DoctorPerformance'
import { useDoctors, useCreateDoctor, useUpdateDoctor, useUpdateDoctorStatus } from '@/hooks/useDoctors'
import { useCreateUser } from '@/hooks/useUsers'
import { UserRole } from '@/types/user.types'
import type { CreateUserRequest } from '@/types/user.types'
import type { AdminCreateDoctorRequest } from '@/types/doctor.types'
import type { DoctorProfile } from '@/types/doctor.types'

export default function DoctorsPage() {
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState<'ALL' | 'PENDING' | 'APPROVED' | 'SUSPENDED'>('ALL')
  const [sortBy, setSortBy] = useState<'name' | 'yearsOfExperience'>('name')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc')
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [editingDoctor, setEditingDoctor] = useState<DoctorProfile | null>(null)
  const [selectedDoctorForPanels, setSelectedDoctorForPanels] = useState<DoctorProfile | null>(null)

  const queryParams = useMemo(() => {
    const params: any = { page, limit: 10, sortBy, sortOrder }
    if (search) params.search = search
    if (status !== 'ALL') params.status = status
    return params
  }, [page, search, status, sortBy, sortOrder])
  const { data, isLoading, error } = useDoctors(queryParams)

  const createDoctor = useCreateDoctor()
  const createUser = useCreateUser()
  const updateDoctor = useUpdateDoctor()
  const updateStatus = useUpdateDoctorStatus()

  const handleCreate = async (payload: any, files?: File[]) => {
    try {
      // 1) إنشاء مستخدم بدور DOCTOR
      const userReq: CreateUserRequest = {
        name: payload.name,
        email: payload.email,
        phone: payload.phone,
        password: payload.password,
        role: UserRole.DOCTOR,
      }
      const user = await createUser.mutateAsync(userReq)

      // 2) إنشاء ملف الطبيب
      if (files && files.length > 0) {
        const fd = new FormData()
        fd.append('userId', user.id)
        fd.append('name', payload.name)
        fd.append('licenseNumber', payload.licenseNumber)
        fd.append('yearsOfExperience', String(payload.yearsOfExperience))
        fd.append('departmentId', payload.departmentId)
        if (payload.bio) fd.append('bio', payload.bio)
        files.forEach((file) => fd.append('photos', file))
        await createDoctor.mutateAsync(fd as unknown as any)
      } else {
        const doctorReq: AdminCreateDoctorRequest = {
          userId: user.id,
          name: payload.name,
          licenseNumber: payload.licenseNumber,
          yearsOfExperience: payload.yearsOfExperience,
          departmentId: payload.departmentId,
          bio: payload.bio,
        }
        await createDoctor.mutateAsync(doctorReq as unknown as any)
      }
      toast.success('تم إنشاء الطبيب بنجاح')
    } catch (e: any) {
      toast.error(e?.response?.data?.message || 'فشل إنشاء الطبيب')
      throw e
    }
  }

  const handleUpdate = async (payload: any) => {
    if (!editingDoctor) return
    try {
      await updateDoctor.mutateAsync({ id: editingDoctor.id, data: payload })
      toast.success('تم تحديث بيانات الطبيب')
    } catch (e: any) {
      toast.error(e?.response?.data?.message || 'فشل تحديث بيانات الطبيب')
      throw e
    }
  }

  const handleStatusChange = async (doctor: DoctorProfile, status: any) => {
    try {
      await updateStatus.mutateAsync({ id: doctor.id, status })
      toast.success('تم تحديث حالة الطبيب')
    } catch (e: any) {
      toast.error(e?.response?.data?.message || 'فشل تحديث حالة الطبيب')
    }
  }

  const handleSort = (column: 'name' | 'yearsOfExperience') => {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      setSortBy(column)
      setSortOrder('asc')
    }
  }

  if (error) {
    return (
      <AdminLayout>
        <Breadcrumbs />
        <div className="p-6">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <p className="text-red-600">حدث خطأ في تحميل الأطباء</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              إعادة المحاولة
            </button>
          </div>
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout>
      <Breadcrumbs />

      <div className="p-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">إدارة الأطباء</h1>
            <p className="text-gray-600 mt-1">عرض وإدارة الأطباء في النظام</p>
          </div>
          <button
            onClick={() => setIsCreateOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
          >
            <Plus className="w-5 h-5" />
            <span>إضافة طبيب</span>
          </button>
        </div>

        {/* Filters */}
        <div className="mb-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
          <input
            value={search}
            onChange={(e) => {
              setSearch(e.target.value)
              setPage(1)
            }}
            placeholder="بحث بالاسم أو البريد"
            className="w-full border rounded-lg px-3 py-2"
          />
          <select
            value={status}
            onChange={(e) => {
              setStatus(e.target.value as any)
              setPage(1)
            }}
            className="w-full border rounded-lg px-3 py-2"
          >
            <option value="ALL">كل الحالات</option>
            <option value="PENDING">قيد المراجعة</option>
            <option value="APPROVED">مقبول</option>
            <option value="SUSPENDED">موقوف</option>
          </select>
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleSort('name')}
              className={`flex-1 px-3 py-2 border rounded-lg ${sortBy === 'name' ? 'bg-gray-100' : ''}`}
            >
              ترتيب بالاسم ({sortOrder === 'asc' ? 'تصاعدي' : 'تنازلي'})
            </button>
            <button
              onClick={() => handleSort('yearsOfExperience')}
              className={`flex-1 px-3 py-2 border rounded-lg ${sortBy === 'yearsOfExperience' ? 'bg-gray-100' : ''}`}
            >
              ترتيب بالخبرة ({sortOrder === 'asc' ? 'تصاعدي' : 'تنازلي'})
            </button>
          </div>
        </div>

        {/* Table */}
        <DoctorsTable
          doctors={data?.data || []}
          isLoading={isLoading}
          pagination={
            data?.meta
              ? { page: data.meta.page, totalPages: data.meta.totalPages, total: data.meta.total }
              : undefined
          }
          onPageChange={setPage}
          onEdit={(doc) => setEditingDoctor(doc)}
          onStatusChange={handleStatusChange}
          sortBy={sortBy}
          sortOrder={sortOrder}
          onSort={handleSort}
        />

        {/* Side Panels (Schedule & Performance) */}
        {selectedDoctorForPanels && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
            <DoctorSchedule doctorId={selectedDoctorForPanels.id} />
            <DoctorPerformance doctorId={selectedDoctorForPanels.id} />
          </div>
        )}

        {/* Modals */}
        <CreateDoctorModal isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} onSubmit={handleCreate} />

        {editingDoctor && (
          <EditDoctorModal
            isOpen={!!editingDoctor}
            onClose={() => setEditingDoctor(null)}
            doctor={editingDoctor}
            onSubmit={handleUpdate}
          />
        )}
      </div>
    </AdminLayout>
  )
}


