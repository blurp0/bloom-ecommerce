import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
        // Restrict to assets under our own Cloudinary account only.
        pathname: "/xloqricm/**",
      },
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
        // Allow the official Cloudinary demo account used for seeded placeholder assets.
        pathname: "/demo/**",
      },
    ],
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },

          {
            key: "Content-Security-Policy-Report-Only",
            value: [
              "default-src 'self'",
              "base-uri 'self'",
              "frame-ancestors 'none'",
              // Images: Cloudinary + Clerk avatar proxies
              "img-src 'self' https://res.cloudinary.com https://*.cloudinary.com https://img.clerk.com",
              // connect-src: Clerk API + Ably (when added)
              "connect-src 'self' https://*.clerk.accounts.dev",
              // script-src: 'unsafe-inline' needed for Next.js HMR + Clerk inline scripts
              // ponytail: tighten to nonces/hashes in production
              "script-src 'self' 'unsafe-inline'",
              // style-src: 'unsafe-inline' needed for React/Next inline styles
              // ponytail: tighten to nonces/hashes in production
              "style-src 'self' 'unsafe-inline'",
              "object-src 'none'",
              "worker-src 'self' blob:",
              "upgrade-insecure-requests",
            ].join("; "),
          },
        ],
      },
    ];
  },
};

export default nextConfig;
