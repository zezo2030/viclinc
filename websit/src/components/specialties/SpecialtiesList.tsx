'use client';

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { specialtyService } from '@/lib/api/specialties';
import { SpecialtyCard } from './SpecialtyCard';

export const SpecialtiesList: React.FC = () => {
  // الحصول على التخصصات من API
  const { data: specialties, isLoading, error } = useQuery({
    queryKey: ['specialties'],
    queryFn: () => specialtyService.getSpecialties(),
    staleTime: 5 * 60 * 1000, // 5 دقائق
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">جاري تحميل التخصصات...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600 mb-4">حدث خطأ في تحميل التخصصات</p>
        <button 
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
        >
          إعادة المحاولة
        </button>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {specialties?.map((specialty) => (
        <SpecialtyCard
          key={specialty.id}
          id={specialty.id}
          name={specialty.name}
          icon={specialty.icon}
        />
      ))}
    </div>
  );
};
