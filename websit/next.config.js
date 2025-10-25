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
  experimental: {
    outputFileTracingRoot: undefined,
  },
}

module.exports = nextConfig
