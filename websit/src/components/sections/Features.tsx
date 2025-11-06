'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { 
  CalendarCheckIcon, 
  VideoIcon, 
  MessageSquareIcon, 
  ShieldCheckIcon,
  ClockIcon,
  HeartIcon
} from 'lucide-react';
import { Card } from '@/components/ui/Card';

const features = [
  {
    icon: CalendarCheckIcon,
    title: 'حجز مواعيد سهل',
    description: 'احجز موعدك في دقائق معدودة مع أفضل الأطباء في أي وقت ومن أي مكان',
    color: 'primary',
  },
  {
    icon: VideoIcon,
    title: 'استشارات فيديو',
    description: 'احصل على استشارات طبية مباشرة عبر الفيديو مع أطباء معتمدين',
    color: 'secondary',
  },
  {
    icon: MessageSquareIcon,
    title: 'استشارات نصية',
    description: 'تواصل مع الأطباء عبر الدردشة النصية للحصول على استشارات سريعة',
    color: 'primary',
  },
  {
    icon: ShieldCheckIcon,
    title: 'آمن وموثوق',
    description: 'بياناتك محمية بأعلى معايير الأمان والخصوصية',
    color: 'success',
  },
  {
    icon: ClockIcon,
    title: 'متاح 24/7',
    description: 'احجز واستشر في أي وقت، خدمة متاحة على مدار الساعة',
    color: 'secondary',
  },
  {
    icon: HeartIcon,
    title: 'رعاية شاملة',
    description: 'نظام متكامل لإدارة صحتك ومواعيدك الطبية',
    color: 'primary',
  },
];

const colorClasses = {
  primary: 'bg-primary-50 text-primary-600 border-primary-200',
  secondary: 'bg-secondary-50 text-secondary-600 border-secondary-200',
  success: 'bg-success-50 text-success-600 border-success-200',
};

export const Features: React.FC = () => {
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
            لماذا تختارنا؟
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            نوفر لك تجربة طبية متكاملة وسهلة مع أفضل الخدمات والتقنيات
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            const colorClass = colorClasses[feature.color as keyof typeof colorClasses] || colorClasses.primary;
            
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Card className="h-full p-6 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-2 border-2 hover:border-primary-300">
                  <div className={`w-14 h-14 rounded-xl ${colorClass} flex items-center justify-center mb-4`}>
                    <Icon className="w-7 h-7" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    {feature.description}
                  </p>
                </Card>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

