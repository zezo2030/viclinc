'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Star, X, CheckCircle } from 'lucide-react';
import { ratingService } from '@/lib/api/ratings';

interface RatingModalProps {
  consultationId: number;
  doctorId: number;
  isOpen: boolean;
  onClose: () => void;
}

export const RatingModal: React.FC<RatingModalProps> = ({
  consultationId,
  doctorId,
  isOpen,
  onClose,
}) => {
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [review, setReview] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async () => {
    if (rating === 0) {
      alert('يرجى اختيار تقييم');
      return;
    }

    try {
      setIsSubmitting(true);
      
      await ratingService.createRating({
        appointmentId: consultationId,
        doctorId,
        rating,
        review: review.trim() || undefined,
      });

      setIsSubmitted(true);
      
      // إغلاق النافذة بعد ثانيتين
      setTimeout(() => {
        onClose();
        setIsSubmitted(false);
        setRating(0);
        setReview('');
      }, 2000);

    } catch (error) {
      console.error('Error submitting rating:', error);
      alert('حدث خطأ في إرسال التقييم');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <Card className="w-full max-w-md mx-4">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">
              تقييم الاستشارة
            </h2>
            <Button
              onClick={handleClose}
              variant="ghost"
              size="sm"
              disabled={isSubmitting}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>

          {isSubmitted ? (
            /* رسالة النجاح */
            <div className="text-center py-8">
              <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                شكراً لك!
              </h3>
              <p className="text-gray-600">
                تم إرسال تقييمك بنجاح
              </p>
            </div>
          ) : (
            /* نموذج التقييم */
            <div className="space-y-6">
              {/* التقييم بالنجوم */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  كيف تقيم هذه الاستشارة؟
                </label>
                <div className="flex space-x-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      onMouseEnter={() => setHoveredRating(star)}
                      onMouseLeave={() => setHoveredRating(0)}
                      className="focus:outline-none"
                    >
                      <Star
                        className={`w-8 h-8 ${
                          star <= (hoveredRating || rating)
                            ? 'text-yellow-400 fill-current'
                            : 'text-gray-300'
                        }`}
                      />
                    </button>
                  ))}
                </div>
                <div className="mt-2 text-sm text-gray-600">
                  {rating === 0 && 'اختر تقييماً'}
                  {rating === 1 && 'سيء جداً'}
                  {rating === 2 && 'سيء'}
                  {rating === 3 && 'متوسط'}
                  {rating === 4 && 'جيد'}
                  {rating === 5 && 'ممتاز'}
                </div>
              </div>

              {/* التعليق */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  تعليق (اختياري)
                </label>
                <textarea
                  value={review}
                  onChange={(e) => setReview(e.target.value)}
                  placeholder="شاركنا تجربتك مع هذه الاستشارة..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                  rows={4}
                  maxLength={500}
                />
                <div className="mt-1 text-xs text-gray-500">
                  {review.length}/500 حرف
                </div>
              </div>

              {/* أزرار الإجراءات */}
              <div className="flex space-x-3 pt-4">
                <Button
                  onClick={handleClose}
                  variant="outline"
                  className="flex-1"
                  disabled={isSubmitting}
                >
                  إلغاء
                </Button>
                <Button
                  onClick={handleSubmit}
                  className="flex-1 bg-primary-600 hover:bg-primary-700 text-white"
                  disabled={isSubmitting || rating === 0}
                >
                  {isSubmitting ? (
                    <div className="flex items-center space-x-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>جاري الإرسال...</span>
                    </div>
                  ) : (
                    'إرسال التقييم'
                  )}
                </Button>
              </div>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};
