'use client';

import React, { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Star, User } from 'lucide-react';
import { Rating } from '@/types';

interface RatingsListProps {
  ratings: Rating[];
}

export const RatingsList: React.FC<RatingsListProps> = ({ ratings }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const ratingsPerPage = 5;
  
  const totalPages = Math.ceil(ratings.length / ratingsPerPage);
  const startIndex = (currentPage - 1) * ratingsPerPage;
  const endIndex = startIndex + ratingsPerPage;
  const currentRatings = ratings.slice(startIndex, endIndex);

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

  const formatDate = (date: Date) => {
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return 'منذ يوم';
    if (diffDays < 7) return `منذ ${diffDays} أيام`;
    if (diffDays < 30) return `منذ ${Math.ceil(diffDays / 7)} أسبوع`;
    if (diffDays < 365) return `منذ ${Math.ceil(diffDays / 30)} شهر`;
    return `منذ ${Math.ceil(diffDays / 365)} سنة`;
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  if (ratings.length === 0) {
    return (
      <Card className="p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">تقييمات المرضى</h2>
        <div className="text-center text-gray-500 py-8">
          لا توجد تقييمات بعد
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <h2 className="text-xl font-bold text-gray-900 mb-4">تقييمات المرضى</h2>
      
      <div className="space-y-4">
        {currentRatings.map((rating) => (
          <div key={rating.id} className="border-b border-gray-200 pb-4 last:border-b-0">
            <div className="flex items-start gap-3">
              {/* Patient Avatar */}
              <div className="flex-shrink-0">
                {rating.patient?.profile.avatar ? (
                  <img 
                    src={rating.patient.profile.avatar} 
                    alt={`${rating.patient.profile.firstName} ${rating.patient.profile.lastName}`}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                    <User className="w-5 h-5 text-gray-400" />
                  </div>
                )}
              </div>

              {/* Rating Content */}
              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <h4 className="font-medium text-gray-900">
                      {rating.patient?.profile.firstName} {rating.patient?.profile.lastName}
                    </h4>
                    <div className="flex items-center gap-1">
                      {renderStars(rating.rating)}
                    </div>
                  </div>
                  <span className="text-sm text-gray-500">
                    {formatDate(rating.createdAt)}
                  </span>
                </div>
                
                {rating.comment && (
                  <p className="text-gray-700 text-sm leading-relaxed">
                    {rating.comment}
                  </p>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-6">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
          >
            السابق
          </Button>
          
          <div className="flex items-center gap-1">
            {Array.from({ length: totalPages }, (_, index) => (
              <Button
                key={index + 1}
                variant={currentPage === index + 1 ? "default" : "outline"}
                size="sm"
                onClick={() => handlePageChange(index + 1)}
                className="w-8 h-8 p-0"
              >
                {index + 1}
              </Button>
            ))}
          </div>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            التالي
          </Button>
        </div>
      )}
    </Card>
  );
};
