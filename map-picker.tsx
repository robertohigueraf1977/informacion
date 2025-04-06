'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';

const MapContainer = dynamic(
  () => import('react-leaflet').then((mod) => mod.MapContainer),
  { ssr: false }
);

const TileLayer = dynamic(
  () => import('react-leaflet').then((mod) => mod.TileLayer),
  { ssr: false }
);

const Marker = dynamic(
  () => import('react-leaflet').then((mod) => mod.Marker),
  { ssr: false }
);

interface MapPickerProps {
  onLocationSelect: (lat: number, lng: number) => void;
  initialLocation?: { lat: number; lng: number };
}

export default function MapPicker({ onLocationSelect, initialLocation }: MapPickerProps) {
  const [isMounted, setIsMounted] = useState(false);
  const defaultLocation = { lat: -12.046374, lng: -77.042793 }; // Default to Lima, Peru

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return <div>Loading map...</div>;
  }

  const position = initialLocation || defaultLocation;

  return (
    <div style={{ height: '400px', width: '100%' }}>
      <MapContainer
        center={[position.lat, position.lng]}
        zoom={13}
        style={{ height: '100%', width: '100%' }}
        onClick={(e: any) => {
          const { lat, lng } = e.latlng;
          onLocationSelect(lat, lng);
        }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        <Marker position={[position.lat, position.lng]} />
      </MapContainer>
    </div>
  );
}

