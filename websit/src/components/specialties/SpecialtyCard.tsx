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
  const hasImage = !!(logoUrl || icon);

  return (
    <Card 
      className="p-6 hover:shadow-xl transition-all duration-300 cursor-pointer group bg-white border-2 border-gray-100 hover:border-primary-300 transform hover:-translate-y-2"
      onClick={() => router.push(`/specialties/${id}`)}
    >
      <div className="flex flex-col items-center text-center space-y-4">
        {hasImage ? (
          <div className="w-24 h-24 group-hover:scale-110 transition-transform rounded-2xl gradient-medical-light flex items-center justify-center overflow-hidden border-4 border-white shadow-lg">
            <img 
              src={imageUrl} 
              alt={name}
              className="w-full h-full object-cover"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
                const parent = target.parentElement;
                if (parent) {
                  parent.innerHTML = `
                    <svg class="w-12 h-12 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                    </svg>
                  `;
                }
              }}
            />
          </div>
        ) : (
          <div className="w-24 h-24 group-hover:scale-110 transition-transform rounded-2xl gradient-medical-light flex items-center justify-center border-4 border-white shadow-lg">
            <svg className="w-12 h-12 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
          </div>
        )}
        <h3 className="text-lg font-bold text-gray-900 group-hover:text-primary-600 transition-colors">
          {name}
        </h3>
      </div>
    </Card>
  );
};