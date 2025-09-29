import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    optimizePackageImports: [
      'framer-motion', 
      '@react-three/fiber', 
      '@react-three/drei',
      'tesseract.js',
      'pdfjs-dist',
      'chart.js',
      'react-chartjs-2',
      'leaflet',
      'react-leaflet'
    ],
    turbo: {
      rules: {
        '*.svg': {
          loaders: ['@svgr/webpack'],
          as: '*.js',
        },
      },
    },
  },
  images: {
    formats: ['image/webp', 'image/avif'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    domains: ['images.pexels.com', '127.0.0.1', 'localhost'],
    minimumCacheTTL: 60,
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
  env: {
    NEXT_PUBLIC_API_BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000',
  },
  // Enable compression
  compress: true,
  // Optimize for production
  poweredByHeader: false,
  reactStrictMode: true,
  swcMinify: true,
  webpack: (config, { dev, isServer }) => {
    // Optimize bundle splitting for heavy libraries
    config.optimization.splitChunks = {
      chunks: 'all',
      minSize: 20000,
      maxSize: 244000,
      cacheGroups: {
        // Heavy 3D libraries
        three: {
          name: 'three',
          test: /[\\/]node_modules[\\/](@react-three|three)[\\/]/,
          priority: 30,
          chunks: 'all',
          enforce: true,
        },
        // OCR and PDF processing
        ocr: {
          name: 'ocr',
          test: /[\\/]node_modules[\\/](tesseract\.js|pdfjs-dist)[\\/]/,
          priority: 25,
          chunks: 'all',
          enforce: true,
        },
        // Animation library
        framer: {
          name: 'framer-motion',
          test: /[\\/]node_modules[\\/]framer-motion[\\/]/,
          priority: 20,
          chunks: 'all',
          enforce: true,
        },
        // Charts and visualization
        charts: {
          name: 'charts',
          test: /[\\/]node_modules[\\/](chart\.js|react-chartjs-2)[\\/]/,
          priority: 18,
          chunks: 'all',
          enforce: true,
        },
        // Maps
        maps: {
          name: 'maps',
          test: /[\\/]node_modules[\\/](leaflet|react-leaflet)[\\/]/,
          priority: 15,
          chunks: 'all',
          enforce: true,
        },
        // Other vendor libraries
        vendor: {
          name: 'vendor',
          test: /[\\/]node_modules[\\/]/,
          priority: 10,
          chunks: 'all',
          enforce: true,
        },
      },
    };

    // Optimize for production builds
    if (!dev && !isServer) {
      config.optimization.usedExports = true;
      config.optimization.sideEffects = false;
    }

    return config;
  },
};

export default nextConfig;