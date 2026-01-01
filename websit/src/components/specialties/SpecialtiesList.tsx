'use client';

import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { specialtyService } from '@/lib/api/specialties';
import { SpecialtyCard } from './SpecialtyCard';
import { Search, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const SpecialtiesList: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');

  // الحصول على التخصصات من API
  const { data: specialties, isLoading, error } = useQuery({
    queryKey: ['specialties'],
    queryFn: () => specialtyService.getSpecialties(),
    staleTime: 5 * 60 * 1000, // 5 دقائق
  });

  // فلترة التخصصات حسب البحث
  const filteredSpecialties = useMemo(() => {
    if (!specialties) return [];
    if (!searchQuery.trim()) return specialties;
    
    return specialties.filter(specialty =>
      specialty.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [specialties, searchQuery]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-primary-200 border-t-primary-600 mx-auto mb-4"></div>
            <div className="absolute inset-0 rounded-full bg-gradient-to-r from-primary-400/20 to-secondary-400/20 animate-pulse"></div>
          </div>
          <p className="text-gray-600 text-lg font-medium">جاري تحميل التخصصات...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center py-20"
      >
        <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-8 max-w-md mx-auto">
          <p className="text-red-600 mb-4 text-lg font-semibold">حدث خطأ في تحميل التخصصات</p>
          <button 
            onClick={() => window.location.reload()}
            className="px-6 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors font-medium shadow-md"
          >
            إعادة المحاولة
          </button>
        </div>
      </motion.div>
    );
  }

  if (!specialties || specialties.length === 0) {
    return (
      <div className="text-center py-20">
        <div className="bg-gray-50 rounded-2xl p-12 max-w-md mx-auto">
          <p className="text-gray-600 text-lg mb-2">لا توجد تخصصات متاحة حالياً</p>
          <p className="text-gray-500 text-sm">سيتم إضافة التخصصات قريباً</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Search Bar */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="relative max-w-2xl mx-auto"
      >
        <div className="relative">
          <Search className="absolute right-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="ابحث عن تخصص..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pr-12 pl-4 py-4 bg-white border-2 border-gray-200 rounded-2xl focus:border-primary-500 focus:ring-4 focus:ring-primary-100 transition-all text-lg shadow-lg"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute left-4 top-1/2 transform -translate-y-1/2 p-1 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="w-4 h-4 text-gray-400" />
            </button>
          )}
        </div>
        {searchQuery && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center mt-4 text-gray-600"
          >
            تم العثور على {filteredSpecialties.length} تخصص
          </motion.p>
        )}
      </motion.div>

      {/* Specialties Grid */}
      <AnimatePresence mode="wait">
        {filteredSpecialties.length > 0 ? (
          <motion.div
            key="specialties-grid"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 lg:gap-8"
          >
            {filteredSpecialties.map((specialty, index) => (
              <motion.div
                key={specialty._id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <SpecialtyCard
                  id={specialty._id}
                  name={specialty.name}
                  icon={specialty.icon}
                  logoUrl={specialty.logoUrl}
                />
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <motion.div
            key="no-results"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="text-center py-20"
          >
            <div className="bg-gray-50 rounded-2xl p-12 max-w-md mx-auto border-2 border-dashed border-gray-200">
              <Search className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-600 text-lg font-semibold mb-2">لم يتم العثور على نتائج</p>
              <p className="text-gray-500 text-sm">جرب البحث بكلمات مختلفة</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
