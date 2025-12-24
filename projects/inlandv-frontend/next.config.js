/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone', // Tạo standalone build để deploy
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '4001',
        pathname: '/uploads/**',
      },
      {
        protocol: 'http',
        hostname: '127.0.0.1',
        port: '4001',
        pathname: '/uploads/**',
      },
    ],
    formats: ['image/avif', 'image/webp'],
    // Allow unoptimized images in development to avoid private IP restrictions
    unoptimized: process.env.NODE_ENV === 'development',
  },
  experimental: {
    optimizePackageImports: ['lucide-react'],
  },
}

module.exports = nextConfig
