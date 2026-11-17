// What pages may load. Pages are prerendered and cached, so per-request nonces aren't available: inline
// scripts (Next's own bootstrap, the intro script) are allowed with 'unsafe-inline'. Prismic serves the
// photos and media, and its preview toolbar (script, frame, API) for editors. Vercel Analytics is same-origin.
// Development also needs 'unsafe-eval' (React's dev tooling).
const CSP = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${process.env.NODE_ENV === "production" ? "" : " 'unsafe-eval'"} https://static.cdn.prismic.io https://*.prismic.io`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https://images.prismic.io https://*.prismic.io",
  "media-src 'self' https://*.prismic.io https://*.cdn.prismic.io https://prismic-io.s3.amazonaws.com",
  "font-src 'self' data:",
  "connect-src 'self' https://*.prismic.io https://*.cdn.prismic.io",
  "frame-src https://*.prismic.io",
  "frame-ancestors 'self'",
  "base-uri 'self'",
  "form-action 'self'",
  "object-src 'none'",
].join("; ");

const SECURITY_HEADERS = [
  { key: "Content-Security-Policy", value: CSP },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), browsing-topics=()" },
];

/** @type {import('next').NextConfig} */
const nextConfig = {
  cacheComponents: true,
  poweredByHeader: false,
  partialPrefetching: true,
  experimental: {
    // The stylesheet (Tailwind, about 10KB compressed) goes inline in the HTML instead of a separate,
    // render-blocking request: the first paint no longer waits on a second round trip.
    inlineCss: true,
  },
  async headers() {
    return [
      // Every page except the slice simulator, which Prismic's Slice Machine loads in a frame.
      { source: "/((?!slice-simulator).*)", headers: SECURITY_HEADERS },
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
