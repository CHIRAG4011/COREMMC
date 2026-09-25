import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Vercel handles output format automatically — no "standalone" needed
  typescript: {
    ignoreBuildErrors: true,
  },
  reactStrictMode: false,
  allowedDevOrigins: ['*.space-z.ai', '21.0.5.209'],
  experimental: {
    // Optimize firebase barrel imports so Turbopack can tree-shake effectively
    optimizePackageImports: ['firebase'],
  },
  // Firebase Admin SDK works natively on Vercel serverless
  serverExternalPackages: ['firebase-admin'],
  images: {
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'sfile.chatglm.cn',
      },
      {
        protocol: 'https',
        hostname: 'i.imgur.com',
      },
    ],
  },
  // Redirect /favicon.ico to the actual icon file so browsers can find it
  // SPA fallback: all non-API, non-static routes serve the root page
  // so client-side routing can read the URL and render the correct view.
  async rewrites() {
    return [
      {
        source: '/favicon.ico',
        destination: '/coremmc-icon.png',
      },
      {
        // Match paths like /contact, /minecraft-intel, /dashboard/settings
        // but NOT /api/*, /_next/*, or paths with file extensions
        source: '/:path((?!api|_next|icon|coremmc).*)',
        destination: '/',
      },
    ];
  },
};

export default nextConfig;