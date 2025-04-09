"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState } from "react"
import L from "leaflet"

type LeafletContextType = {
  isReady: boolean
}

const LeafletContext = createContext<LeafletContextType>({
  isReady: false,
})

export const useLeaflet = () => useContext(LeafletContext)

export function LeafletProvider({ children }: { children: React.ReactNode }) {
  const [isReady, setIsReady] = useState(false)

  useEffect(() => {
    // Configurar Leaflet solo en el cliente
    if (typeof window !== "undefined") {
      // Configurar el icono por defecto para Leaflet
      const DefaultIcon = L.icon({
        iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
        shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41],
      })

      L.Marker.prototype.options.icon = DefaultIcon
      setIsReady(true)
    }
  }, [])

  return <LeafletContext.Provider value={{ isReady }}>{children}</LeafletContext.Provider>
}
