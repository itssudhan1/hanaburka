/** @type {import('next').NextConfig} */

// Razorpay's checkout.js needs to load its script from checkout.razorpay.com,
// open network connections to api.razorpay.com (and its telemetry endpoint),
// and render its payment sheet in an iframe from the same hosts. Supabase
// needs script-free XHR/fetch access for auth + storage + realtime.
// Cloudflare Turnstile (the optional CAPTCHA on /admin/login — see
// lib/actions/admin-auth.ts) loads its script and renders its challenge
// from challenges.cloudflare.com; allowed here unconditionally rather than
// only when TURNSTILE_SITE_KEY is set, because next.config.js only runs
// once at server start and can't react to an env var being added later
// without a redeploy anyway — allowing the host costs nothing when the
// feature is off.
//
// 'unsafe-eval' is added ONLY in development: Next.js's dev-mode Fast
// Refresh / HMR runtime uses eval() to swap modules in place, and without
// this the browser throws "Uncaught EvalError" on every page load, which
// aborts React hydration entirely (this is what was causing hero content
// and admin buttons to appear broken/unresponsive in dev — not a separate
// bug). Production builds don't need or get 'unsafe-eval'.
//
// This has NOT been click-tested against a live payment yet — verify a full
// checkout still completes in staging before relying on this in production;
// if the Razorpay sheet fails to open, check the browser console for the
// specific directive it's blocking and extend that line rather than
// loosening the whole policy.
const isDev = process.env.NODE_ENV !== "production";
const csp = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline' ${isDev ? "'unsafe-eval' " : ""}https://checkout.razorpay.com https://challenges.cloudflare.com`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https://kivjcxpbcqmmowgdhico.supabase.co",
  "font-src 'self' data:",
  "connect-src 'self' https://kivjcxpbcqmmowgdhico.supabase.co wss://kivjcxpbcqmmowgdhico.supabase.co https://api.razorpay.com https://lumberjack.razorpay.com https://challenges.cloudflare.com",
  "frame-src https://api.razorpay.com https://checkout.razorpay.com https://challenges.cloudflare.com",
  "base-uri 'self'",
  "form-action 'self'",
  "object-src 'none'",
  "frame-ancestors 'none'",
].join("; ");

const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "kivjcxpbcqmmowgdhico.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
    ],
    // Serve modern, smaller formats where the browser supports them, and
    // cache optimized variants for 30 days instead of re-deriving them
    // on every request.
    formats: ["image/avif", "image/webp"],
    minimumCacheTTL: 60 * 60 * 24 * 30,
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
          { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
          { key: "Content-Security-Policy", value: csp },
        ],
      },
      {
        // Static build assets are content-hashed by Next.js, so it's safe
        // to tell browsers/CDNs to cache them "forever".
        source: "/_next/static/:path*",
        headers: [
          { key: "Cache-Control", value: "public, max-age=31536000, immutable" },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
