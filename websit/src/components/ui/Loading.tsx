'use client';

import React from 'react';
import { motion } from 'framer-motion';

interface LoadingProps {
  size?: 'sm' | 'md' | 'lg';
  text?: string;
  fullScreen?: boolean;
}

export const Loading: React.FC<LoadingProps> = ({ 
  size = 'md', 
  text = 'جاري التحميل...',
  fullScreen = false 
}) => {
  const sizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-12 h-12',
    lg: 'w-16 h-16',
  };

  const containerClass = fullScreen 
    ? 'min-h-screen flex items-center justify-center'
    : 'flex items-center justify-center py-12';

  return (
    <div className={containerClass}>
      <div className="text-center">
        <motion.div
          className={`${sizeClasses[size]} border-4 border-primary-200 border-t-primary-600 rounded-full mx-auto mb-4`}
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
        />
        {text && (
          <p className="text-gray-600 font-medium">{text}</p>
        )}
      </div>
    </div>
  );
};

export const SkeletonLoader: React.FC<{ className?: string }> = ({ className = '' }) => {
  return (
    <div className={`animate-pulse bg-gray-200 rounded ${className}`}></div>
  );
};

export const CardSkeleton: React.FC = () => {
  return (
    <div className="bg-white rounded-xl shadow-md p-6 space-y-4">
      <SkeletonLoader className="h-8 w-3/4" />
      <SkeletonLoader className="h-4 w-full" />
      <SkeletonLoader className="h-4 w-5/6" />
      <div className="flex gap-2 mt-4">
        <SkeletonLoader className="h-10 w-24" />
        <SkeletonLoader className="h-10 w-24" />
      </div>
    </div>
  );
};

export const DoctorCardSkeleton: React.FC = () => {
  return (
    <div className="bg-white rounded-xl shadow-md p-6">
      <div className="flex flex-col items-center text-center space-y-4">
        <SkeletonLoader className="h-24 w-24 rounded-full" />
        <SkeletonLoader className="h-6 w-32" />
        <SkeletonLoader className="h-4 w-24" />
        <SkeletonLoader className="h-4 w-40" />
        <div className="flex gap-2 w-full mt-4">
          <SkeletonLoader className="h-10 flex-1" />
          <SkeletonLoader className="h-10 flex-1" />
        </div>
      </div>
    </div>
  );
};



