'use client';

import React from 'react';
import { Card } from '@/components/ui/Card';
import { useRouter } from 'next/navigation';

interface SpecialtyCardProps {
  id: string;
  name: string;
  icon?: string;
}

export const SpecialtyCard: React.FC<SpecialtyCardProps> = ({ id, name, icon }) => {
  const router = useRouter();

  return (
    <Card 
      className="p-6 hover:shadow-xl transition-all cursor-pointer group"
      onClick={() => router.push(`/specialties/${id}`)}
    >
      <div className="flex flex-col items-center text-center space-y-4">
        {icon && (
          <div className="w-24 h-24 group-hover:scale-110 transition-transform">
            <img 
              src={icon} 
              alt={name}
              className="w-full h-full object-cover rounded-lg"
            />
          </div>
        )}
        <h3 className="text-lg font-semibold text-gray-900">
          {name}
        </h3>
      </div>
    </Card>
  );
};