import type { Metadata } from 'next';
import { Cairo } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/lib/contexts/auth-context';
import { QueryProvider } from '@/lib/providers/query-client-provider';

const cairo = Cairo({
  subsets: ['arabic'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'نظام إدارة العيادات المتطور',
  description: 'احجز موعدك بسهولة، احصل على استشارات طبية افتراضية، وأدار صحتك بطريقة ذكية',
  keywords: ['عيادة', 'طبيب', 'حجز موعد', 'رعاية صحية', 'استشارة طبية'],
  authors: [{ name: 'MedFlow' }],
  openGraph: {
    title: 'نظام إدارة العيادات المتطور',
    description: 'احجز موعدك بسهولة، احصل على استشارات طبية افتراضية، وأدار صحتك بطريقة ذكية',
    type: 'website',
    locale: 'ar_SA',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ar" dir="rtl">
      <body className={`${cairo.className} antialiased`} suppressHydrationWarning={true}>
        <QueryProvider>
          <AuthProvider>
            {children}
          </AuthProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
