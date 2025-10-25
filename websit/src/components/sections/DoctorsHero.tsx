import React from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/Button';
import { ArrowRightIcon, StarIcon } from 'lucide-react';

export const DoctorsHero: React.FC = () => {
  const stats = [
    { number: '500+', label: 'طبيب متخصص' },
    { number: '15+', label: 'تخصص طبي' },
    { number: '4.9', label: 'تقييم المرضى' },
  ];

  return (
    <section className="bg-gradient-to-br from-primary-50 to-secondary-50 py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8">
            <div className="space-y-4">
              <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 leading-tight">
                أفضل الأطباء
                <span className="text-primary-600 block">
                  المتخصصين في المملكة
                </span>
              </h1>
              <p className="text-xl text-gray-600 leading-relaxed">
                فريق من الأطباء المتخصصين ذوي الخبرة العالية والكفاءة المهنية 
                لضمان حصولك على أفضل رعاية صحية ممكنة.
              </p>
            </div>

            <div className="grid grid-cols-3 gap-8">
              {stats.map((stat, index) => (
                <div key={index} className="text-center">
                  <div className="text-3xl font-bold text-primary-600 mb-2">
                    {stat.number}
                  </div>
                  <div className="text-sm text-gray-600">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <Button size="lg" className="bg-primary-600 text-white hover:bg-primary-700">
                ابحث عن طبيب
                <ArrowRightIcon className="w-5 h-5 ml-2" />
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="border-primary-600 text-primary-600 hover:bg-primary-50"
              >
                <StarIcon className="w-5 h-5 mr-2" />
                الأطباء المميزين
              </Button>
            </div>
          </div>

          <div className="relative">
            <div className="relative rounded-2xl overflow-hidden shadow-2xl">
              <div className="w-full h-96 relative">
                <Image
                  src="/doctor.jpg"
                  alt="الأطباء المتخصصين - MedFlow"
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
