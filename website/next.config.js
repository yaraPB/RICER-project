/* eslint-env node */
const withNextIntl = require('next-intl/plugin')(
  './i18n/request.ts'  // Updated path!
);

/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config) => {
    config.resolve.fallback = { fs: false, net: false, tls: false };
    
    // Add rule for video files
    config.module.rules.push({
      test: /\.(mp4|webm|ogg|mp3|wav|flac|aac)$/,
      type: 'asset/resource',
      generator: {
        filename: 'static/media/[name].[hash][ext]',
      },
    });
    
    return config;
  },
  images: {
    domains: ['utfs.io', 'uploadthing.com'],
  },
}

module.exports = withNextIntl(nextConfig);
