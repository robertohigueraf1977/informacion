/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  // Desactivar la optimización de webpack que está causando el problema
  webpack: (config, { isServer }) => {
    // Desactivar completamente la optimización de chunks para evitar el problema
    config.optimization.splitChunks = false;
    config.optimization.runtimeChunk = false;
    
    // Asegurarse de que webpack no genere código que dependa de 'exports'
    config.output = {
      ...config.output,
      // Usar 'window' como globalObject en lugar del valor predeterminado
      globalObject: 'globalThis',
    };
    
    return config;
  },
  // Desactivar características experimentales que podrían causar problemas
  experimental: {
    // Desactivar características experimentales
    esmExternals: false,
    serverActions: false,
  },
}

export default nextConfig;
