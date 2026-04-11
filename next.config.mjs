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
    buildActivity: true,
    buildActivityPosition: 'bottom-right'
  }
};

export default nextConfig;
