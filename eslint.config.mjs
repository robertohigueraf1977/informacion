/** @type {import('next').NextConfig} */
const nextConfig = {
  // Configuración básica compatible con Next.js
  reactStrictMode: false,
  experimental: {
    // Eliminar optimizePackageImports que está causando el error
    serverActions: {
      allowedOrigins: ['localhost:3000'],
      bodySizeLimit: '10mb',
    },
  },
  // Configuración para evitar problemas de caché
  headers: async () => {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'no-store, max-age=0',
          },
        ],
      },
    ]
  },
}

export default nextConfig
