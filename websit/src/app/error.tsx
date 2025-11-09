'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/Button';
import { HomeIcon, RefreshCwIcon, AlertCircleIcon } from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 flex items-center justify-center bg-gradient-to-br from-gray-50 to-white py-20">
        <div className="text-center px-4 max-w-2xl">
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="mb-8"
          >
            <div className="w-24 h-24 mx-auto mb-6 bg-error-100 rounded-full flex items-center justify-center">
              <AlertCircleIcon className="w-12 h-12 text-error-600" />
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-4">حدث خطأ</h1>
            <p className="text-xl text-gray-600 mb-2">
              عذراً، حدث خطأ غير متوقع
            </p>
            {error.message && (
              <p className="text-sm text-gray-500 mb-8 mt-4 p-4 bg-gray-100 rounded-lg">
                {error.message}
              </p>
            )}
          </motion.div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              onClick={reset}
              className="gradient-medical text-white hover:opacity-90 shadow-md"
            >
              <RefreshCwIcon className="w-5 h-5 ml-2" />
              إعادة المحاولة
            </Button>
            <Link href="/">
              <Button
                size="lg"
                variant="outline"
                className="border-2 border-primary-500 text-primary-600 hover:bg-primary-50"
              >
                <HomeIcon className="w-5 h-5 ml-2" />
                العودة للرئيسية
              </Button>
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}



