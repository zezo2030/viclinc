import { AdminLayout } from '@/components/layout/AdminLayout';

export function Users() {
  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">إدارة المستخدمين</h1>
            <p className="text-gray-600">عرض وإدارة جميع المستخدمين في النظام</p>
          </div>
          <button className="px-4 py-2 text-sm font-medium text-white bg-blue-800 rounded-md hover:bg-blue-700">
            إضافة مستخدم جديد
          </button>
        </div>

        {/* Users Table */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">قائمة المستخدمين</h3>
          </div>
          <div className="p-6">
            <div className="text-center py-12">
              <div className="text-gray-500">جاري تحميل المستخدمين...</div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
