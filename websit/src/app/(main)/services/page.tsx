import React from 'react';
import { Metadata } from 'next';
import { ServicesHero } from '@/components/sections/ServicesHero';
import { ServicesList } from '@/components/sections/ServicesList';
import { FAQSection } from '@/components/sections/FAQSection';

export const metadata: Metadata = {
  title: 'خدماتنا الطبية | نظام إدارة العيادات',
  description: 'اكتشف خدماتنا الطبية المتطورة من حجز المواعيد إلى الاستشارات الافتراضية',
  keywords: 'خدمات طبية, حجز مواعيد, استشارات طبية, رعاية صحية',
};

export default function ServicesPage() {
  return (
    <div className="min-h-screen">
      <ServicesHero />
      <ServicesList />
      <FAQSection />
    </div>
  );
}
