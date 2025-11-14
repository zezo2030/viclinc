'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { 
  SearchIcon, 
  CalendarIcon, 
  CheckCircleIcon,
  ArrowLeftIcon
} from 'lucide-react';

const steps = [
  {
    number: '01',
    icon: SearchIcon,
    title: 'اختر الطبيب',
    description: 'تصفح قائمة الأطباء المتخصصين واختر الطبيب المناسب لك',
    color: 'primary',
  },
  {
    number: '02',
    icon: CalendarIcon,
    title: 'احجز الموعد',
    description: 'اختر الوقت المناسب لك من الأوقات المتاحة',
    color: 'secondary',
  },
  {
    number: '03',
    icon: CheckCircleIcon,
    title: 'احصل على الرعاية',
    description: 'احضر الموعد أو احصل على الاستشارة عبر الإنترنت',
    color: 'success',
  },
];

export const HowItWorks: React.FC = () => {
  return (
    <section className="py-20 lg:py-32 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
            كيف يعمل النظام؟
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            خطوات بسيطة للحصول على أفضل رعاية طبية
          </p>
        </motion.div>

        <div className="relative">
          {/* Connection line for desktop */}
          <div className="hidden lg:block absolute top-24 left-0 right-0 h-0.5 bg-gradient-to-r from-primary-300 via-secondary-300 to-success-300"></div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12">
            {steps.map((step, index) => {
              const Icon = step.icon;
              const isLast = index === steps.length - 1;
              
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.2 }}
                  className="relative"
                >
                  <div className="text-center">
                    {/* Step number badge */}
                    <div className="inline-flex items-center justify-center w-20 h-20 rounded-full gradient-medical text-white text-2xl font-bold mb-6 relative z-10 shadow-lg">
                      {step.number}
                    </div>

                    {/* Icon card */}
                    <div className={`inline-flex items-center justify-center w-24 h-24 rounded-2xl bg-${step.color}-50 border-2 border-${step.color}-200 mb-6`}>
                      <Icon className={`w-12 h-12 text-${step.color}-600`} />
                    </div>

                    <h3 className="text-2xl font-bold text-gray-900 mb-3">
                      {step.title}
                    </h3>
                    <p className="text-gray-600 leading-relaxed max-w-xs mx-auto">
                      {step.description}
                    </p>
                  </div>

                  {/* Arrow for mobile */}
                  {!isLast && (
                    <div className="lg:hidden flex justify-center my-8">
                      <ArrowLeftIcon className="w-6 h-6 text-gray-400 rotate-90" />
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.6 }}
          className="text-center mt-12"
        >
          <Link href="/appointments/new">
            <button className="px-8 py-3 gradient-medical text-white rounded-xl font-semibold hover:opacity-90 transition-opacity shadow-md inline-flex items-center gap-2">
              ابدأ الآن
              <ArrowLeftIcon className="w-5 h-5" />
            </button>
          </Link>
        </motion.div>
      </div>
    </section>
  );
};





