'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDownIcon, HelpCircleIcon } from 'lucide-react';
import { FAQSection } from '@/components/sections/FAQSection';
import { mockFAQs } from '@/lib/mock-data';

export default function FAQPage() {
  const [openItems, setOpenItems] = useState<number[]>([]);

  const toggleItem = (index: number) => {
    setOpenItems(prev => 
      prev.includes(index) 
        ? prev.filter(i => i !== index)
        : [...prev, index]
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <div className="w-20 h-20 mx-auto mb-6 gradient-medical-light rounded-full flex items-center justify-center">
            <HelpCircleIcon className="w-10 h-10 text-primary-600" />
          </div>
          <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
            <span className="text-gradient-medical">الأسئلة</span> الشائعة
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            إجابات على أكثر الأسئلة شيوعاً حول خدماتنا الطبية
          </p>
        </motion.div>

        <div className="space-y-4">
          {mockFAQs.map((faq, index) => (
            <motion.div
              key={faq.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-xl shadow-sm border-2 border-gray-100 hover:border-primary-200 transition-all"
            >
              <button
                onClick={() => toggleItem(index)}
                className="w-full px-6 py-5 text-right flex items-center justify-between hover:bg-gray-50 transition-colors rounded-xl"
              >
                <h3 className="text-lg font-bold text-gray-900 pr-4">
                  {faq.question}
                </h3>
                <motion.div
                  animate={{ rotate: openItems.includes(index) ? 180 : 0 }}
                  transition={{ duration: 0.2 }}
                  className="flex-shrink-0"
                >
                  <ChevronDownIcon className="w-5 h-5 text-primary-600" />
                </motion.div>
              </button>
              
              <AnimatePresence>
                {openItems.includes(index) && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="overflow-hidden"
                  >
                    <div className="px-6 pb-5 border-t border-gray-100 pt-4">
                      <p className="text-gray-600 leading-relaxed">
                        {faq.answer}
                      </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>

        {/* Contact CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-12 text-center gradient-medical-light p-8 rounded-2xl border-2 border-primary-100"
        >
          <h3 className="text-2xl font-bold text-gray-900 mb-3">
            لم تجد إجابة لسؤالك؟
          </h3>
          <p className="text-gray-600 mb-6">
            تواصل معنا وسنكون سعداء لمساعدتك
          </p>
          <a
            href="/contact"
            className="inline-block px-8 py-3 gradient-medical text-white rounded-xl font-semibold hover:opacity-90 transition-opacity shadow-md"
          >
            تواصل معنا
          </a>
        </motion.div>
      </div>
    </div>
  );
}





