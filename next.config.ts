// next.config.ts

import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,

  // Explicitly define turbopack to avoid conflict with webpack
  turbopack: {},

  webpack(config) {
    return config;
  },
};

export default nextConfig;
