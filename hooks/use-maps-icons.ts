"use client";

import { useEffect, useState } from "react";
import L from "leaflet";

export function useMapIcon() {
  const [icon, setIcon] = useState<L.Icon | null>(null);

  useEffect(() => {
    // Crear el icono solo en el cliente
    const defaultIcon = L.icon({
      iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
      shadowUrl:
        "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      shadowSize: [41, 41],
    });

    // Configurar el icono por defecto para todos los marcadores
    L.Marker.prototype.options.icon = defaultIcon;

    setIcon(defaultIcon);
  }, []);

  return icon;
}
