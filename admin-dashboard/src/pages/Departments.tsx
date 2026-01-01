import { useMemo, useState } from 'react'
import toast from 'react-hot-toast'
import { Search, Plus } from 'lucide-react'
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
      
      {/* Page Header */}
      <div className="mb-8 relative overflow-hidden rounded-xl bg-[#6366f1] p-8 shadow-sm">
        <div className="relative z-10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-semibold text-white">
              إدارة الأقسام
            </h1>
            <p className="mt-2 text-base font-medium text-white/90">
              عرض وإدارة أقسام العيادة والخدمات المتاحة
            </p>
            <div className="mt-4 flex items-center gap-4 text-white/90">
              <span className="flex items-center gap-2 bg-white/20 px-3 py-1.5 rounded-lg">
                <span className="text-xl font-semibold">{filtered.length}</span>
                <span className="text-sm">قسم</span>
              </span>
            </div>
          </div>
          <button
            onClick={() => setIsCreateOpen(true)}
            className="group px-6 py-3 bg-white text-[#6366f1] rounded-lg hover:scale-[1.02] transition-all duration-150 ease-out font-medium shadow-sm flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            <span>إضافة قسم</span>
          </button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="mb-6 rounded-xl bg-white p-6 shadow-sm border border-[#e2e8f0]">
        <div className="flex items-center gap-3 mb-4">
          <div className="h-1 w-1 rounded-full bg-[#6366f1]"></div>
          <h3 className="text-lg font-semibold text-[#0f172a]">البحث والتصفية</h3>
          <div className="h-0.5 flex-1 bg-[#6366f1] opacity-20"></div>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="relative">
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="بحث باسم القسم أو الوصف..."
              className="w-full border border-[#e2e8f0] rounded-lg px-4 py-3 pr-12 focus:border-[#6366f1] focus:ring-2 focus:ring-[#6366f1]/20 transition-all duration-150 ease-out bg-white hover:border-[#6366f1]/50"
            />
            <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#64748b]" />
          </div>
          
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as any)}
            className="w-full border border-[#e2e8f0] rounded-lg px-4 py-3 focus:border-[#6366f1] focus:ring-2 focus:ring-[#6366f1]/20 transition-all duration-150 ease-out bg-white hover:border-[#6366f1]/50 font-medium"
          >
            <option value="ALL">كل الحالات</option>
            <option value="ACTIVE">نشط فقط</option>
            <option value="INACTIVE">غير نشط فقط</option>
          </select>

          <div className="flex items-center gap-3 px-4 py-3 bg-[#f8fafc] rounded-lg border border-[#e2e8f0]">
            <span className="text-sm font-medium text-[#64748b]">النتائج:</span>
            <span className="text-xl font-semibold text-[#6366f1]">
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


