import React from 'react';
import { Metadata } from 'next';
import { BlogList } from '@/components/sections/BlogList';

export const metadata: Metadata = {
  title: 'المدونة الطبية | نظام إدارة العيادات',
  description: 'مقالات ونصائح طبية مفيدة من فريقنا من المتخصصين',
  keywords: 'مدونة, مقالات طبية, نصائح صحية, معلومات طبية',
};

export default function BlogPage() {
  return (
    <div className="min-h-screen">
      <BlogList />
    </div>
  );
}
