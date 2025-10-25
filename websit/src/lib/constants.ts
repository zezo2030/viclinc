// الثوابت العامة للموقع

export const SITE_CONFIG = {
  name: 'MedFlow',
  description: 'نظام إدارة العيادات المتطور',
  url: process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3001',
  apiUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000',
} as const;

export const CONTACT_INFO = {
  phone: process.env.NEXT_PUBLIC_CONTACT_PHONE || '+966501234567',
  email: process.env.NEXT_PUBLIC_CONTACT_EMAIL || 'info@smartclinic.sa',
  address: process.env.NEXT_PUBLIC_CONTACT_ADDRESS || 'الرياض، المملكة العربية السعودية',
} as const;

export const NAVIGATION_LINKS = [
  { name: 'الرئيسية', href: '/' },
  { name: 'الخدمات', href: '/services' },
  { name: 'الأطباء', href: '/doctors' },
  { name: 'التخصصات', href: '/specialties' },
  { name: 'الأسعار', href: '/pricing' },
  { name: 'من نحن', href: '/about' },
  { name: 'تواصل معنا', href: '/contact' },
  { name: 'المدونة', href: '/blog' },
] as const;

export const SOCIAL_LINKS = {
  twitter: 'https://twitter.com/smartclinic',
  facebook: 'https://facebook.com/smartclinic',
  instagram: 'https://instagram.com/smartclinic',
  linkedin: 'https://linkedin.com/company/smartclinic',
} as const;

export const FOOTER_LINKS = {
  services: [
    { name: 'حجز المواعيد', href: '/appointments' },
    { name: 'الاستشارات', href: '/consultations' },
    { name: 'الخدمات', href: '/services' },
  ],
  company: [
    { name: 'من نحن', href: '/about' },
    { name: 'الأخبار', href: '/blog' },
  ],
  support: [
    { name: 'تواصل معنا', href: '/contact' },
  ],
  legal: [
    // سيتم إضافة الروابط القانونية لاحقاً
  ],
} as const;

export const APP_STATS = {
  doctors: 500,
  patients: 10000,
  specialties: 11,
} as const;
