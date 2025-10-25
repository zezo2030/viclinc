import { AdminLayout } from '@/components/layout/AdminLayout';

export function System() {
  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">إعدادات النظام</h1>
            <p className="text-gray-600">إدارة إعدادات النظام والصيانة</p>
          </div>
        </div>

        {/* System Settings */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">حالة النظام</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">حالة الخادم:</span>
                <span className="text-green-600">متصل</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">قاعدة البيانات:</span>
                <span className="text-green-600">متصل</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">الذاكرة المؤقتة:</span>
                <span className="text-green-600">متصل</span>
              </div>
            </div>
          </div>
          
          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">الصيانة</h3>
            <div className="space-y-3">
              <button className="w-full px-4 py-2 text-sm font-medium text-white bg-blue-800 rounded-md hover:bg-blue-700">
                تنظيف الذاكرة المؤقتة
              </button>
              <button className="w-full px-4 py-2 text-sm font-medium text-white bg-yellow-800 rounded-md hover:bg-yellow-700">
                إنشاء نسخة احتياطية
              </button>
              <button className="w-full px-4 py-2 text-sm font-medium text-white bg-red-800 rounded-md hover:bg-red-700">
                إعادة تشغيل النظام
              </button>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
