/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.rbxcdn.com'
      }
    ]
  },
  devIndicators: {
    buildActivity: 'dashboard'
  }
};

export default nextConfig;
