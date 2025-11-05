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
          <div className="rounded-2xl bg-gradient-to-br from-red-50 to-red-100/50 border border-red-200 p-8 text-center shadow-lg">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-200 mb-4">
              <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p className="text-xl font-bold text-red-800 mb-2">حدث خطأ في تحميل المستخدمين</p>
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
      <div className="mb-8 relative overflow-hidden rounded-2xl bg-gradient-to-br from-cyan-500 via-blue-600 to-indigo-500 p-8 shadow-2xl">
        <div className="relative z-10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-4xl font-black text-white drop-shadow-lg">
              إدارة المستخدمين
            </h1>
            <p className="mt-2 text-lg font-medium text-blue-100">
              عرض وإدارة جميع المستخدمين في النظام
            </p>
            <div className="mt-4 flex items-center gap-4 text-white/90">
              <span className="flex items-center gap-2 bg-white/20 px-3 py-1.5 rounded-lg backdrop-blur-sm">
                <span className="text-2xl font-bold">{data?.pagination?.total || 0}</span>
                <span className="text-sm">مستخدم</span>
              </span>
            </div>
          </div>
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="group px-6 py-3 bg-white text-blue-600 rounded-xl hover:scale-105 transition-all duration-300 font-bold shadow-xl hover:shadow-2xl flex items-center gap-2"
          >
            <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300" />
            <span>إضافة مستخدم</span>
          </button>
        </div>
        {/* Decorative Elements */}
        <div className="absolute top-0 left-0 w-64 h-64 bg-white/10 rounded-full -translate-x-32 -translate-y-32 blur-3xl"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-white/10 rounded-full translate-x-32 translate-y-32 blur-3xl"></div>
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
    </AdminLayout>
  )
}

