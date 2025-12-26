'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { IFRANE_COORDINATES } from '@/utils/constants';

interface LocationPickerProps {
  onLocationSelect: (lat: number, lng: number) => void;
  initialLat?: number;
  initialLng?: number;
}

function LocationPickerContent({ onLocationSelect, initialLat, initialLng }: LocationPickerProps) {
  const [position, setPosition] = useState<[number, number]>([
    initialLat || IFRANE_COORDINATES.lat,
    initialLng || IFRANE_COORDINATES.lng,
  ]);

  function LocationMarker() {
    useMapEvents({
      click(e) {
        const newPos: [number, number] = [e.latlng.lat, e.latlng.lng];
        setPosition(newPos);
        onLocationSelect(e.latlng.lat, e.latlng.lng);
      },
    });

    return position ? <Marker position={position} /> : null;
  }

  return (
    <MapContainer
      center={position}
      zoom={13}
      style={{ height: '400px', width: '100%' }}
      className="rounded-lg"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <LocationMarker />
    </MapContainer>
  );
}

const LocationPicker = dynamic(() => Promise.resolve(LocationPickerContent), {
  ssr: false,
  loading: () => (
    <div className="h-[400px] w-full flex items-center justify-center bg-gray-100 rounded-lg">
      <p className="text-gray-600">جاري تحميل الخريطة...</p>
    </div>
  ),
});

export default LocationPicker;
