import type { Metadata } from 'next';
import { createMetadata } from '@/lib/metadata';

export const homepageMetadata: Metadata = createMetadata({
  title: 'الرئيسية',
  description: 'احجز موعدك الطبي بسهولة مع أفضل الأطباء والمتخصصين في المملكة العربية السعودية',
  keywords: ['حجز موعد', 'طبيب اون لاين', 'استشارة طبية', 'رعاية صحية'],
});

export const appointmentsMetadata: Metadata = createMetadata({
  title: 'المواعيد',
  description: 'إدارة وتتبع مواعيدك الطبية بسهولة',
});

export const doctorsMetadata: Metadata = createMetadata({
  title: 'الأطباء',
  description: 'تصفح قائمة أفضل الأطباء والمتخصصين المسجلين لدينا',
  keywords: ['قائمة أطباء', 'أطباء متخصصون', 'افضل الاطباء'],
});

export const departmentsMetadata: Metadata = createMetadata({
  title: 'التخصصات',
  description: 'استكشف جميع التخصصات الطبية المتاحة في عيادتنا',
});

export const servicesMetadata: Metadata = createMetadata({
  title: 'الخدمات',
  description: 'تعرف على جميع الخدمات الطبية التي نقدمها',
});

export const aboutMetadata: Metadata = createMetadata({
  title: 'من نحن',
  description: 'تعرف على رؤيتنا ورسالتنا وفريقنا',
});

export const contactMetadata: Metadata = createMetadata({
  title: 'اتصل بنا',
  description: 'تواصل معنا لأي استفسارات أو طلبات',
});

export const blogMetadata: Metadata = createMetadata({
  title: 'المدونة',
  description: 'نصائح وخبرات طبية موثوقة لحياة صحية أفضل',
  keywords: ['مقالات طبية', 'نصائح صحية', 'صحة وعافية'],
});

export const faqMetadata: Metadata = createMetadata({
  title: 'الأسئلة الشائعة',
  description: 'إجابات على أكثر الأسئلة شيوعاً حول خدماتنا',
});

export const pricingMetadata: Metadata = createMetadata({
  title: 'الأسعار',
  description: 'اطلع على خطط الأسعار والعروض المتاحة',
});

export const profileMetadata: Metadata = createMetadata({
  title: 'الملف الشخصي',
  description: 'إدارة معلومات حسابك الشخصية',
});

export const dashboardMetadata: Metadata = createMetadata({
  title: 'لوحة التحكم',
  description: 'لوحة التحكم الشخصية لإدارة مواعيدك وخدماتك',
});

export const consultationsMetadata: Metadata = createMetadata({
  title: 'الاستشارات',
  description: 'جلسات الاستشارة الطبية عبر الفيديو والدردشة',
});

export const notFoundMetadata: Metadata = {
  title: 'الصفحة غير موجودة - MedFlow',
  description: 'الصفحة التي تبحث عنها غير موجودة',
  robots: { index: false, follow: false },
};

