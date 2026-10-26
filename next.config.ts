import type { NextConfig } from "next";

// ---------------------------------------------------------------------------
// Security headers
//
// Public pages get an enforced Content-Security-Policy. Static pages cannot use
// per-request nonces, so inline scripts rely on 'unsafe-inline'; this is
// acceptable here because the site renders no user-supplied HTML, loads no
// third-party scripts, restricts Portable Text to plain blocks, and blocks
// objects, base-tag injection and framing. See SECURITY.md.
//
// The embedded Sanity Studio (/studio) needs far more (workers, eval, Sanity
// APIs, avatar hosts). It gets the non-fetch directives enforced and the full
// policy in Report-Only mode, so authenticated Studio flows are never broken
// by a policy that has not been observed with real editor sessions.
//
// HSTS: one year, deliberately WITHOUT includeSubDomains/preload. Add those only
// after every affected hostname has been checked and HTTPS is confirmed.
// ---------------------------------------------------------------------------
const publicCsp = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline'",
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "font-src 'self' data: https://fonts.gstatic.com",
  // Partner tour photos (TourDesk, Viator, Tiqets) come from provider CDNs whose
  // hosts are not fixed, so images may load from any https origin. Images cannot
  // execute script; scripts, frames and connections stay locked down.
  `img-src 'self' data: blob: https:`,
  "connect-src 'self'",
  "manifest-src 'self'",
  "frame-src 'none'",
  "worker-src 'self' blob:",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
  "upgrade-insecure-requests",
].join("; ");

const studioEnforcedCsp = [
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'self'",
].join("; ");

const studioReportOnlyCsp = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' 'unsafe-eval' blob: https://core.sanity-cdn.com",
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://studio-static.sanity.io",
  "font-src 'self' data: https://fonts.gstatic.com https://studio-static.sanity.io https://design-system-static.sanity.io",
  "img-src 'self' data: blob: https://*.sanity.io https://lh3.googleusercontent.com https://avatars.githubusercontent.com https://secure.gravatar.com",
  "connect-src 'self' https://*.sanity.io wss://*.sanity.io",
  "frame-src 'self' https://*.sanity.io",
  "worker-src 'self' blob:",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
].join("; ");

const baseHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value:
      "camera=(), microphone=(), geolocation=(), payment=(), usb=(), interest-cohort=()",
  },
  { key: "Strict-Transport-Security", value: "max-age=31536000" },
];

const config: NextConfig = {
  poweredByHeader: false,
  productionBrowserSourceMaps: false,
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "cdn.sanity.io",
        pathname: "/images/ut6qxuke/production/**",
      },
    ],
  },
  async headers() {
    return [
      {
        source: "/((?!studio).*)",
        headers: [
          ...baseHeaders,
          { key: "Content-Security-Policy", value: publicCsp },
          { key: "X-Frame-Options", value: "DENY" },
        ],
      },
      {
        source: "/studio/:path*",
        headers: [
          ...baseHeaders,
          { key: "Content-Security-Policy", value: studioEnforcedCsp },
          {
            key: "Content-Security-Policy-Report-Only",
            value: studioReportOnlyCsp,
          },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "Cache-Control", value: "no-store" },
        ],
      },
    ];
  },
};
export default config;
