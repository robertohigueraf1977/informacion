/** @type {import('next').NextConfig} */
const nextConfig = {
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
}

export default nextConfig;
