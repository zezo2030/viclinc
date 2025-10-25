'use client';

import React from 'react';
import { Card } from '@/components/ui/Card';
import { Star } from 'lucide-react';
import { Rating } from '@/types';
import { doctorsService } from '@/lib/api/doctors';

interface RatingSummaryProps {
  ratings: Rating[];
}

export const RatingSummary: React.FC<RatingSummaryProps> = ({ ratings }) => {
  const averageRating = ratings.length > 0 
    ? ratings.reduce((sum, rating) => sum + rating.rating, 0) / ratings.length 
    : 0;
  
  const distribution = doctorsService.getRatingDistribution(ratings);
  const totalRatings = ratings.length;

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, index) => (
      <Star
        key={index}
        className={`w-4 h-4 ${
          index < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
        }`}
      />
    ));
  };

  return (
    <Card className="p-6">
      <h2 className="text-xl font-bold text-gray-900 mb-4">تقييم الطبيب</h2>
      
      {/* Average Rating */}
      <div className="text-center mb-6">
        <div className="text-4xl font-bold text-gray-900 mb-2">
          {averageRating.toFixed(1)}
        </div>
        <div className="flex justify-center mb-2">
          {renderStars(Math.round(averageRating))}
        </div>
        <p className="text-gray-600">
          بناءً على {totalRatings} تقييم
        </p>
      </div>

      {/* Rating Distribution */}
      {totalRatings > 0 && (
        <div className="space-y-2">
          {[5, 4, 3, 2, 1].map((stars) => {
            const count = distribution[stars as keyof typeof distribution];
            const percentage = totalRatings > 0 ? (count / totalRatings) * 100 : 0;
            
            return (
              <div key={stars} className="flex items-center gap-2">
                <span className="text-sm w-8">{stars}</span>
                <Star className="w-4 h-4 text-yellow-400 fill-current" />
                <div className="flex-1 bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-yellow-400 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
                <span className="text-sm text-gray-600 w-8">{count}</span>
              </div>
            );
          })}
        </div>
      )}

      {totalRatings === 0 && (
        <div className="text-center text-gray-500 py-4">
          لا توجد تقييمات بعد
        </div>
      )}
    </Card>
  );
};
