import React from 'react';
import { Metadata } from 'next';
import { PricingSection } from '@/components/sections/PricingSection';

export const metadata: Metadata = {
  title: 'خطط الأسعار | نظام إدارة العيادات',
  description: 'اختر الخطة التي تناسب احتياجاتك واحصل على أفضل رعاية صحية',
  keywords: 'أسعار, خطط, رعاية صحية, خدمات طبية',
};

export default function PricingPage() {
  return (
    <div className="min-h-screen">
      <PricingSection />
    </div>
  );
}
