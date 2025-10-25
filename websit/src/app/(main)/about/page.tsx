import React from 'react';
import { Metadata } from 'next';
import { AboutHero } from '@/components/sections/AboutHero';

export const metadata: Metadata = {
  title: 'من نحن | نظام إدارة العيادات',
  description: 'تعرف على رؤيتنا ورسالتنا وفريقنا من المتخصصين في مجال الرعاية الصحية والتكنولوجيا',
  keywords: 'من نحن, رؤية, رسالة, فريق العمل, رعاية صحية',
};

export default function AboutPage() {
  return (
    <div className="min-h-screen">
      <AboutHero />
    </div>
  );
}
