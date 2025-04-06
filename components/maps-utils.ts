import L from "leaflet";

// Función para crear un icono de marcador de Leaflet
export function createMapIcon() {
  return L.icon({
    iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
    shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41],
  });
}

// Función para configurar globalmente los iconos de Leaflet
export function setupLeafletIcons() {
  if (typeof window !== "undefined") {
    const DefaultIcon = createMapIcon();
    L.Marker.prototype.options.icon = DefaultIcon;
  }
}

// Función para obtener la ubicación actual
export function getCurrentPosition(
  onSuccess: (position: GeolocationPosition) => void,
  onError: (error: GeolocationPositionError) => void,
  options?: PositionOptions
) {
  if (!navigator.geolocation) {
    const error = new Error(
      "La geolocalización no está soportada en este navegador"
    );
    onError(error as unknown as GeolocationPositionError);
    return;
  }

  navigator.geolocation.getCurrentPosition(onSuccess, onError, {
    enableHighAccuracy: true,
    timeout: 10000,
    maximumAge: 0,
    ...options,
  });
}
