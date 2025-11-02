import { useState, useMemo } from 'react'
import { Plus } from 'lucide-react'
import toast from 'react-hot-toast'
import AdminLayout from '@/components/layout/AdminLayout'
import Breadcrumbs from '@/components/layout/Breadcrumbs'
import UsersTable from '@/components/users/UsersTable'
import UserFilters from '@/components/users/UserFilters'
import CreateUserModal from '@/components/users/CreateUserModal'
import EditUserModal from '@/components/users/EditUserModal'
import HardDeleteConfirmModal from '@/components/users/HardDeleteConfirmModal'
import {
  useUsers,
  useCreateUser,
  useUpdateUser,
  useDeleteUser,
  useUpdateUserStatus,
  useUpdateUserRole,
  useHardDeleteUser,
} from '@/hooks/useUsers'
import { UserStatus } from '@/types/user.types'
import type { UserFilters as UserFiltersType, User, UserRole, CreateUserRequest, UpdateUserRequest } from '@/types/user.types'

export default function UsersPage() {
  const [filters, setFilters] = useState<UserFiltersType>({})
  const [page, setPage] = useState(1)
  const [sortBy, setSortBy] = useState<'name' | 'email' | 'createdAt'>('createdAt')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [hardDeletingUser, setHardDeletingUser] = useState<User | null>(null)

  // Prepare query params
  const queryParams = useMemo(() => {
    const params: any = {
      page,
      limit: 10,
      sortBy,
      sortOrder,
    }

    if (filters.search) {
      params.search = filters.search
    }
    if (filters.role && filters.role !== 'ALL') {
      params.role = filters.role
    }
    if (filters.status && filters.status !== 'ALL') {
      params.status = filters.status
    }

    return params
  }, [page, sortBy, sortOrder, filters])

  // Fetch users
  const { data, isLoading, error } = useUsers(queryParams)

  // Mutations
  const createUser = useCreateUser()
  const updateUser = useUpdateUser()
  const deleteUser = useDeleteUser()
  const hardDeleteUser = useHardDeleteUser()
  const updateStatus = useUpdateUserStatus()
  const updateRole = useUpdateUserRole()

  // Handlers
  const handleCreate = async (data: CreateUserRequest) => {
    await createUser.mutateAsync(data)
  }

  const handleUpdate = async (data: UpdateUserRequest) => {
    if (!editingUser) return
    await updateUser.mutateAsync({ id: editingUser.id, data })
  }

  const handleDelete = async (user: User) => {
    if (!confirm(`هل أنت متأكد من حذف المستخدم "${user.name}"؟`)) {
      return
    }

    // التحقق من وجود ID
    if (!user.id) {
      console.error('User ID is missing:', user)
      toast.error('خطأ: لا يوجد معرف للمستخدم')
      return
    }

    try {
      // Backend يستخدم updateStatus بدلاً من delete فعلي
      console.log('Attempting to delete user:', { id: user.id, name: user.name })
      await updateStatus.mutateAsync({ id: user.id, status: UserStatus.PENDING_DELETE })
      toast.success('تم وضع المستخدم قيد الحذف بنجاح')
    } catch (error: any) {
      console.error('Delete user error:', error)
      const errorMessage = 
        error?.response?.data?.message || 
        error?.message || 
        'فشل حذف المستخدم'
      toast.error(errorMessage)
    }
  }

  const handleStatusChange = async (user: User, status: UserStatus) => {
    try {
      await updateStatus.mutateAsync({ id: user.id, status })
      toast.success('تم تحديث حالة المستخدم بنجاح')
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'فشل تحديث حالة المستخدم')
    }
  }

  const handleRoleChange = async (user: User, role: UserRole) => {
    try {
      await updateRole.mutateAsync({ id: user.id, role })
      toast.success('تم تحديث دور المستخدم بنجاح')
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'فشل تحديث دور المستخدم')
    }
  }

  const handleHardDelete = async (payload: { 
    reason?: string; 
    purgeRelated?: boolean; 
    anonymize?: boolean 
  }) => {
    if (!hardDeletingUser) return

    try {
      await hardDeleteUser.mutateAsync({ id: hardDeletingUser.id, payload })
      toast.success('تم حذف المستخدم نهائياً')
      setHardDeletingUser(null)
    } catch (error: any) {
      const errorMessage = 
        error?.response?.data?.message || 
        error?.message || 
        'فشل حذف المستخدم نهائياً'
      toast.error(errorMessage)
      throw error // Re-throw to let modal handle the error
    }
  }

  const handleSort = (column: 'name' | 'email' | 'createdAt') => {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      setSortBy(column)
      setSortOrder('asc')
    }
  }

  const handleFiltersReset = () => {
    setFilters({})
    setPage(1)
  }

  if (error) {
    return (
      <AdminLayout>
        <Breadcrumbs />
        <div className="p-6">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <p className="text-red-600">حدث خطأ في تحميل المستخدمين</p>
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
            <h1 className="text-2xl font-bold text-gray-900">إدارة المستخدمين</h1>
            <p className="text-gray-600 mt-1">عرض وإدارة جميع المستخدمين في النظام</p>
          </div>
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
          >
            <Plus className="w-5 h-5" />
            <span>إضافة مستخدم</span>
          </button>
        </div>

        {/* Filters */}
        <UserFilters filters={filters} onFiltersChange={setFilters} onReset={handleFiltersReset} />

        {/* Table */}
        <UsersTable
          users={data?.data || []}
          isLoading={isLoading}
          onEdit={setEditingUser}
          onDelete={handleDelete}
          onHardDelete={setHardDeletingUser}
          onStatusChange={handleStatusChange}
          onRoleChange={handleRoleChange}
          pagination={
            data?.pagination
              ? {
                  page: data.pagination.page,
                  totalPages: data.pagination.totalPages,
                  total: data.pagination.total,
                }
              : undefined
          }
          onPageChange={setPage}
          sortBy={sortBy}
          sortOrder={sortOrder}
          onSort={handleSort}
        />

        {/* Modals */}
        <CreateUserModal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          onSubmit={handleCreate}
        />

        {editingUser && (
          <EditUserModal
            isOpen={!!editingUser}
            onClose={() => setEditingUser(null)}
            user={editingUser}
            onSubmit={handleUpdate}
          />
        )}

        {hardDeletingUser && (
          <HardDeleteConfirmModal
            isOpen={!!hardDeletingUser}
            onClose={() => setHardDeletingUser(null)}
            user={hardDeletingUser}
            onConfirm={handleHardDelete}
          />
        )}
      </div>
    </AdminLayout>
  )
}

