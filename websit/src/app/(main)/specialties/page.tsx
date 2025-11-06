'use client';

import React from 'react';
import { SpecialtiesList } from '@/components/specialties/SpecialtiesList';
import { motion } from 'framer-motion';

export default function SpecialtiesPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
            <span className="text-gradient-medical">التخصصات</span> الطبية
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            اختر التخصص المناسب لاحتياجاتك الطبية واحصل على أفضل رعاية صحية
          </p>
        </motion.div>
        <SpecialtiesList />
      </div>
    </div>
  );
}
