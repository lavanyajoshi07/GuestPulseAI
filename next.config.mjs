/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  
  allowedDevOrigins: [
    'localhost',
    '127.0.0.1',
    '192.168.31.150'
  ],
}

export default nextConfig
