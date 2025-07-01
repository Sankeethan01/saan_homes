import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    optimizePackageImports: ['framer-motion', '@react-three/fiber', '@react-three/drei'],
  },
  images: {
    formats: ['image/webp', 'image/avif'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    domains: ['images.pexels.com', '127.0.0.1', 'localhost'],
  },
  env: {
    NEXT_PUBLIC_API_BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000/api',
  },
  webpack: (config) => {
    // Optimize bundle splitting for heavy libraries
    config.optimization.splitChunks = {
      chunks: 'all',
      cacheGroups: {
        three: {
          name: 'three',
          test: /[\\/]node_modules[\\/](@react-three|three)[\\/]/,
          priority: 20,
          chunks: 'all',
        },
        framer: {
          name: 'framer-motion',
          test: /[\\/]node_modules[\\/]framer-motion[\\/]/,
          priority: 15,
          chunks: 'all',
        },
        vendor: {
          name: 'vendor',
          test: /[\\/]node_modules[\\/]/,
          priority: 10,
          chunks: 'all',
        },
      },
    };
    return config;
  },
};

export default nextConfig;