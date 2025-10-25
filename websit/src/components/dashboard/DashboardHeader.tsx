'use client';

import React from 'react';
import { User } from '@/types';
import { Button } from '@/components/ui/Button';
import { Bell, Settings, LogOut } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DashboardHeaderProps {
  user: User | null;
  onLogout: () => void;
  className?: string;
}

export const DashboardHeader: React.FC<DashboardHeaderProps> = ({
  user,
  onLogout,
  className,
}) => {
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'صباح الخير';
    if (hour < 18) return 'مساء الخير';
    return 'مساء الخير';
  };

  return (
    <div className={cn(
      'bg-gradient-to-r from-blue-600 to-purple-600 text-white',
      className
    )}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            {/* صورة المستخدم */}
            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
              <span className="text-2xl font-bold">
                {user?.name?.charAt(0) || user?.email?.charAt(0) || 'U'}
              </span>
            </div>
            
            {/* معلومات المستخدم */}
            <div>
              <h1 className="text-2xl font-bold mb-1">
                {getGreeting()}، {user?.name || 'مستخدم'}
              </h1>
              <p className="text-blue-100">
                مرحباً بك في لوحة التحكم الخاصة بك
              </p>
            </div>
          </div>

          {/* أزرار الإجراءات */}
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              className="bg-white/10 border-white/20 text-white hover:bg-white/20"
            >
              <Bell className="w-4 h-4 mr-2" />
              الإشعارات
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              className="bg-white/10 border-white/20 text-white hover:bg-white/20"
            >
              <Settings className="w-4 h-4 mr-2" />
              الإعدادات
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={onLogout}
              className="bg-red-500/20 border-red-400/30 text-white hover:bg-red-500/30"
            >
              <LogOut className="w-4 h-4 mr-2" />
              تسجيل الخروج
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
