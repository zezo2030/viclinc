'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { 
  Plus, 
  Calendar, 
  User, 
  MessageSquare, 
  FileText, 
  Settings,
  Heart,
  Video,
  Users,
  Stethoscope
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';

interface Action {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  color: 'primary' | 'blue' | 'green' | 'purple' | 'orange';
  href?: string;
  onClick?: () => void;
}

interface QuickActionsProps {
  className?: string;
}

const colorVariants = {
  primary: 'bg-blue-600 hover:bg-blue-700 text-white',
  blue: 'bg-blue-100 hover:bg-blue-200 text-blue-700 border-blue-200',
  green: 'bg-green-100 hover:bg-green-200 text-green-700 border-green-200',
  purple: 'bg-purple-100 hover:bg-purple-200 text-purple-700 border-purple-200',
  orange: 'bg-orange-100 hover:bg-orange-200 text-orange-700 border-orange-200',
};

export const QuickActions: React.FC<QuickActionsProps> = ({ className }) => {
  const router = useRouter();
  
  const actions: Action[] = [
    {
      id: 'book-appointment',
      label: 'حجز موعد جديد',
      icon: Plus,
      color: 'primary',
      onClick: () => router.push('/appointments/new'),
    },
    {
      id: 'view-appointments',
      label: 'عرض المواعيد',
      icon: Calendar,
      color: 'blue',
      onClick: () => router.push('/appointments'),
    },
    {
      id: 'specialties',
      label: 'التخصصات',
      icon: Stethoscope,
      color: 'green',
      onClick: () => router.push('/specialties'),
    },
    {
      id: 'consultations',
      label: 'الاستشارات',
      icon: Video,
      color: 'purple',
      onClick: () => router.push('/consultations'),
    },
    {
      id: 'profile',
      label: 'الملف الشخصي',
      icon: User,
      color: 'green',
      onClick: () => console.log('الملف الشخصي'),
    },
    {
      id: 'messages',
      label: 'الرسائل',
      icon: MessageSquare,
      color: 'purple',
      onClick: () => console.log('الرسائل'),
    },
    {
      id: 'medical-records',
      label: 'السجلات الطبية',
      icon: FileText,
      color: 'orange',
      onClick: () => console.log('السجلات الطبية'),
    },
    {
      id: 'health-tips',
      label: 'نصائح صحية',
      icon: Heart,
      color: 'green',
      onClick: () => console.log('نصائح صحية'),
    },
    {
      id: 'settings',
      label: 'الإعدادات',
      icon: Settings,
      color: 'purple',
      onClick: () => console.log('الإعدادات'),
    },
  ];

  return (
    <Card className={cn('h-full', className)}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Plus className="w-5 h-5 text-blue-600" />
          الإجراءات السريعة
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-3">
          {actions.map((action) => {
            const Icon = action.icon;
            return (
              <Button
                key={action.id}
                onClick={action.onClick}
                className={cn(
                  'h-auto p-4 flex flex-col items-center gap-2 transition-all duration-200 hover:scale-105',
                  colorVariants[action.color]
                )}
                variant="outline"
              >
                <Icon className="w-5 h-5" />
                <span className="text-sm font-medium text-center leading-tight">
                  {action.label}
                </span>
              </Button>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};
