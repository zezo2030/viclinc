import { Link, useLocation } from 'react-router-dom';
import { ChevronLeft, Home } from 'lucide-react';
import { cn } from '@/utils/cn';

const routeNames: Record<string, string> = {
  '': 'لوحة التحكم',
  'users': 'المستخدمين',
  'doctors': 'الأطباء',
  'departments': 'الأقسام',
  'appointments': 'المواعيد',
  'payments': 'المدفوعات',
  'medical-records': 'السجلات الطبية',
  'reports': 'التقارير',
  'audit': 'سجل التدقيق',
  'settings': 'الإعدادات',
};

export default function Breadcrumbs() {
  const location = useLocation();
  const pathnames = location.pathname.split('/').filter((x) => x);

  return (
    <nav className="flex items-center gap-2 text-sm mb-6">
      <Link
        to="/"
        className="flex items-center gap-1 text-gray-600 hover:text-primary-600 transition-colors"
      >
        <Home className="w-4 h-4" />
      </Link>

      {pathnames.map((name, index) => {
        const routeTo = `/${pathnames.slice(0, index + 1).join('/')}`;
        const isLast = index === pathnames.length - 1;
        const displayName = routeNames[name] || name;

        return (
          <div key={name} className="flex items-center gap-2">
            <ChevronLeft className="w-4 h-4 text-gray-400" />
            {isLast ? (
              <span className="text-gray-900 font-medium">{displayName}</span>
            ) : (
              <Link
                to={routeTo}
                className="text-gray-600 hover:text-primary-600 transition-colors"
              >
                {displayName}
              </Link>
            )}
          </div>
        );
      })}
    </nav>
  );
}










