'use client';

import React from 'react';
import { Card } from '@/components/ui/Card';
import { useRouter } from 'next/navigation';
import { getDepartmentImageUrl } from '@/lib/utils/image';
import { ArrowLeft, ChevronLeft } from 'lucide-react';

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
    <div
      className="group relative h-full cursor-pointer"
      onClick={() => router.push(`/specialties/${id}`)}
    >
      {/* Main Card */}
      <div className="relative h-full bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 border border-gray-100">
        {/* Top Colored Section */}
        <div className="relative h-40 bg-gradient-to-br from-primary-500 via-primary-600 to-secondary-500 overflow-hidden">
          {/* Pattern Overlay */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute inset-0" style={{
              backgroundImage: `radial-gradient(circle at 2px 2px, white 1px, transparent 0)`,
              backgroundSize: '24px 24px'
            }}></div>
          </div>
          
          {/* Shine Effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
          
          {/* Icon/Image Container */}
          <div className="relative h-full flex items-center justify-center p-6">
            {hasImage ? (
              <div className="relative w-24 h-24 rounded-2xl bg-white/20 backdrop-blur-sm p-3 shadow-xl group-hover:scale-110 group-hover:rotate-6 transition-all duration-500">
                <div className="w-full h-full rounded-xl bg-white flex items-center justify-center overflow-hidden">
                  <img 
                    src={imageUrl} 
                    alt={name}
                    className="w-full h-full object-contain p-2"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                      const parent = target.parentElement;
                      if (parent) {
                        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
                        svg.setAttribute('class', 'w-12 h-12 text-primary-600');
                        svg.setAttribute('fill', 'none');
                        svg.setAttribute('stroke', 'currentColor');
                        svg.setAttribute('viewBox', '0 0 24 24');
                        const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
                        path.setAttribute('stroke-linecap', 'round');
                        path.setAttribute('stroke-linejoin', 'round');
                        path.setAttribute('stroke-width', '2');
                        path.setAttribute('d', 'M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10');
                        svg.appendChild(path);
                        parent.appendChild(svg);
                      }
                    }}
                  />
                </div>
              </div>
            ) : (
              <div className="w-24 h-24 rounded-2xl bg-white/20 backdrop-blur-sm p-4 shadow-xl group-hover:scale-110 group-hover:rotate-6 transition-all duration-500 flex items-center justify-center">
                <svg className="w-full h-full text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
            )}
          </div>
          
          {/* Bottom Wave */}
          <div className="absolute bottom-0 left-0 right-0">
            <svg className="w-full h-8 text-white" viewBox="0 0 1200 120" preserveAspectRatio="none">
              <path d="M0,0 C300,100 600,0 1200,0 L1200,120 L0,120 Z" fill="white"></path>
            </svg>
          </div>
        </div>

        {/* Content Section */}
        <div className="p-6 pt-8">
          {/* Title */}
          <h3 className="text-xl font-bold text-gray-900 mb-4 group-hover:text-primary-600 transition-colors duration-300 text-center">
            {name}
          </h3>
          
          {/* CTA Button */}
          <div className="flex items-center justify-center gap-2 mt-6 pt-4 border-t border-gray-100">
            <span className="text-sm font-semibold text-gray-600 group-hover:text-primary-600 transition-colors duration-300">
              عرض التفاصيل
            </span>
            <div className="relative w-5 h-5">
              <ChevronLeft className="absolute inset-0 w-5 h-5 text-primary-600 transform group-hover:translate-x-[-4px] transition-transform duration-300" />
              <ChevronLeft className="absolute inset-0 w-5 h-5 text-primary-600 opacity-0 group-hover:opacity-100 transform translate-x-[-4px] transition-all duration-300" />
            </div>
          </div>
        </div>

        {/* Hover Border Effect */}
        <div className="absolute inset-0 rounded-2xl border-2 border-primary-500 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>
      </div>
    </div>
  );
};