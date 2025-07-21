// next.config.ts

import { NextConfig } from 'next';

// Custom Next.js configuration
const nextConfig: NextConfig = {
  reactStrictMode: true, // Enables strict mode for React
  webpack(config) {
    // Add custom webpack configurations if needed
    return config;
  },
  // Add more configuration options as necessary
};

export default nextConfig;