/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  compiler: {
    styledComponents: true,
  },
  output: 'standalone',
  async headers() {
    return [
      {
        source: '/_next/static/chunks/:path*.js',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Content-Type', value: 'application/javascript; charset=utf-8' },
        ],
      },
      {
        source: '/_next/static/:path*.js',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Content-Type', value: 'application/javascript; charset=utf-8' },
        ],
      },
      {
        source: '/_next/static/:path*.css',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Content-Type', value: 'text/css; charset=utf-8' },
        ],
      },
      {
        // Apply HTML-specific headers only for requests that accept HTML
        // This avoids overriding correct content-types for static assets (eg .svg)
        source: '/:path*',
        has: [
          {
            type: 'header',
            key: 'accept',
            value: 'text/html',
          },
        ],
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          // Ensure HTML responses include utf-8 charset, but only for HTML requests
          { key: 'Content-Type', value: 'text/html; charset=utf-8' },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
