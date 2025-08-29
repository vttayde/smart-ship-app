import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Environment variables configuration
  env: {
    NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET || 'fallback-secret-for-build',
    NEXTAUTH_URL: process.env.NEXTAUTH_URL || 'http://localhost:3000',
  },
  
  // Build configuration
  typescript: {
    // Allow build to continue even with type errors during development
    ignoreBuildErrors: false,
  },
  
  eslint: {
    // Allow build to continue even with ESLint errors during development
    ignoreDuringBuilds: false,
  },
};

export default nextConfig;
