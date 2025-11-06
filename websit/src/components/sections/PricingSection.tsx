import React from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { AnimatedCard } from '@/components/animations/AnimatedCard';
import { CheckIcon, XIcon } from 'lucide-react';
import { mockPricingTiers } from '@/lib/mock-data';

export const PricingSection: React.FC = () => {
  return (
    <section className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
            خطط الأسعار
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            اختر الخطة التي تناسب احتياجاتك واحصل على أفضل رعاية صحية
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {mockPricingTiers.map((tier, index) => (
            <AnimatedCard 
              key={tier.id} 
              delay={index * 0.1}
              className={`p-8 hover:shadow-lg transition-all duration-300 ${
                tier.isPopular ? 'ring-2 ring-primary-500 shadow-xl scale-105' : ''
              }`}
            >
              {tier.isPopular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-10">
                  <span className="gradient-medical text-white px-5 py-1.5 rounded-full text-sm font-bold shadow-md">
                    الأكثر شعبية
                  </span>
                </div>
              )}
              
              <div className="text-center">
                <h3 className="text-2xl font-bold text-gray-900 mb-3">
                  {tier.name}
                </h3>
                
                <div className="mb-6">
                  <span className="text-5xl font-bold text-gradient-medical">
                    {tier.price === 0 ? 'مجاني' : `${tier.price}`}
                  </span>
                  {tier.price > 0 && (
                    <span className="text-2xl text-gray-600 mr-2">ريال</span>
                  )}
                  <div className="text-gray-600 mt-2">
                    {tier.period}
                  </div>
                </div>
                
                <p className="text-gray-600 mb-8 leading-relaxed">
                  {tier.description}
                </p>
                
                <ul className="space-y-3 mb-8 text-right">
                  {tier.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-start gap-3">
                      <div className="w-5 h-5 rounded-full bg-success-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <CheckIcon className="w-3.5 h-3.5 text-success-600" />
                      </div>
                      <span className="text-gray-700 text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
                
                <Button 
                  className={`w-full ${
                    tier.isPopular 
                      ? 'gradient-medical text-white hover:opacity-90 shadow-md' 
                      : 'border-2 border-primary-500 text-primary-600 hover:bg-primary-50'
                  }`}
                >
                  {tier.price === 0 ? 'ابدأ مجاناً' : 'اختر هذه الخطة'}
                </Button>
              </div>
            </AnimatedCard>
          ))}
        </div>

        <div className="mt-16 text-center gradient-medical-light p-8 rounded-2xl border-2 border-primary-100">
          <p className="text-gray-700 font-semibold mb-4 text-lg">
            هل تحتاج إلى خطة مخصصة؟
          </p>
          <Button variant="outline" size="lg" className="border-2 border-primary-500 text-primary-600 hover:bg-white">
            تواصل معنا للحصول على عرض سعر
          </Button>
        </div>
      </div>
    </section>
  );
};
