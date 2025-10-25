'use client';

import React from 'react';
import { cn } from '@/lib/utils';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'secondary' | 'destructive' | 'outline';
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({ 
  children, 
  variant = 'default',
  className 
}) => {
  const variants = {
    default: 'bg-primary-600 text-white',
    secondary: 'bg-gray-100 text-gray-900',
    destructive: 'bg-red-100 text-red-800',
    outline: 'border border-gray-300 text-gray-900',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
        variants[variant],
        className
      )}
    >
      {children}
    </span>
  );
};
