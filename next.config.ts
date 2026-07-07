import type { NextConfig } from "next";

const nextConfig: NextConfig = {
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
              // Images (Cloudinary allowlist for common hosted assets)
              "img-src 'self' https://res.cloudinary.com https://*.cloudinary.com",
              // Conservative connect-src: keep to same-origin for now; CSP report-only
              // will surface any needed Ably/Clerk domains without breaking the app.
              "connect-src 'self'",
              // Keep script/style restrictive to avoid breaking Next.js; if the app
              // needs additional sources, report-only will tell us during testing.
              "script-src 'self'",
              "style-src 'self'",
              "object-src 'none'",
              "upgrade-insecure-requests",
            ].join("; "),
          },
        ],
      },
    ];
  },
};

export default nextConfig;
