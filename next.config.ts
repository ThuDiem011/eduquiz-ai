/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'api.dicebear.com' },
    ],
  },
  experimental: {
    serverActions: {
      allowedOrigins: ['localhost:3000', '192.168.137.1:3000'],
      bodySizeLimit: '50mb',
    },
  },
  // Correct top-level key for Next.js 15+
  allowedDevOrigins: ['192.168.137.1', '192.168.137.1:3000', 'localhost:3000'],
  devIndicators: {
    appIsrStatus: false,
  },
};

export default nextConfig;
