import { sanity } from "next-sanity/live/cache-life";

// This site's Sanity project. Every page reads its content, so a build without it stops here.
const PROJECT_ID = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
if (!PROJECT_ID) throw new Error("NEXT_PUBLIC_SANITY_PROJECT_ID is not set: add the Sanity project ID to the environment.");

// The dataset is private: without a read token every page would build empty, so a production build stops too.
if (process.env.NODE_ENV === "production" && !process.env.SANITY_API_READ_TOKEN) {
  throw new Error("SANITY_API_READ_TOKEN is not set: add a Sanity Viewer token to the environment.");
}

// Its API, which also carries the live connection that refreshes pages on publish.
const SANITY_API = `https://${PROJECT_ID}.api.sanity.io`;

// What pages may load. Pages are prerendered and cached, so per-request nonces aren't available: inline
// scripts (Next's own bootstrap, the intro script) are allowed with 'unsafe-inline'. Photos come from the site's
// own image optimizer (same origin); Sanity's CDN serves this project's uploaded video; Sanity's API carries the live
// connection. Vercel Analytics and Speed Insights are same-origin.
// Development also needs 'unsafe-eval' (React's dev tooling).
const CSP = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${process.env.NODE_ENV === "production" ? "" : " 'unsafe-eval'"}`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob:",
  `media-src 'self' https://cdn.sanity.io/files/${PROJECT_ID}/`,
  "font-src 'self' data:",
  `connect-src 'self' ${SANITY_API}`,
  "frame-ancestors 'self'",
  "base-uri 'self'",
  "form-action 'self'",
  "object-src 'none'",
].join("; ");

// The embedded studio (/studio) is a separate app: it talks to Sanity's API and live socket, loads images and
// files from Sanity's CDN, and needs a looser policy than the public pages. It is never indexed.
const STUDIO_CSP = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${process.env.NODE_ENV === "production" ? "" : " 'unsafe-eval'"} https://core.sanity-cdn.com`,
  "style-src 'self' 'unsafe-inline' https://*.sanity.io",
  "img-src 'self' data: blob: https://cdn.sanity.io https://*.sanity.io",
  "media-src 'self' blob: https://cdn.sanity.io",
  "font-src 'self' data: https://*.sanity.io",
  "connect-src 'self' https://*.api.sanity.io wss://*.api.sanity.io https://*.sanity.io",
  "frame-src 'self' https://*.sanity.io",
  "worker-src 'self' blob:",
  "frame-ancestors 'self'",
  "base-uri 'self'",
  "form-action 'self'",
  "object-src 'none'",
].join("; ");

// Shared by the site and the studio: HTTPS only, for two years, subdomains too (browsers ignore it over plain
// HTTP, so local servers are unaffected); the origin only as referrer to other sites; no camera, microphone,
// location or ad-topic access.
const COMMON_HEADERS = [
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), browsing-topics=()" },
];

const STUDIO_HEADERS = [
  { key: "Content-Security-Policy", value: STUDIO_CSP },
  ...COMMON_HEADERS,
  { key: "X-Robots-Tag", value: "noindex, nofollow" },
];

const SECURITY_HEADERS = [{ key: "Content-Security-Policy", value: CSP }, ...COMMON_HEADERS];

/** @type {import('next').NextConfig} */
const nextConfig = {
  cacheComponents: true,
  // Cached content stays until a publish expires it (SanityLive), not for the default 15 minutes.
  cacheLife: { default: sanity },
  // Photos go through the site's image optimizer (components/Img.jsx), which fetches them from this project's
  // images on Sanity's CDN only. AVIF first, as browsers take it; WebP otherwise; quality 75. Sources never
  // change (each upload has its own address), so optimized files are kept a year.
  images: {
    remotePatterns: [{ protocol: "https", hostname: "cdn.sanity.io", pathname: `/images/${PROJECT_ID}/**` }],
    formats: ["image/avif", "image/webp"],
    qualities: [75],
    minimumCacheTTL: 31536000,
  },
  poweredByHeader: false,
  partialPrefetching: true,
  experimental: {
    // A 404 for addresses no route matches, since the site and the studio have separate root layouts.
    globalNotFound: true,
    // The stylesheet (Tailwind, about 10KB compressed) goes inline in the HTML instead of a separate,
    // render-blocking request: the first paint no longer waits on a second round trip.
    inlineCss: true,
  },
  async headers() {
    return [
      // Every page except the studio, which has its own headers below.
      { source: "/((?!studio(?:/|$)).*)", headers: SECURITY_HEADERS },
      { source: "/studio", headers: STUDIO_HEADERS },
      { source: "/studio/:path*", headers: STUDIO_HEADERS },
      // The internal style guide stays out of search results (it also sets a robots meta tag and is left out of the sitemap).
      { source: "/style-guide", headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow" }] },
    ];
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
