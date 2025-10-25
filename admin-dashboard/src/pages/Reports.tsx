import { AdminLayout } from '@/components/layout/AdminLayout';

export function Reports() {
  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">التقارير والإحصائيات</h1>
            <p className="text-gray-600">عرض التقارير والإحصائيات المختلفة للنظام</p>
          </div>
          <button className="px-4 py-2 text-sm font-medium text-white bg-blue-800 rounded-md hover:bg-blue-700">
            تصدير التقرير
          </button>
        </div>

        {/* Reports Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">تقرير الأداء اليومي</h3>
            <div className="text-center py-8">
              <div className="text-gray-500">جاري تحميل التقرير...</div>
            </div>
          </div>
          
          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">تقرير الأداء الأسبوعي</h3>
            <div className="text-center py-8">
              <div className="text-gray-500">جاري تحميل التقرير...</div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
