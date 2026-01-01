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
import { useNewAppointmentsNotifications } from '@/hooks/useAppointments';

interface AdminHeaderProps {
  onMenuClick: () => void;
  sidebarOpen: boolean;
}

export default function AdminHeader({ onMenuClick, sidebarOpen }: AdminHeaderProps) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const { data: notificationsData } = useNewAppointmentsNotifications();

  const notifications = notificationsData?.data || [];
  const hasNotifications = notifications.length > 0;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="sticky top-0 z-20 bg-white/95 backdrop-blur-sm border-b border-[#e2e8f0] shadow-sm">
      <div className="flex items-center justify-between px-6 py-4">
        {/* Right Side */}
        <div className="flex items-center gap-4">
          {/* Menu Button */}
          <button
            onClick={onMenuClick}
            className="group p-2.5 hover:bg-[#6366f1]/10 rounded-lg transition-all duration-150 ease-out"
          >
            <Menu className="w-6 h-6 text-[#64748b] group-hover:text-[#6366f1] transition-colors duration-150" />
          </button>

          {/* Search */}
          <div className="relative">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#64748b] transition-colors duration-150 peer-focus:text-[#6366f1]" />
            <input
              type="text"
              placeholder="بحث..."
              className="peer w-64 pr-10 pl-4 py-2.5 border border-[#e2e8f0] rounded-lg bg-white focus:ring-2 focus:ring-[#6366f1] focus:border-transparent transition-all duration-150 ease-out placeholder:text-[#64748b] hover:border-[#6366f1]/50"
            />
          </div>
        </div>

        {/* Left Side */}
        <div className="flex items-center gap-3">
          {/* Notifications */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2.5 hover:bg-[#6366f1]/10 rounded-lg transition-all duration-150 ease-out group"
            >
              <Bell className="w-6 h-6 text-[#64748b] group-hover:text-[#6366f1] transition-colors duration-150" />
              {hasNotifications && (
                <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-[#ef4444] rounded-full animate-pulse"></span>
              )}
            </button>

            {/* Notifications Dropdown */}
            {showNotifications && (
              <div className="absolute left-0 mt-2 w-80 bg-white rounded-lg shadow-sm border border-[#e2e8f0] z-50 overflow-hidden">
                <div className="p-4 border-b border-[#e2e8f0] bg-white">
                  <h3 className="font-semibold text-[#0f172a]">الإشعارات</h3>
                </div>
                <div className="p-1 max-h-96 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <div className="p-6">
                      <p className="text-sm text-gray-500 text-center">
                        لا توجد إشعارات جديدة
                      </p>
                    </div>
                  ) : (
                    <ul className="divide-y divide-[#e2e8f0]">
                      {notifications.map((apt) => (
                        <li key={apt.id}>
                          <button
                            className="w-full px-4 py-3 text-right hover:bg-[#6366f1]/10 transition-colors duration-150 ease-out"
                            onClick={() => {
                              navigate(`/appointments/${apt.id}`);
                              setShowNotifications(false);
                            }}
                          >
                            <p className="text-sm font-medium text-[#0f172a]">
                              حجز موعد جديد
                            </p>
                            <p className="mt-1 text-xs text-[#64748b]">
                              {apt.patientName
                                ? `المريض ${apt.patientName}`
                                : 'مريض جديد'}{' '}
                              ·{' '}
                              {new Date(apt.startAt).toLocaleDateString('ar-SA', {
                                weekday: 'short',
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric',
                              })}{' '}
                              -{' '}
                              {new Date(apt.startAt).toLocaleTimeString('ar-SA', {
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </p>
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* User Menu */}
          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center gap-3 p-2 pr-4 hover:bg-[#6366f1]/10 rounded-lg transition-all duration-150 ease-out group"
            >
              <div className="w-10 h-10 bg-[#6366f1] rounded-lg flex items-center justify-center shadow-sm transition-all duration-150 ease-out group-hover:scale-[1.02]">
                <User className="w-5 h-5 text-white" />
              </div>
              <div className="text-right">
                <p className="text-sm font-semibold text-[#0f172a] group-hover:text-[#6366f1] transition-colors duration-150">{user?.name}</p>
                <p className="text-xs font-medium text-[#64748b]">{user?.role}</p>
              </div>
              <ChevronDown className="w-4 h-4 text-[#64748b] group-hover:text-[#6366f1] transition-all duration-150" />
            </button>

            {/* User Dropdown */}
            {showUserMenu && (
              <div className="absolute left-0 mt-2 w-56 bg-white rounded-lg shadow-sm border border-[#e2e8f0] z-50 overflow-hidden">
                <div className="p-2">
                  <button
                    onClick={() => {
                      navigate('/settings');
                      setShowUserMenu(false);
                    }}
                    className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-[#0f172a] hover:bg-[#6366f1]/10 rounded-lg transition-all duration-150 ease-out group"
                  >
                    <Settings className="w-4 h-4 group-hover:text-[#6366f1] transition-colors duration-150" />
                    <span>الإعدادات</span>
                  </button>
                  
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-[#ef4444] hover:bg-[#ef4444]/10 rounded-lg transition-all duration-150 ease-out group"
                  >
                    <LogOut className="w-4 h-4 transition-colors duration-150" />
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





