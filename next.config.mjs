/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['localhost', 'images.unsplash.com', 'res.cloudinary.com'],
    formats: ['image/avif', 'image/webp'],
  },
  reactStrictMode: true,
  swcMinify: true,
  output: 'standalone', // For Docker deployment
  experimental: {
    optimizeCss: true,
  },
};

export default nextConfig;
