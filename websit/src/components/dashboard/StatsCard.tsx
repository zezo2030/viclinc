'use client';

import React from 'react';
import { LucideIcon } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/Card';
import { cn } from '@/lib/utils';

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  color: 'blue' | 'green' | 'orange' | 'purple' | 'red';
  trend?: string;
  className?: string;
}

const colorVariants = {
  blue: {
    bg: 'bg-blue-50',
    icon: 'text-blue-600',
    border: 'border-blue-200',
    iconBg: 'bg-blue-100',
  },
  green: {
    bg: 'bg-green-50',
    icon: 'text-green-600',
    border: 'border-green-200',
    iconBg: 'bg-green-100',
  },
  orange: {
    bg: 'bg-orange-50',
    icon: 'text-orange-600',
    border: 'border-orange-200',
    iconBg: 'bg-orange-100',
  },
  purple: {
    bg: 'bg-purple-50',
    icon: 'text-purple-600',
    border: 'border-purple-200',
    iconBg: 'bg-purple-100',
  },
  red: {
    bg: 'bg-red-50',
    icon: 'text-red-600',
    border: 'border-red-200',
    iconBg: 'bg-red-100',
  },
};

export const StatsCard: React.FC<StatsCardProps> = ({
  title,
  value,
  icon: Icon,
  color,
  trend,
  className,
}) => {
  const variant = colorVariants[color];

  return (
    <Card className={cn(
      'relative overflow-hidden transition-all duration-300 hover:shadow-lg hover:scale-105',
      variant.bg,
      variant.border,
      className
    )}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
            <p className="text-3xl font-bold text-gray-900 mb-2">{value}</p>
            {trend && (
              <p className="text-sm text-gray-500">{trend}</p>
            )}
          </div>
          <div className={cn(
            'p-3 rounded-full',
            variant.iconBg
          )}>
            <Icon className={cn('w-6 h-6', variant.icon)} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
