/** @type {import('next').NextConfig} */
const nextConfig = {
  // Self-contained server build for the Docker image (see Dockerfile).
  output: 'standalone',
  pageExtensions: ['js', 'jsx', 'mdx', 'ts', 'tsx'],
  // This is a private instance: skip the marketing landing page.
  async redirects() {
    return [{ source: '/', destination: '/app/today', permanent: false }];
  },
};

const withPWA = require('@ducanh2912/next-pwa').default({
  aggressiveFrontEndNavCaching: true,
  cacheOnFrontEndNav: true,
  dest: 'public',
});

const withMDX = require('@next/mdx')();

module.exports = withMDX(withPWA(nextConfig));
