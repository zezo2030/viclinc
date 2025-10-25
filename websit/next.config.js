/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['localhost'],
  },
  env: {
    CUSTOM_KEY: process.env.CUSTOM_KEY,
  },
  // إعدادات Docker
  output: 'standalone',
  
  // إعدادات الأداء
  compress: true,
  
  // تحسينات الذاكرة
  webpack: (config, { dev, isServer }) => {
    // إصلاح مشكلة exports is not defined
    config.resolve = {
      ...config.resolve,
      fallback: {
        ...config.resolve?.fallback,
        fs: false,
        path: false,
        os: false,
      },
    };

    // تحسين استهلاك الذاكرة في التطوير
    if (dev) {
      config.watchOptions = {
        poll: 1000,
        aggregateTimeout: 300,
        ignored: [
          '**/node_modules/**',
          '**/.git/**',
          '**/dist/**',
          '**/build/**',
          '**/.next/**'
        ]
      };
    }
    
    // تحسين تقسيم الكود مع إصلاح مشكلة vendors
    if (!isServer) {
      config.optimization = {
        ...config.optimization,
        splitChunks: {
          chunks: 'all',
          cacheGroups: {
            default: {
              minChunks: 1,
              priority: -20,
              reuseExistingChunk: true,
            },
            vendor: {
              test: /[\\/]node_modules[\\/]/,
              name: 'vendors',
              chunks: 'all',
              priority: -10,
            },
          },
        },
      };
    }
    
    return config;
  },
  
  // تحسينات إضافية
  experimental: {
    // تقليل استهلاك الذاكرة
    memoryBasedWorkersCount: true,
    // تحسين التحميل
    optimizePackageImports: ['lucide-react', 'framer-motion'],
  },
  
  // تحسينات الأداء
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
  
  // تحسينات التطوير
  onDemandEntries: {
    maxInactiveAge: 25 * 1000,
    pagesBufferLength: 2,
  },
}

module.exports = nextConfig
