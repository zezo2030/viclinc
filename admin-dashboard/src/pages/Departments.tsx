import { useMemo, useState } from 'react'
import toast from 'react-hot-toast'
import AdminLayout from '@/components/layout/AdminLayout'
import Breadcrumbs from '@/components/layout/Breadcrumbs'
import DepartmentsGrid from '@/components/departments/DepartmentsGrid'
import DepartmentCard from '@/components/departments/DepartmentCard'
import CreateDepartmentModal from '@/components/departments/CreateDepartmentModal'
import EditDepartmentModal from '@/components/departments/EditDepartmentModal'
import { useDepartments, useCreateDepartment, useUpdateDepartment, useDeleteDepartment } from '@/hooks/useDepartments'
import type { Department, CreateDepartmentRequest, UpdateDepartmentRequest } from '@/types/department.types'

export default function DepartmentsPage() {
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [editingDept, setEditingDept] = useState<Department | null>(null)
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState<'ALL' | 'ACTIVE' | 'INACTIVE'>('ALL')

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

  return (
    <AdminLayout>
      <Breadcrumbs />
      <div className="p-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">إدارة الأقسام</h1>
            <p className="text-gray-600 mt-1">عرض وإدارة أقسام العيادة</p>
          </div>
          <button
            onClick={() => setIsCreateOpen(true)}
            className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
          >
            إضافة قسم
          </button>
        </div>

        <div className="mb-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="بحث باسم القسم أو الوصف"
            className="w-full border rounded-lg px-3 py-2"
          />
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as any)}
            className="w-full border rounded-lg px-3 py-2"
          >
            <option value="ALL">كل الحالات</option>
            <option value="ACTIVE">نشط</option>
            <option value="INACTIVE">غير نشط</option>
          </select>
        </div>

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
            />
          )}
        />

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
      </div>
    </AdminLayout>
  )
}


