import { Metadata } from 'next';

export const siteConfig = {
  name: 'MedFlow',
  description: 'احجز موعدك بسهولة، احصل على استشارات طبية افتراضية، وأدار صحتك بطريقة ذكية',
  url: 'https://medflow.sa',
  ogImage: 'https://medflow.sa/og-image.jpg',
  locale: 'ar_SA',
};

export const baseMetadata: Metadata = {
  title: siteConfig.name,
  description: siteConfig.description,
  keywords: ['عيادة', 'طبيب', 'حجز موعد', 'رعاية صحية', 'استشارة طبية', 'صحة'],
  authors: [{ name: 'MedFlow', url: siteConfig.url }],
  creator: 'MedFlow',
  publisher: 'MedFlow',
  robots: {
    index: true,
    follow: true,
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
      'max-snippet': -1,
      'max-image-preview': 'large',
      'max-video-preview': -1,
    },
  },
  openGraph: {
    type: 'website',
    locale: siteConfig.locale,
    url: siteConfig.url,
    siteName: siteConfig.name,
    title: siteConfig.name,
    description: siteConfig.description,
    images: [
      {
        url: siteConfig.ogImage,
        width: 1200,
        height: 630,
        alt: siteConfig.name,
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: siteConfig.name,
    description: siteConfig.description,
    images: [siteConfig.ogImage],
    creator: '@medflow',
  },
};

export function createMetadata(customMetadata: Partial<Metadata>): Metadata {
  return {
    ...baseMetadata,
    ...customMetadata,
    title: customMetadata.title 
      ? `${customMetadata.title} | ${siteConfig.name}`
      : siteConfig.name,
  };
}



