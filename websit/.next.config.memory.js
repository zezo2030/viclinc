// إعدادات إضافية لحل مشكلة الذاكرة
module.exports = {
  // إعدادات الذاكرة
  webpack: (config, { dev, isServer }) => {
    if (dev) {
      // تقليل استهلاك الذاكرة في التطوير
      config.watchOptions = {
        poll: 2000,
        aggregateTimeout: 500,
        ignored: [
          '**/node_modules/**',
          '**/.git/**',
          '**/dist/**',
          '**/build/**',
          '**/.next/**',
          '**/coverage/**',
          '**/.nyc_output/**'
        ]
      };
    }
    
    // تحسين تقسيم الكود
    config.optimization = {
      ...config.optimization,
      splitChunks: {
        chunks: 'all',
        minSize: 20000,
        maxSize: 244000,
        cacheGroups: {
          default: {
            minChunks: 2,
            priority: -20,
            reuseExistingChunk: true,
          },
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendors',
            priority: -10,
            chunks: 'all',
          },
        },
      },
    };
    
    return config;
  },
  
  // إعدادات إضافية
  experimental: {
    memoryBasedWorkersCount: true,
    optimizeCss: true,
    optimizePackageImports: [
      'lucide-react',
      'framer-motion',
      '@tanstack/react-query'
    ],
  },
};
