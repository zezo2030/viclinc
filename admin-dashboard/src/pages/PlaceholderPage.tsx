import AdminLayout from '@/components/layout/AdminLayout';
import Breadcrumbs from '@/components/layout/Breadcrumbs';

interface PlaceholderPageProps {
  title: string;
  description?: string;
}

export default function PlaceholderPage({ title, description }: PlaceholderPageProps) {
  return (
    <AdminLayout>
      <Breadcrumbs />
      
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
        {description && <p className="text-gray-600 mt-1">{description}</p>}
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
        <div className="max-w-md mx-auto">
          <div className="w-24 h-24 bg-gray-100 rounded-full mx-auto mb-4 flex items-center justify-center">
            <span className="text-4xl">🚧</span>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            قيد الإنشاء
          </h2>
          <p className="text-gray-600">
            هذه الصفحة قيد التطوير وستكون متاحة قريباً
          </p>
        </div>
      </div>
    </AdminLayout>
  );
}












