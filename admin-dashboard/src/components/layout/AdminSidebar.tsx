import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  Stethoscope,
  Building2,
  Calendar,
  CreditCard,
  FileText,
  BarChart3,
  Shield,
  Settings,
  X,
} from 'lucide-react';
import { cn } from '@/utils/cn';

interface AdminSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const menuItems = [
  {
    icon: LayoutDashboard,
    label: 'لوحة التحكم',
    path: '/',
  },
  {
    icon: Users,
    label: 'المستخدمين',
    path: '/users',
  },
  {
    icon: Stethoscope,
    label: 'الأطباء',
    path: '/doctors',
  },
  {
    icon: Building2,
    label: 'الأقسام',
    path: '/departments',
  },
  {
    icon: Calendar,
    label: 'المواعيد',
    path: '/appointments',
  },
  {
    icon: CreditCard,
    label: 'المدفوعات',
    path: '/payments',
  },
  {
    icon: FileText,
    label: 'السجلات الطبية',
    path: '/medical-records',
  },
  {
    icon: BarChart3,
    label: 'التقارير',
    path: '/reports',
  },
  {
    icon: Shield,
    label: 'سجل التدقيق',
    path: '/audit',
  },
  {
    icon: Settings,
    label: 'الإعدادات',
    path: '/settings',
  },
];

export default function AdminSidebar({ isOpen, onClose }: AdminSidebarProps) {
  return (
    <>
      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-20 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed top-0 right-0 h-full w-64 bg-white shadow-lg z-30 transform transition-transform duration-300',
          isOpen ? 'translate-x-0' : 'translate-x-full'
        )}
      >
        {/* Logo & Close Button */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary-600 rounded-lg flex items-center justify-center">
              <Stethoscope className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">لوحة الإدارة</h1>
              <p className="text-xs text-gray-500">نظام العيادات</p>
            </div>
          </div>
          
          {/* Close button for mobile */}
          <button
            onClick={onClose}
            className="lg:hidden text-gray-500 hover:text-gray-700"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="p-4 space-y-1">
          {menuItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/'}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 px-4 py-3 rounded-lg transition-colors',
                  isActive
                    ? 'bg-primary-50 text-primary-600 font-medium'
                    : 'text-gray-700 hover:bg-gray-50'
                )
              }
            >
              <item.icon className="w-5 h-5" />
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        {/* Footer */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t">
          <div className="text-xs text-center text-gray-500">
            <p>الإصدار 1.0.0</p>
            <p className="mt-1">© 2024 جميع الحقوق محفوظة</p>
          </div>
        </div>
      </aside>
    </>
  );
}
