import { AdminLayout } from '@/components/layout/AdminLayout';

export function ImportExport() {
  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">الاستيراد والتصدير</h1>
            <p className="text-gray-600">استيراد وتصدير البيانات من وإلى النظام</p>
          </div>
        </div>

        {/* Import/Export Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">استيراد البيانات</h3>
            <div className="space-y-4">
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                <div className="text-gray-500">اسحب الملفات هنا أو انقر للاختيار</div>
              </div>
              <button className="w-full px-4 py-2 text-sm font-medium text-white bg-blue-800 rounded-md hover:bg-blue-700">
                استيراد البيانات
              </button>
            </div>
          </div>
          
          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">تصدير البيانات</h3>
            <div className="space-y-4">
              <button className="w-full px-4 py-2 text-sm font-medium text-white bg-green-800 rounded-md hover:bg-green-700">
                تصدير المستخدمين
              </button>
              <button className="w-full px-4 py-2 text-sm font-medium text-white bg-green-800 rounded-md hover:bg-green-700">
                تصدير الأطباء
              </button>
              <button className="w-full px-4 py-2 text-sm font-medium text-white bg-green-800 rounded-md hover:bg-green-700">
                تصدير المواعيد
              </button>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
