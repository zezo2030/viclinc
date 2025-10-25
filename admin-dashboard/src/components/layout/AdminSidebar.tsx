
import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { clsx } from 'clsx';
import {
  LayoutDashboard,
  Users,
  UserCheck,
  Calendar,
  BarChart3,
  FileText,
  Download,
  Upload,
  Shield,
  Settings,
  LogOut,
  Menu,
  X,
} from 'lucide-react';

interface AdminSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const navigation = [
  { name: 'لوحة الإدارة', href: '/', icon: LayoutDashboard },
  { name: 'المستخدمين', href: '/users', icon: Users },
  { name: 'الأطباء', href: '/doctors', icon: UserCheck },
  { name: 'المواعيد', href: '/appointments', icon: Calendar },
  { name: 'التقارير', href: '/reports', icon: BarChart3 },
  { name: 'الاستيراد/التصدير', href: '/import-export', icon: Download },
  { name: 'سجل التدقيق', href: '/audit', icon: FileText },
  { name: 'النظام', href: '/system', icon: Settings },
];

export function AdminSidebar({ isOpen, onClose }: AdminSidebarProps) {
  const location = useLocation();

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40 bg-gray-600 bg-opacity-75 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div className={clsx(
        'fixed top-0 right-0 z-50 h-full w-64 bg-gray-900 text-white transform transition-transform duration-300 ease-in-out lg:translate-x-0',
        isOpen ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'
      )}>
        <div className="flex items-center justify-between h-16 px-6 border-b border-gray-700">
          <h1 className="text-xl font-bold">لوحة الإدارة</h1>
          <button
            onClick={onClose}
            className="lg:hidden p-2 rounded-md hover:bg-gray-700"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="mt-6 px-3">
          <div className="space-y-1">
            {navigation.map((item) => {
              const isActive = location.pathname === item.href;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={clsx(
                    'group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors',
                    isActive
                      ? 'bg-blue-800 text-white'
                      : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                  )}
                  onClick={() => {
                    // Close sidebar on mobile after navigation
                    if (window.innerWidth < 1024) {
                      onClose();
                    }
                  }}
                >
                  <item.icon className="ml-3 h-5 w-5" />
                  {item.name}
                </Link>
              );
            })}
          </div>
        </nav>

        {/* User section */}
        <div className="absolute bottom-0 w-full p-4 border-t border-gray-700">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-blue-800 rounded-full flex items-center justify-center">
                <span className="text-sm font-medium">أ</span>
              </div>
            </div>
            <div className="mr-3">
              <p className="text-sm font-medium text-white">مدير النظام</p>
              <p className="text-xs text-gray-400">admin@clinic.com</p>
            </div>
          </div>
          <button className="mt-3 w-full flex items-center px-3 py-2 text-sm text-gray-300 hover:bg-gray-700 rounded-md">
            <LogOut className="ml-3 h-4 w-4" />
            تسجيل الخروج
          </button>
        </div>
      </div>
    </>
  );
}
