/** @type {import('next').NextConfig} */
const nextConfig = {
    // Enable experimental features for production
    experimental: {
        optimizePackageImports: ['@/components', '@/lib'],
    },

    // Image optimization
    images: {
        domains: ['vercel.app', 'localhost'],
        formats: ['image/webp', 'image/avif'],
    },

    // PWA configuration
    compiler: {
        removeConsole: process.env.NODE_ENV === 'production',
    },

    // Bundle analyzer (enable for analysis)
    // bundleAnalyzer: {
    //   enabled: process.env.ANALYZE === 'true',
    // },

    // Security headers
    async headers() {
        return [
            {
                source: '/(.*)',
                headers: [
                    {
                        key: 'X-Frame-Options',
                        value: 'DENY',
                    },
                    {
                        key: 'X-Content-Type-Options',
                        value: 'nosniff',
                    },
                    {
                        key: 'Referrer-Policy',
                        value: 'origin-when-cross-origin',
                    },
                    {
                        key: 'Content-Security-Policy',
                        value: [
                            "default-src 'self'",
                            "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://vercel.live",
                            "style-src 'self' 'unsafe-inline'",
                            "img-src 'self' data: https:",
                            "font-src 'self'",
                            "connect-src 'self' https:",
                            "manifest-src 'self'",
                            "worker-src 'self' blob:",
                        ].join('; '),
                    },
                ],
            },
        ];
    },

    // Redirects for production
    async redirects() {
        return [
            {
                source: '/home',
                destination: '/',
                permanent: true,
            },
        ];
    },

    // API rewrites if needed
    async rewrites() {
        return [];
    },

    // Output configuration for Vercel
    output: 'standalone',

    // Enable TypeScript strict mode
    typescript: {
        ignoreBuildErrors: false,
    },

    // ESLint configuration
    eslint: {
        ignoreDuringBuilds: false,
    },

    // Performance optimizations
    swcMinify: true,

    // Enable React strict mode
    reactStrictMode: true,

    // Environment variables available in browser
    env: {
        CUSTOM_KEY: process.env.CUSTOM_KEY,
    },
};

module.exports = nextConfig;
