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
          className="fixed inset-0 bg-gradient-to-br from-black/60 to-black/40 backdrop-blur-sm z-20 lg:hidden transition-all duration-300 animate-in fade-in"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed top-0 right-0 h-full w-64 bg-gradient-to-b from-white via-white to-gray-50/50 shadow-2xl z-30 transform transition-all duration-500 ease-in-out',
          isOpen ? 'translate-x-0' : 'translate-x-full'
        )}
      >
        {/* Logo & Close Button */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-purple-50">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/30 transition-all duration-300 hover:scale-110 hover:rotate-6">
              <Stethoscope className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                لوحة الإدارة
              </h1>
              <p className="text-xs font-semibold text-gray-600">نظام العيادات</p>
            </div>
          </div>
          
          {/* Close button for mobile */}
          <button
            onClick={onClose}
            className="lg:hidden p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all duration-300 hover:scale-110"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="p-4 space-y-2 overflow-y-auto h-[calc(100vh-180px)]">
          {menuItems.map((item, index) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/'}
              className={({ isActive }) =>
                cn(
                  'group flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 relative overflow-hidden',
                  isActive
                    ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white font-bold shadow-lg shadow-blue-500/30 scale-105'
                    : 'text-gray-700 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 hover:scale-105 hover:shadow-md font-medium'
                )
              }
              style={{ animationDelay: `${index * 50}ms` }}
            >
              {({ isActive }) => (
                <>
                  <item.icon className={cn(
                    "w-5 h-5 transition-all duration-300",
                    isActive ? "scale-110" : "group-hover:scale-110 group-hover:rotate-6"
                  )} />
                  <span className="transition-all duration-300">{item.label}</span>
                  {isActive && (
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-white rounded-r-full"></div>
                  )}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Footer */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-100 bg-gradient-to-r from-blue-50/50 to-purple-50/50 backdrop-blur-sm">
          <div className="text-xs text-center text-gray-600 font-medium">
            <p className="font-bold text-gray-700">الإصدار 1.0.0</p>
            <p className="mt-1">© 2024 جميع الحقوق محفوظة</p>
          </div>
        </div>
      </aside>
    </>
  );
}
