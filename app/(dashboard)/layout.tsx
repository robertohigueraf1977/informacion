import type React from "react";
import { Sidebar } from "@/components/sidebar";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/auth";
import { SessionProvider } from "@/components/session-provider";
import Script from "next/script";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  return (
    <SessionProvider session={session}>
      <div className="flex min-h-screen">
        <Sidebar />
        <main className="flex-1 p-6 overflow-auto">{children}</main>
      </div>

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
  );
}
