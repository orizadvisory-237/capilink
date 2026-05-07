import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Externaliser Puppeteer et Chromium pour les fonctions Serverless
  serverExternalPackages: ["puppeteer-core", "@sparticuz/chromium", "@prisma/client"],

  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
    ],
  },

  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-XSS-Protection", value: "1; mode=block" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload",
          },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=(), payment=(), usb=(), bluetooth=()",
          },
          {
            key: "Content-Security-Policy",
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
              "font-src 'self' https://fonts.gstatic.com",
              "img-src 'self' data: https://*.supabase.co",
              "connect-src 'self' https://*.supabase.co https://api.twilio.com",
              "frame-ancestors 'none'",
              "form-action 'self'",
              "report-uri /api/security/csp-report"
            ].join("; "),
          },
        ],
      },
    ];
  },
  poweredByHeader: false,
};

export default nextConfig;
