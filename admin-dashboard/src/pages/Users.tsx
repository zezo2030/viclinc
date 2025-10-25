import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { CreateUserModal } from '@/components/users/CreateUserModal';
import { UsersTable } from '@/components/users/UsersTable';
import { adminService } from '@clinic/shared';
import { Plus, Users as UsersIcon, AlertCircle } from 'lucide-react';

export function Users() {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState<{ role?: string; status?: string }>({});

  const { data: usersData, isLoading, error } = useQuery({
    queryKey: ['admin-users', { search: searchTerm, ...filters }],
    queryFn: () => adminService.getUsers({ 
      search: searchTerm, 
      ...filters,
      page: 1,
      limit: 10
    }),
  });

  const handleSearch = (search: string) => {
    setSearchTerm(search);
  };

  const handleFilter = (newFilters: { role?: string; status?: string }) => {
    setFilters(newFilters);
  };

  if (error) {
    return (
      <AdminLayout>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">إدارة المستخدمين</h1>
              <p className="text-gray-600">عرض وإدارة جميع المستخدمين في النظام</p>
            </div>
          </div>

          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <div className="flex items-center">
              <AlertCircle className="w-5 h-5 text-red-400 ml-3" />
              <div>
                <h3 className="text-sm font-medium text-red-800">خطأ في تحميل البيانات</h3>
                <p className="text-sm text-red-600 mt-1">
                  حدث خطأ أثناء تحميل قائمة المستخدمين. يرجى المحاولة مرة أخرى.
                </p>
              </div>
            </div>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">إدارة المستخدمين</h1>
            <p className="text-gray-600">عرض وإدارة جميع المستخدمين في النظام</p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-800 rounded-md hover:bg-blue-700"
          >
            <Plus className="w-4 h-4 ml-2" />
            إضافة مستخدم جديد
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <UsersIcon className="h-6 w-6 text-gray-400" />
                </div>
                <div className="mr-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">إجمالي المستخدمين</dt>
                    <dd className="text-lg font-medium text-gray-900">{usersData?.data?.total || 0}</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <UsersIcon className="h-6 w-6 text-blue-400" />
                </div>
                <div className="mr-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">الأطباء</dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {usersData?.data?.users?.filter((user: any) => user.role === 'DOCTOR').length || 0}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <UsersIcon className="h-6 w-6 text-green-400" />
                </div>
                <div className="mr-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">المرضى</dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {usersData?.data?.users?.filter((user: any) => user.role === 'PATIENT').length || 0}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <UsersIcon className="h-6 w-6 text-red-400" />
                </div>
                <div className="mr-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">المعطلون</dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {usersData?.data?.users?.filter((user: any) => user.status === 'DISABLED').length || 0}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Users Table */}
        <UsersTable
          data={usersData?.data || { users: [], total: 0, page: 1, limit: 10, totalPages: 0 }}
          isLoading={isLoading}
          onSearch={handleSearch}
          onFilter={handleFilter}
        />

        {/* Create User Modal */}
        <CreateUserModal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
        />
      </div>
    </AdminLayout>
  );
}
