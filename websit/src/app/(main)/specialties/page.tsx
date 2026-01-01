'use client';

import React from 'react';
import { SpecialtiesList } from '@/components/specialties/SpecialtiesList';
import { motion } from 'framer-motion';
import { Search, Sparkles } from 'lucide-react';

export default function SpecialtiesPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-primary-50/30 to-secondary-50/30">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-r from-primary-600 via-primary-500 to-secondary-600 py-20">
        <div className="absolute inset-0 bg-grid-pattern opacity-10"></div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-white/10 rounded-full blur-3xl"></div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full mb-6"
            >
              <Sparkles className="w-5 h-5 text-white" />
              <span className="text-white font-semibold">تخصصات طبية متقدمة</span>
            </motion.div>
            
            <h1 className="text-5xl lg:text-7xl font-extrabold text-white mb-6 leading-tight">
              <span className="block">التخصصات</span>
              <span className="block bg-gradient-to-r from-white to-yellow-200 bg-clip-text text-transparent">
                الطبية
              </span>
            </h1>
            
            <p className="text-xl lg:text-2xl text-white/90 max-w-3xl mx-auto mb-8 leading-relaxed">
              اختر التخصص المناسب لاحتياجاتك الطبية واحصل على أفضل رعاية صحية من فريقنا المتميز
            </p>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="flex items-center justify-center gap-4 text-white/80"
            >
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span className="font-medium">أطباء معتمدون</span>
              </div>
              <div className="w-1 h-6 bg-white/30"></div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
                <span className="font-medium">خدمات متطورة</span>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* Content Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <SpecialtiesList />
      </div>
    </div>
  );
}
