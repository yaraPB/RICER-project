/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverActions: {
      allowedOrigins: ['*'],
    },
  },
  typescript: {
    ignoreBuildErrors: true, // ✅ ignore TS errors during build
  },
};

module.exports = nextConfig;
