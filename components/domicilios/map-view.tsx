"use client";

import { useEffect, useState, useCallback } from "react";
import { MapContainer, TileLayer, Marker, useMap, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { Loader2, MapPin } from "lucide-react";

// Solución definitiva para los iconos de Leaflet en Next.js
const DefaultIcon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

// Componente para actualizar la vista del mapa cuando cambian las coordenadas
function MapUpdater({ center }: { center: [number, number] }) {
  const map = useMap();

  useEffect(() => {
    map.setView(center, map.getZoom());
  }, [center, map]);

  return null;
}

export function MapView() {
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [position, setPosition] = useState<[number, number]>([
    24.13307907237313, -110.34244072447111,
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [geoError, setGeoError] = useState<string | null>(null);

  // Función para obtener la ubicación actual
  const getCurrentLocation = useCallback(() => {
    setIsLoading(true);
    setGeoError(null);

    if (!navigator.geolocation) {
      setGeoError("La geolocalización no está soportada en este navegador");
      setIsLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        console.log("Ubicación obtenida:", latitude, longitude);
        setPosition([latitude, longitude]);
        setIsLoading(false);
      },
      (error) => {
        console.error("Error de geolocalización:", error);
        let errorMsg = "Error al obtener la ubicación";

        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMsg = "Usuario denegó la solicitud de geolocalización";
            break;
          case error.POSITION_UNAVAILABLE:
            errorMsg = "Información de ubicación no disponible";
            break;
          case error.TIMEOUT:
            errorMsg = "La solicitud de ubicación expiró";
            break;
        }

        setGeoError(errorMsg);
        setIsLoading(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  }, []);

  // Configurar Leaflet cuando el componente se monta
  useEffect(() => {
    setMounted(true);

    // Configurar el icono por defecto para Leaflet
    L.Marker.prototype.options.icon = DefaultIcon;
  }, []);

  if (!mounted) {
    return (
      <div className="h-[400px] w-full rounded-md overflow-hidden bg-gray-100 flex items-center justify-center">
        Cargando mapa...
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <Button
          onClick={getCurrentLocation}
          disabled={isLoading}
          className="flex items-center gap-2"
        >
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Obteniendo ubicación...
            </>
          ) : (
            <>
              <MapPin className="h-4 w-4" />
              Obtener mi ubicación
            </>
          )}
        </Button>

        <div className="text-sm">
          Lat: {position[0].toFixed(6)}, Lng: {position[1].toFixed(6)}
        </div>
      </div>

      {geoError && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
          <strong className="font-bold">Error: </strong>
          <span className="block sm:inline">{geoError}</span>
        </div>
      )}

      <div className="h-[400px] w-full rounded-md overflow-hidden border">
        <MapContainer
          center={position}
          zoom={15}
          style={{ height: "100%", width: "100%" }}
          attributionControl={false}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <Marker position={position} icon={DefaultIcon}>
            <Popup>
              Ubicación seleccionada
              <br />
              Lat: {position[0].toFixed(6)}
              <br />
              Lng: {position[1].toFixed(6)}
            </Popup>
          </Marker>
          <MapUpdater center={position} />
        </MapContainer>
      </div>
    </div>
  );
}
