'use client';

import React from 'react';
import { Card } from '@/components/ui/Card';
import { useRouter } from 'next/navigation';
import { getDepartmentImageUrl } from '@/lib/utils/image';

interface SpecialtyCardProps {
  id: string;
  name: string;
  icon?: string;
  logoUrl?: string;
}

export const SpecialtyCard: React.FC<SpecialtyCardProps> = ({ id, name, icon, logoUrl }) => {
  const router = useRouter();
  const imageUrl = getDepartmentImageUrl(logoUrl, icon);

  return (
    <Card 
      className="p-6 hover:shadow-xl transition-all cursor-pointer group"
      onClick={() => router.push(`/specialties/${id}`)}
    >
      <div className="flex flex-col items-center text-center space-y-4">
        {(logoUrl || icon) && (
          <div className="w-24 h-24 group-hover:scale-110 transition-transform">
            <img 
              src={imageUrl} 
              alt={name}
              className="w-full h-full object-cover rounded-lg"
              onError={(e) => {
                // Fallback to placeholder if image fails to load
                (e.target as HTMLImageElement).src = '/service.jpg';
              }}
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