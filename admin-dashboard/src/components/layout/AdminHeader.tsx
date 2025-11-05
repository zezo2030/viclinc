import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Menu,
  Search,
  Bell,
  User,
  LogOut,
  Settings,
  ChevronDown,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

interface AdminHeaderProps {
  onMenuClick: () => void;
  sidebarOpen: boolean;
}

export default function AdminHeader({ onMenuClick, sidebarOpen }: AdminHeaderProps) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="sticky top-0 z-20 backdrop-blur-md bg-white/80 border-b border-gray-200/50 shadow-sm">
      <div className="flex items-center justify-between px-6 py-4">
        {/* Right Side */}
        <div className="flex items-center gap-4">
          {/* Menu Button */}
          <button
            onClick={onMenuClick}
            className="group p-2.5 hover:bg-gradient-to-br hover:from-blue-50 hover:to-purple-50 rounded-xl transition-all duration-300 hover:scale-105 hover:shadow-md"
          >
            <Menu className="w-6 h-6 text-gray-700 group-hover:text-blue-600 transition-colors" />
          </button>

          {/* Search */}
          <div className="relative">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 transition-colors peer-focus:text-blue-600" />
            <input
              type="text"
              placeholder="بحث..."
              className="peer w-64 pr-10 pl-4 py-2.5 border border-gray-200 rounded-xl bg-white/70 backdrop-blur-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:bg-white transition-all duration-300 placeholder:text-gray-400 hover:border-gray-300 hover:shadow-sm"
            />
          </div>
        </div>

        {/* Left Side */}
        <div className="flex items-center gap-3">
          {/* Notifications */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2.5 hover:bg-gradient-to-br hover:from-blue-50 hover:to-purple-50 rounded-xl transition-all duration-300 hover:scale-105 hover:shadow-md group"
            >
              <Bell className="w-6 h-6 text-gray-700 group-hover:text-blue-600 transition-colors" />
              <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-gradient-to-br from-red-500 to-red-600 rounded-full animate-pulse shadow-lg shadow-red-500/50"></span>
            </button>

            {/* Notifications Dropdown */}
            {showNotifications && (
              <div className="absolute left-0 mt-2 w-80 bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-gray-100 z-50 overflow-hidden animate-in slide-in-from-top-2 duration-300">
                <div className="p-4 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-purple-50">
                  <h3 className="font-bold text-gray-900">الإشعارات</h3>
                </div>
                <div className="p-6">
                  <p className="text-sm text-gray-500 text-center">
                    لا توجد إشعارات جديدة
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* User Menu */}
          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center gap-3 p-2 pr-4 hover:bg-gradient-to-br hover:from-blue-50 hover:to-purple-50 rounded-xl transition-all duration-300 hover:shadow-md group"
            >
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/30 transition-all duration-300 group-hover:scale-110 group-hover:rotate-3">
                <User className="w-5 h-5 text-white" />
              </div>
              <div className="text-right">
                <p className="text-sm font-bold text-gray-900 group-hover:text-blue-600 transition-colors">{user?.name}</p>
                <p className="text-xs font-medium text-gray-500">{user?.role}</p>
              </div>
              <ChevronDown className="w-4 h-4 text-gray-500 group-hover:text-blue-600 transition-all group-hover:translate-y-0.5" />
            </button>

            {/* User Dropdown */}
            {showUserMenu && (
              <div className="absolute left-0 mt-2 w-56 bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-gray-100 z-50 overflow-hidden animate-in slide-in-from-top-2 duration-300">
                <div className="p-2">
                  <button
                    onClick={() => {
                      navigate('/settings');
                      setShowUserMenu(false);
                    }}
                    className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gradient-to-r hover:from-blue-50 hover:to-blue-100 rounded-xl transition-all duration-300 group"
                  >
                    <Settings className="w-4 h-4 group-hover:rotate-90 transition-transform duration-300" />
                    <span>الإعدادات</span>
                  </button>
                  
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-red-600 hover:bg-gradient-to-r hover:from-red-50 hover:to-red-100 rounded-xl transition-all duration-300 group"
                  >
                    <LogOut className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" />
                    <span>تسجيل الخروج</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}





