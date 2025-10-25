import React from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { AnimatedCard } from '@/components/animations/AnimatedCard';
import { 
  CalendarDaysIcon, 
  CameraIcon, 
  MessageCircleIcon,
  FileTextIcon,
  ClockIcon,
  ShieldCheckIcon,
  ArrowRightIcon
} from 'lucide-react';
import { mockServices } from '@/lib/mock-data';

const iconMap = {
  CalendarDaysIcon,
  VideoCameraIcon: CameraIcon,
  ChatBubbleLeftRightIcon: MessageCircleIcon,
  DocumentTextIcon: FileTextIcon,
  ClockIcon,
  ShieldCheckIcon,
};

export const ServicesList: React.FC = () => {
  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
            خدماتنا الطبية المتطورة
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            نقدم مجموعة شاملة من الخدمات الطبية الرقمية لضمان حصولك على أفضل رعاية صحية
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {mockServices.map((service, index) => {
            const IconComponent = iconMap[service.icon as keyof typeof iconMap];
            
            return (
              <AnimatedCard 
                key={service.id} 
                delay={index * 0.1}
                className={`p-8 hover:shadow-lg transition-all duration-300 ${
                  service.isPopular ? 'ring-2 ring-primary-500 shadow-xl' : ''
                }`}
              >
                {service.isPopular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <span className="bg-primary-500 text-white px-4 py-1 rounded-full text-sm font-medium">
                      الأكثر شعبية
                    </span>
                  </div>
                )}
                
                <div className="text-center">
                  <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <IconComponent className="w-8 h-8 text-primary-600" />
                  </div>
                  
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">
                    {service.name}
                  </h3>
                  
                  <p className="text-gray-600 mb-6">
                    {service.description}
                  </p>
                  
                  <ul className="space-y-2 text-sm text-gray-500 mb-6">
                    {service.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-center">
                        <svg className="w-4 h-4 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        {feature}
                      </li>
                    ))}
                  </ul>
                  
                  <div className="mb-6">
                    <span className="text-2xl font-bold text-primary-600">
                      {service.price === 0 ? 'مجاني' : `من ${service.price} ريال`}
                    </span>
                  </div>
                  
                  <Button className="w-full">
                    تعرف على المزيد
                    <ArrowRightIcon className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </AnimatedCard>
            );
          })}
        </div>
      </div>
    </section>
  );
};
