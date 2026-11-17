/** @type {import('next').NextConfig} */
const nextConfig = {
  /* config options here */
  cacheComponents: true,
  partialPrefetching: true,
  experimental: {
    // The stylesheet (Tailwind, about 10KB compressed) goes inline in the HTML instead of a separate,
    // render-blocking request: the first paint no longer waits on a second round trip.
    inlineCss: true,
  },
  // The internal style guide stays out of search results (it also sets a robots meta tag and is left out of the sitemap).
  async headers() {
    return [{ source: "/style-guide", headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow" }] }];
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
