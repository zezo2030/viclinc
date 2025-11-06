'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { ArrowLeftIcon, PlayIcon, CalendarIcon, VideoIcon, MessageSquareIcon } from 'lucide-react';
import { APP_STATS } from '@/lib/constants';
import { motion } from 'framer-motion';

export const Hero: React.FC = () => {
  return (
    <section className="relative gradient-medical-light overflow-hidden py-20 lg:py-32">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-secondary-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-8"
          >
            <div className="space-y-6">
              <div className="inline-block px-4 py-2 bg-white/80 backdrop-blur-sm rounded-full shadow-md">
                <span className="text-sm font-semibold text-gradient-medical">
                  رعاية صحية متطورة
                </span>
              </div>
              
              <h1 className="text-4xl lg:text-6xl font-bold text-gray-900 leading-tight">
                رعاية طبية
                <span className="text-gradient-medical block mt-2">
                  متطورة وذكية
                </span>
              </h1>
              
              <p className="text-xl text-gray-600 leading-relaxed max-w-xl">
                احجز موعدك بسهولة، احصل على استشارات طبية افتراضية، 
                وأدار صحتك بطريقة ذكية مع نظام إدارة العيادات المتطور
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/appointments/new">
                <Button 
                  size="lg" 
                  className="gradient-medical text-white hover:opacity-90 shadow-medical transition-all duration-300 transform hover:scale-105"
                >
                  احجز موعدك الآن
                  <ArrowLeftIcon className="w-5 h-5 mr-2" />
                </Button>
              </Link>
              <Button
                variant="outline"
                size="lg"
                className="border-2 border-primary-500 text-primary-600 hover:bg-primary-50 bg-white"
              >
                <PlayIcon className="w-5 h-5 ml-2" />
                شاهد الفيديو
              </Button>
            </div>

            {/* Quick actions */}
            <div className="grid grid-cols-3 gap-4 pt-4">
              <Link href="/appointments/new?type=IN_PERSON" className="group">
                <div className="bg-white rounded-xl p-4 shadow-md hover:shadow-lg transition-shadow text-center">
                  <CalendarIcon className="w-8 h-8 mx-auto mb-2 text-primary-500 group-hover:text-primary-600" />
                  <div className="text-sm font-semibold text-gray-700">حجز عيادة</div>
                </div>
              </Link>
              <Link href="/appointments/new?type=VIDEO" className="group">
                <div className="bg-white rounded-xl p-4 shadow-md hover:shadow-lg transition-shadow text-center">
                  <VideoIcon className="w-8 h-8 mx-auto mb-2 text-secondary-500 group-hover:text-secondary-600" />
                  <div className="text-sm font-semibold text-gray-700">استشارة فيديو</div>
                </div>
              </Link>
              <Link href="/appointments/new?type=CHAT" className="group">
                <div className="bg-white rounded-xl p-4 shadow-md hover:shadow-lg transition-shadow text-center">
                  <MessageSquareIcon className="w-8 h-8 mx-auto mb-2 text-primary-400 group-hover:text-primary-500" />
                  <div className="text-sm font-semibold text-gray-700">استشارة نصية</div>
                </div>
              </Link>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-8 pt-8 border-t border-gray-200">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-center"
              >
                <div className="text-3xl font-bold text-gradient-medical">{APP_STATS.doctors}+</div>
                <div className="text-sm text-gray-600 mt-1">طبيب متخصص</div>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-center"
              >
                <div className="text-3xl font-bold text-gradient-medical">{APP_STATS.patients.toLocaleString()}+</div>
                <div className="text-sm text-gray-600 mt-1">مريض راضٍ</div>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="text-center"
              >
                <div className="text-3xl font-bold text-gradient-medical">{APP_STATS.specialties}+</div>
                <div className="text-sm text-gray-600 mt-1">تخصص طبي</div>
              </motion.div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="relative"
          >
            <div className="relative rounded-3xl overflow-hidden shadow-2xl">
              <div className="w-full h-96 lg:h-[500px] relative">
                <Image
                  src="/primary.jpg"
                  alt="رعاية طبية متطورة"
                  fill
                  className="object-cover"
                  priority
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
              </div>
            </div>
            {/* Decorative elements */}
            <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-primary-200 rounded-full opacity-20 blur-2xl"></div>
            <div className="absolute -top-6 -left-6 w-40 h-40 bg-secondary-200 rounded-full opacity-20 blur-2xl"></div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};
