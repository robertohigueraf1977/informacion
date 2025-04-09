/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Configuración básica compatible con Next.js 15
  webpack: (config) => {
    return config;
  },
}

export default nextConfig;
