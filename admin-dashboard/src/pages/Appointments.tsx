import { AdminLayout } from '@/components/layout/AdminLayout';

export function Appointments() {
  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">إدارة المواعيد</h1>
            <p className="text-gray-600">عرض وإدارة جميع المواعيد في النظام</p>
          </div>
          <button className="px-4 py-2 text-sm font-medium text-white bg-blue-800 rounded-md hover:bg-blue-700">
            إضافة موعد جديد
          </button>
        </div>

        {/* Appointments Table */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">قائمة المواعيد</h3>
          </div>
          <div className="p-6">
            <div className="text-center py-12">
              <div className="text-gray-500">جاري تحميل المواعيد...</div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
