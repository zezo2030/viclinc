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
    bg: 'bg-secondary-50',
    icon: 'text-secondary-600',
    border: 'border-secondary-200',
    iconBg: 'bg-secondary-100',
  },
  green: {
    bg: 'bg-primary-50',
    icon: 'text-primary-600',
    border: 'border-primary-200',
    iconBg: 'bg-primary-100',
  },
  orange: {
    bg: 'bg-warning-50',
    icon: 'text-warning-600',
    border: 'border-warning-200',
    iconBg: 'bg-warning-100',
  },
  purple: {
    bg: 'bg-purple-50',
    icon: 'text-purple-600',
    border: 'border-purple-200',
    iconBg: 'bg-purple-100',
  },
  red: {
    bg: 'bg-error-50',
    icon: 'text-error-600',
    border: 'border-error-200',
    iconBg: 'bg-error-100',
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
      'relative overflow-hidden transition-all duration-300 hover:shadow-lg hover:scale-105 border-2',
      variant.bg,
      variant.border,
      className
    )}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <p className="text-sm font-semibold text-gray-600 mb-2">{title}</p>
            <p className="text-3xl font-bold text-gray-900 mb-2">{value}</p>
            {trend && (
              <p className="text-xs text-gray-500 font-medium">{trend}</p>
            )}
          </div>
          <div className={cn(
            'p-4 rounded-xl shadow-sm',
            variant.iconBg
          )}>
            <Icon className={cn('w-7 h-7', variant.icon)} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
