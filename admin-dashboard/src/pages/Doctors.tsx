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
        // إرسال صورة واحدة فقط (avatar) بدلاً من photos array
        if (files && files.length > 0) {
          fd.append('avatar', files[0])
        }
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
          <div className="rounded-2xl bg-gradient-to-br from-red-50 to-red-100/50 border border-red-200 p-8 text-center shadow-lg">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-200 mb-4">
              <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p className="text-xl font-bold text-red-800 mb-2">حدث خطأ في تحميل الأطباء</p>
            <p className="text-sm text-red-600 mb-4">حدث خطأ أثناء تحميل البيانات</p>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl font-semibold hover:scale-105 transition-all duration-300 shadow-lg shadow-red-500/30"
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

      {/* Page Header with Gradient */}
      <div className="mb-8 relative overflow-hidden rounded-2xl bg-[#D62828] p-8 shadow-2xl">
        <div className="relative z-10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-4xl font-black text-white drop-shadow-lg">
              إدارة الأطباء
            </h1>
            <p className="mt-2 text-lg font-medium text-white/90">
              عرض وإدارة الأطباء في النظام
            </p>
            <div className="mt-4 flex items-center gap-4 text-white/90">
              <span className="flex items-center gap-2 bg-white/20 px-3 py-1.5 rounded-lg backdrop-blur-sm">
                <span className="text-2xl font-bold">{data?.meta?.total || 0}</span>
                <span className="text-sm">طبيب</span>
              </span>
            </div>
          </div>
          <button
            onClick={() => setIsCreateOpen(true)}
            className="group px-6 py-3 bg-white text-[#D62828] rounded-xl hover:scale-105 transition-all duration-300 font-bold shadow-xl hover:shadow-2xl flex items-center gap-2"
          >
            <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300" />
            <span>إضافة طبيب</span>
          </button>
        </div>
        {/* Decorative Elements */}
        <div className="absolute top-0 left-0 w-64 h-64 bg-white/10 rounded-full -translate-x-32 -translate-y-32 blur-3xl"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-white/10 rounded-full translate-x-32 translate-y-32 blur-3xl"></div>
      </div>

      {/* Filters */}
      <div className="mb-6 rounded-xl bg-gradient-to-br from-white to-gray-50 p-6 shadow-lg border border-gray-100">
        <div className="flex items-center gap-3 mb-4">
          <div className="h-1 w-1 rounded-full bg-[#D62828]"></div>
          <h3 className="text-lg font-bold text-[#213F6A]">البحث والتصفية</h3>
          <div className="h-0.5 flex-1 bg-[#D62828] opacity-20"></div>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="relative">
            <input
              value={search}
              onChange={(e) => {
                setSearch(e.target.value)
                setPage(1)
              }}
              placeholder="بحث بالاسم أو البريد..."
              className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 pr-12 focus:border-[#D62828] focus:ring-2 focus:ring-[#D62828]/20 transition-all duration-300 bg-white/70 backdrop-blur-sm hover:border-gray-300"
            />
            <svg className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          
          <select
            value={status}
            onChange={(e) => {
              setStatus(e.target.value as any)
              setPage(1)
            }}
            className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:border-[#D62828] focus:ring-2 focus:ring-[#D62828]/20 transition-all duration-300 bg-white/70 backdrop-blur-sm hover:border-gray-300 font-medium"
          >
            <option value="ALL">🔵 كل الحالات</option>
            <option value="PENDING">⏳ قيد المراجعة</option>
            <option value="APPROVED">✅ مقبول</option>
            <option value="SUSPENDED">⛔ موقوف</option>
          </select>

          <button
            onClick={() => handleSort('name')}
            className={`px-4 py-3 rounded-xl font-semibold transition-all duration-300 ${
              sortBy === 'name'
                ? 'bg-[#D62828] text-white shadow-lg shadow-[#D62828]/30 scale-105'
                : 'bg-white text-[#213F6A] border-2 border-gray-200 hover:border-[#D62828] hover:scale-105'
            }`}
          >
            📝 ترتيب بالاسم ({sortOrder === 'asc' ? '↑' : '↓'})
          </button>

          <button
            onClick={() => handleSort('yearsOfExperience')}
            className={`px-4 py-3 rounded-xl font-semibold transition-all duration-300 ${
              sortBy === 'yearsOfExperience'
                ? 'bg-[#D62828] text-white shadow-lg shadow-[#D62828]/30 scale-105'
                : 'bg-white text-[#213F6A] border-2 border-gray-200 hover:border-[#D62828] hover:scale-105'
            }`}
          >
            ⭐ ترتيب بالخبرة ({sortOrder === 'asc' ? '↑' : '↓'})
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
    </AdminLayout>
  )
}


