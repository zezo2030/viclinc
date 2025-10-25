import React from 'react';
import { clsx } from 'clsx';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info';
  size?: 'sm' | 'md' | 'lg';
  rounded?: boolean;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'default',
  size = 'md',
  rounded = false,
  className,
  ...props
}) => {
  const baseClasses = 'inline-flex items-center font-medium';
  
  const variantClasses = {
    default: 'bg-gray-100 text-gray-800',
    success: 'bg-green-100 text-green-800',
    warning: 'bg-yellow-100 text-yellow-800',
    danger: 'bg-red-100 text-red-800',
    info: 'bg-blue-100 text-blue-800',
  };
  
  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-0.5 text-sm',
    lg: 'px-3 py-1 text-base',
  };
  
  const roundedClasses = rounded ? 'rounded-full' : 'rounded-md';
  
  return (
    <span
      className={clsx(
        baseClasses,
        variantClasses[variant],
        sizeClasses[size],
        roundedClasses,
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
};

export interface StatusBadgeProps extends BadgeProps {
  status: 'active' | 'inactive' | 'pending' | 'approved' | 'suspended' | 'cancelled' | 'completed';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  className,
  ...props
}) => {
  const statusConfig = {
    active: { variant: 'success' as const, text: 'نشط' },
    inactive: { variant: 'default' as const, text: 'غير نشط' },
    pending: { variant: 'warning' as const, text: 'في الانتظار' },
    approved: { variant: 'success' as const, text: 'معتمد' },
    suspended: { variant: 'danger' as const, text: 'معلق' },
    cancelled: { variant: 'danger' as const, text: 'ملغي' },
    completed: { variant: 'success' as const, text: 'مكتمل' },
  };
  
  const config = statusConfig[status] || statusConfig.inactive;
  
  return (
    <Badge variant={config.variant} className={className} {...props}>
      {config.text}
    </Badge>
  );
};
