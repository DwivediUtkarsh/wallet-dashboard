/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  typescript: {
    ignoreBuildErrors: false
  },
  experimental: {
    // Disable the experimental feature that requires awaiting params
    typedRoutes: false
  }
};

module.exports = nextConfig; 