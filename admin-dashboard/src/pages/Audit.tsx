import { AdminLayout } from '@/components/layout/AdminLayout';

export function Audit() {
  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">سجل التدقيق</h1>
            <p className="text-gray-600">عرض سجل جميع العمليات في النظام</p>
          </div>
        </div>

        {/* Audit Log */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">سجل العمليات</h3>
          </div>
          <div className="p-6">
            <div className="text-center py-12">
              <div className="text-gray-500">جاري تحميل سجل التدقيق...</div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
