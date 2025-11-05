import { useMemo, useState } from 'react'
import toast from 'react-hot-toast'
import AdminLayout from '@/components/layout/AdminLayout'
import Breadcrumbs from '@/components/layout/Breadcrumbs'
import DepartmentsGrid from '@/components/departments/DepartmentsGrid'
import DepartmentCard from '@/components/departments/DepartmentCard'
import CreateDepartmentModal from '@/components/departments/CreateDepartmentModal'
import EditDepartmentModal from '@/components/departments/EditDepartmentModal'
import DepartmentDetailsModal from '@/components/departments/DepartmentDetailsModal'
import { useDepartments, useCreateDepartment, useUpdateDepartment, useDeleteDepartment } from '@/hooks/useDepartments'
import { useQueryClient } from '@tanstack/react-query'
import type { Department, CreateDepartmentRequest, UpdateDepartmentRequest } from '@/types/department.types'

export default function DepartmentsPage() {
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [editingDept, setEditingDept] = useState<Department | null>(null)
  const [viewingDept, setViewingDept] = useState<Department | null>(null)
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState<'ALL' | 'ACTIVE' | 'INACTIVE'>('ALL')
  const queryClient = useQueryClient()

  const { data, isLoading, error } = useDepartments()
  const createMutation = useCreateDepartment()
  const updateMutation = useUpdateDepartment()
  const deleteMutation = useDeleteDepartment()

  const list: Department[] = data || []
  const filtered = useMemo(() => {
    return list.filter((d) => {
      const okSearch = search ? (d.name?.toLowerCase().includes(search.toLowerCase()) || d.description?.toLowerCase().includes(search.toLowerCase())) : true
      const okStatus = status === 'ALL' ? true : status === 'ACTIVE' ? d.isActive : !d.isActive
      return okSearch && okStatus
    })
  }, [list, search, status])

  const handleCreate = async (payload: CreateDepartmentRequest) => {
    try {
      await createMutation.mutateAsync(payload)
      toast.success('تم إنشاء القسم بنجاح')
    } catch (e: any) {
      toast.error(e?.response?.data?.message || 'فشل إنشاء القسم')
      throw e
    }
  }

  const handleUpdate = async (payload: UpdateDepartmentRequest) => {
    if (!editingDept) return
    try {
      await updateMutation.mutateAsync({ id: editingDept.id, data: payload })
      toast.success('تم تحديث القسم بنجاح')
    } catch (e: any) {
      toast.error(e?.response?.data?.message || 'فشل تحديث القسم')
      throw e
    }
  }

  const handleDelete = async (dept: Department) => {
    if (!confirm(`هل أنت متأكد من حذف القسم "${dept.name}"؟`)) return
    try {
      await deleteMutation.mutateAsync(dept.id)
      toast.success('تم حذف القسم')
    } catch (e: any) {
      toast.error(e?.response?.data?.message || 'فشل حذف القسم')
    }
  }

  const handleToggleActive = async (dept: Department, isActive: boolean) => {
    try {
      await updateMutation.mutateAsync({ id: dept.id, data: { isActive } })
      toast.success('تم تحديث حالة القسم')
    } catch (e: any) {
      toast.error(e?.response?.data?.message || 'فشل تحديث الحالة')
    }
  }

  const handleServiceAction = () => {
    // Refresh department details when service is created/updated/deleted
    if (viewingDept) {
      queryClient.invalidateQueries({ queryKey: ['department-details', viewingDept.id] })
    }
    // Optionally refresh departments list
    queryClient.invalidateQueries({ queryKey: ['departments'] })
  }

  return (
    <AdminLayout>
      <Breadcrumbs />
      
      {/* Page Header with Gradient */}
      <div className="mb-8 relative overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-500 via-purple-600 to-pink-500 p-8 shadow-2xl">
        <div className="relative z-10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-4xl font-black text-white drop-shadow-lg">
              إدارة الأقسام
            </h1>
            <p className="mt-2 text-lg font-medium text-blue-100">
              عرض وإدارة أقسام العيادة والخدمات المتاحة
            </p>
            <div className="mt-4 flex items-center gap-4 text-white/90">
              <span className="flex items-center gap-2 bg-white/20 px-3 py-1.5 rounded-lg backdrop-blur-sm">
                <span className="text-2xl font-bold">{filtered.length}</span>
                <span className="text-sm">قسم</span>
              </span>
            </div>
          </div>
          <button
            onClick={() => setIsCreateOpen(true)}
            className="group px-6 py-3 bg-white text-purple-600 rounded-xl hover:scale-105 transition-all duration-300 font-bold shadow-xl hover:shadow-2xl flex items-center gap-2"
          >
            <span className="text-2xl group-hover:rotate-90 transition-transform duration-300">+</span>
            <span>إضافة قسم</span>
          </button>
        </div>
        {/* Decorative Elements */}
        <div className="absolute top-0 left-0 w-64 h-64 bg-white/10 rounded-full -translate-x-32 -translate-y-32 blur-3xl"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-white/10 rounded-full translate-x-32 translate-y-32 blur-3xl"></div>
      </div>

      {/* Search and Filters */}
      <div className="mb-6 rounded-xl bg-gradient-to-br from-white to-gray-50 p-6 shadow-lg border border-gray-100">
        <div className="flex items-center gap-3 mb-4">
          <div className="h-1 w-1 rounded-full bg-gradient-to-r from-indigo-500 to-purple-600"></div>
          <h3 className="text-lg font-bold text-gray-900">البحث والتصفية</h3>
          <div className="h-0.5 flex-1 bg-gradient-to-r from-purple-600 to-pink-600 opacity-20"></div>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="relative">
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="بحث باسم القسم أو الوصف..."
              className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 pr-12 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all duration-300 bg-white/70 backdrop-blur-sm hover:border-gray-300"
            />
            <svg className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as any)}
            className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all duration-300 bg-white/70 backdrop-blur-sm hover:border-gray-300 font-medium"
          >
            <option value="ALL">🔵 كل الحالات</option>
            <option value="ACTIVE">✅ نشط فقط</option>
            <option value="INACTIVE">⭕ غير نشط فقط</option>
          </select>

          <div className="flex items-center gap-3 px-4 py-3 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl border border-purple-200">
            <span className="text-sm font-semibold text-gray-600">النتائج:</span>
            <span className="text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              {filtered.length}
            </span>
          </div>
        </div>
      </div>

      {/* Departments Grid */}
      <DepartmentsGrid
        departments={filtered}
        isLoading={isLoading}
        error={error ? 'حدث خطأ في تحميل الأقسام' : null}
        onCreateClick={() => setIsCreateOpen(true)}
        renderItem={(dept) => (
          <DepartmentCard
            department={dept}
            onEdit={setEditingDept}
            onDelete={handleDelete}
            onToggleActive={handleToggleActive}
            onViewDetails={setViewingDept}
          />
        )}
      />

      {/* Modals */}
      <CreateDepartmentModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onSubmit={handleCreate}
      />

      {editingDept && (
        <EditDepartmentModal
          isOpen={!!editingDept}
          onClose={() => setEditingDept(null)}
          department={editingDept}
          onSubmit={handleUpdate}
        />
      )}

      {viewingDept && (
        <DepartmentDetailsModal
          isOpen={!!viewingDept}
          onClose={() => setViewingDept(null)}
          departmentId={viewingDept.id}
          onServiceCreated={handleServiceAction}
          onServiceUpdated={handleServiceAction}
          onServiceDeleted={handleServiceAction}
        />
      )}
    </AdminLayout>
  )
}


