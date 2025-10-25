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
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <span className="bg-primary-500 text-white px-4 py-1 rounded-full text-sm font-medium">
                    الأكثر شعبية
                  </span>
                </div>
              )}
              
              <div className="text-center">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  {tier.name}
                </h3>
                
                <div className="mb-6">
                  <span className="text-4xl font-bold text-primary-600">
                    {tier.price === 0 ? 'مجاني' : `${tier.price} ريال`}
                  </span>
                  <span className="text-gray-600 ml-2">
                    {tier.period}
                  </span>
                </div>
                
                <p className="text-gray-600 mb-8">
                  {tier.description}
                </p>
                
                <ul className="space-y-4 mb-8 text-right">
                  {tier.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-center">
                      <CheckIcon className="w-5 h-5 text-green-500 ml-3 flex-shrink-0" />
                      <span className="text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>
                
                <Button 
                  className={`w-full ${
                    tier.isPopular 
                      ? 'bg-primary-600 text-white hover:bg-primary-700' 
                      : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                  }`}
                >
                  {tier.price === 0 ? 'ابدأ مجاناً' : 'اختر هذه الخطة'}
                </Button>
              </div>
            </AnimatedCard>
          ))}
        </div>

        <div className="mt-16 text-center">
          <p className="text-gray-600 mb-4">
            هل تحتاج إلى خطة مخصصة؟
          </p>
          <Button variant="outline" size="lg">
            تواصل معنا للحصول على عرض سعر
          </Button>
        </div>
      </div>
    </section>
  );
};
