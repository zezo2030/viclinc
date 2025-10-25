import React from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/Button';
import { ArrowRightIcon, CheckCircleIcon } from 'lucide-react';

export const ServicesHero: React.FC = () => {
  const features = [
    'حجز مواعيد فوري',
    'استشارات فيديو عالية الجودة',
    'ملف طبي آمن ومشفر',
    'دعم فني 24/7',
    'تكامل مع الأنظمة الطبية',
    'تقارير صحية مفصلة',
  ];

  return (
    <section className="bg-gradient-to-br from-primary-50 to-secondary-50 py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8">
            <div className="space-y-4">
              <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 leading-tight">
                خدمات طبية
                <span className="text-primary-600 block">
                  متطورة وموثوقة
                </span>
              </h1>
              <p className="text-xl text-gray-600 leading-relaxed">
                نقدم مجموعة شاملة من الخدمات الطبية الرقمية المصممة 
                لتحسين تجربة الرعاية الصحية وتسهيل الوصول للخدمات الطبية.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {features.map((feature, index) => (
                <div key={index} className="flex items-center space-x-3 space-x-reverse">
                  <CheckCircleIcon className="w-5 h-5 text-green-500 flex-shrink-0" />
                  <span className="text-gray-700">{feature}</span>
                </div>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <Button size="lg" className="bg-primary-600 text-white hover:bg-primary-700">
                استكشف الخدمات
                <ArrowRightIcon className="w-5 h-5 ml-2" />
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="border-primary-600 text-primary-600 hover:bg-primary-50"
              >
                احجز استشارة مجانية
              </Button>
            </div>
          </div>

          <div className="relative">
            <div className="relative rounded-2xl overflow-hidden shadow-2xl">
              <div className="w-full h-96 relative">
                <Image
                  src="/service.jpg"
                  alt="الخدمات الطبية - MedFlow"
                  fill
                  className="object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
