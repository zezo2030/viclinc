import React from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/Button';
import { ArrowRightIcon, UsersIcon, AwardIcon, HeartIcon } from 'lucide-react';

export const AboutHero: React.FC = () => {
  const stats = [
    { icon: UsersIcon, number: '10,000+', label: 'مريض راضٍ' },
    { icon: AwardIcon, number: '500+', label: 'طبيب متخصص' },
    { icon: HeartIcon, number: '50+', label: 'عيادة شريكة' },
  ];

  return (
    <section className="bg-gradient-to-br from-primary-50 to-secondary-50 py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8">
            <div className="space-y-4">
              <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 leading-tight">
                من نحن
                <span className="text-primary-600 block">
                  رؤيتنا ورسالتنا
                </span>
              </h1>
              <p className="text-xl text-gray-600 leading-relaxed">
                نحن فريق من المتخصصين في مجال الرعاية الصحية والتكنولوجيا، 
                نعمل على تطوير حلول طبية متطورة لتحسين جودة الرعاية الصحية 
                وتسهيل الوصول للخدمات الطبية في المملكة العربية السعودية.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
              {stats.map((stat, index) => (
                <div key={index} className="text-center">
                  <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <stat.icon className="w-8 h-8 text-primary-600" />
                  </div>
                  <div className="text-2xl font-bold text-primary-600 mb-2">
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
                تعرف على فريقنا
                <ArrowRightIcon className="w-5 h-5 ml-2" />
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="border-primary-600 text-primary-600 hover:bg-primary-50"
              >
                انضم إلينا
              </Button>
            </div>
          </div>

          <div className="relative">
            <div className="relative rounded-2xl overflow-hidden shadow-2xl">
              <div className="w-full h-96 relative">
                <Image
                  src="/who.jpg"
                  alt="فريق العمل - MedFlow"
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
