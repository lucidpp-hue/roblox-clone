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
  devIndicators: {}
};

export default nextConfig;
