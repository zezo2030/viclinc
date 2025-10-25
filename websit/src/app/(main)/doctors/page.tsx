import React from 'react';
import { Metadata } from 'next';
import { DoctorsHero } from '@/components/sections/DoctorsHero';
import { DoctorsList } from '@/components/sections/DoctorsList';

export const metadata: Metadata = {
  title: 'الأطباء المتخصصين | نظام إدارة العيادات',
  description: 'تعرف على فريقنا من الأطباء المتخصصين ذوي الخبرة العالية والكفاءة المهنية',
  keywords: 'أطباء, تخصصات طبية, استشارات طبية, رعاية صحية',
};

export default function DoctorsPage() {
  return (
    <div className="min-h-screen">
      <DoctorsHero />
      <DoctorsList />
    </div>
  );
}
