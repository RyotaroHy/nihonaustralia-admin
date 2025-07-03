import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Serverless optimization
  output: process.env.NODE_ENV === 'production' ? 'standalone' : undefined,

  eslint: {
    ignoreDuringBuilds: true,
  },

  images: {
    domains: [
      'placehold.jp',
      'dummyimage.com',
      'hitodltzbcyrhbumfkbm.supabase.co',
      'picsum.photos',
    ],
    // For serverless deployment, use unoptimized images to reduce Lambda size
    unoptimized: process.env.NODE_ENV === 'production',
  },

  // Asset optimization for CDN
  assetPrefix: process.env.NEXT_PUBLIC_STATIC_URL || '',

  // Experimental features for better serverless performance
  experimental: {
    serverComponentsExternalPackages: ['@supabase/supabase-js'],
  },

  // Reduce bundle size
  webpack: (config, { isServer }) => {
    if (!isServer) {
      // Reduce client-side bundle size
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        path: false,
        crypto: false,
      };
    }

    return config;
  },

  // Optimize for serverless
  swcMinify: true,
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
};

export default nextConfig;
