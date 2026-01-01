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
  LifeBuoy,
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
    icon: BarChart3,
    label: 'التقارير',
    path: '/reports',
  },
  {
    icon: LifeBuoy,
    label: 'الدعم الفني',
    path: '/support',
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
          className="fixed inset-0 bg-black/40 z-20 lg:hidden transition-all duration-150 ease-out"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed top-0 right-0 h-full w-64 bg-white shadow-sm z-30 transform transition-all duration-150 ease-out border-l border-[#e2e8f0]',
          isOpen ? 'translate-x-0' : 'translate-x-full'
        )}
      >
        {/* Logo & Close Button */}
        <div className="flex items-center justify-between p-6 border-b border-[#e2e8f0] bg-white">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-[#6366f1] rounded-xl flex items-center justify-center shadow-sm transition-all duration-150 ease-out hover:scale-[1.02]">
              <Stethoscope className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-semibold text-[#0f172a]">
                لوحة الإدارة
              </h1>
              <p className="text-xs font-medium text-[#64748b]">نظام العيادات</p>
            </div>
          </div>

          {/* Close button for mobile */}
          <button
            onClick={onClose}
            className="lg:hidden p-2 text-[#64748b] hover:text-[#6366f1] hover:bg-[#6366f1]/10 rounded-lg transition-all duration-150 ease-out"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="p-4 space-y-1 overflow-y-auto h-[calc(100vh-180px)]">
          {menuItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/'}
              className={({ isActive }) =>
                cn(
                  'group flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all duration-150 ease-out relative',
                  isActive
                    ? 'bg-[#6366f1] text-white font-medium shadow-sm'
                    : 'text-[#64748b] hover:bg-[#6366f1]/10 hover:text-[#0f172a] font-medium'
                )
              }
            >
              {({ isActive }) => (
                <>
                  <item.icon className={cn(
                    "w-5 h-5 transition-all duration-150 ease-out",
                    isActive ? "" : "group-hover:text-[#6366f1]"
                  )} />
                  <span className="transition-all duration-150 ease-out">{item.label}</span>
                  {isActive && (
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-white rounded-r-full"></div>
                  )}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Footer */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-[#e2e8f0] bg-white">
          <div className="text-xs text-center text-[#64748b] font-medium">
            <p className="font-semibold text-[#0f172a]">الإصدار 1.0.0</p>
            <p className="mt-1">© 2024 جميع الحقوق محفوظة</p>
          </div>
        </div>
      </aside>
    </>
  );
}
