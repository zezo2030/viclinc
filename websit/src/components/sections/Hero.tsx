import React from 'react';
import { Button } from '@/components/ui/Button';
import { ArrowRightIcon, PlayIcon } from 'lucide-react';
import { APP_STATS } from '@/lib/constants';

export const Hero: React.FC = () => {
  return (
    <section className="relative bg-gradient-to-br from-primary-50 to-secondary-50 py-20 lg:py-32">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8">
            <div className="space-y-4">
              <h1 className="text-4xl lg:text-6xl font-bold text-gray-900 leading-tight">
                رعاية طبية
                <span className="text-primary-600 block">
                  متطورة وذكية
                </span>
              </h1>
              <p className="text-xl text-gray-600 leading-relaxed">
                احجز موعدك بسهولة، احصل على استشارات طبية افتراضية، 
                وأدار صحتك بطريقة ذكية مع نظام إدارة العيادات المتطور
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <Button size="lg" className="bg-primary-600 text-white hover:bg-primary-700">
                احجز موعدك الآن
                <ArrowRightIcon className="w-5 h-5 ml-2" />
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="border-primary-600 text-primary-600 hover:bg-primary-50"
              >
                <PlayIcon className="w-5 h-5 mr-2" />
                شاهد الفيديو
              </Button>
            </div>

            <div className="grid grid-cols-3 gap-8 pt-8">
              <div className="text-center">
                <div className="text-3xl font-bold text-primary-600">{APP_STATS.doctors}+</div>
                <div className="text-sm text-gray-600">طبيب متخصص</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-primary-600">{APP_STATS.patients.toLocaleString()}+</div>
                <div className="text-sm text-gray-600">مريض راضٍ</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-primary-600">{APP_STATS.specialties}+</div>
                <div className="text-sm text-gray-600">تخصص طبي</div>
              </div>
            </div>
          </div>

          <div className="relative">
            <div className="relative rounded-2xl overflow-hidden shadow-2xl">
              <div className="w-full h-96 bg-gradient-to-br from-primary-100 to-secondary-100 flex items-center justify-center">
                <div className="text-center">
                  <div className="w-24 h-24 bg-primary-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <PlayIcon className="w-12 h-12 text-white" />
                  </div>
                  <p className="text-gray-600">صورة لوحة التحكم</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
