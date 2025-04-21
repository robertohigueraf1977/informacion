import type React from "react"
import { Sidebar } from "@/components/sidebar"
import { getServerSession } from "next-auth"
import { authOptions } from "@/auth"
import { SessionProvider } from "@/components/session-provider"
import Script from "next/script"
import { Toaster } from "@/components/ui/toaster"

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getServerSession(authOptions)

  return (
    <SessionProvider session={session}>
      <div className="flex min-h-screen">
        <Sidebar />
        <main className="flex-1 overflow-auto bg-secondary/20 pt-16 md:pt-0 md:pl-72">
          <div className="container py-6 md:py-10">{children}</div>
        </main>
      </div>

      <Toaster />

      {/* Configuración global para Leaflet */}
      <Script id="leaflet-fix" strategy="beforeInteractive">
        {`
          if (typeof window !== 'undefined') {
            window.L = window.L || {};
            window.L.Icon = window.L.Icon || {};
            window.L.Icon.Default = window.L.Icon.Default || {};
            
            // Configuración global para los iconos de Leaflet
            window.leafletIconConfig = {
              iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
              shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
              iconSize: [25, 41],
              iconAnchor: [12, 41],
              popupAnchor: [1, -34],
              shadowSize: [41, 41]
            };
          }
        `}
      </Script>
    </SessionProvider>
  )
}
