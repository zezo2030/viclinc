'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/Button';
import { HomeIcon, ArrowLeftIcon } from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 flex items-center justify-center bg-gradient-to-br from-gray-50 to-white py-20">
        <div className="text-center px-4">
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="mb-8"
          >
            <h1 className="text-9xl font-bold text-gradient-medical mb-4">404</h1>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">الصفحة غير موجودة</h2>
            <p className="text-xl text-gray-600 max-w-md mx-auto mb-8">
              عذراً، الصفحة التي تبحث عنها غير موجودة أو تم نقلها.
            </p>
          </motion.div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/">
              <Button size="lg" className="gradient-medical text-white hover:opacity-90 shadow-md">
                <HomeIcon className="w-5 h-5 ml-2" />
                العودة للرئيسية
              </Button>
            </Link>
            <Button
              size="lg"
              variant="outline"
              className="border-2 border-primary-500 text-primary-600 hover:bg-primary-50"
              onClick={() => window.history.back()}
            >
              <ArrowLeftIcon className="w-5 h-5 ml-2" />
              العودة للخلف
            </Button>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

