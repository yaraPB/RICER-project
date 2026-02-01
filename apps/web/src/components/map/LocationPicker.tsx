'use client';

import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { IFRANE_COORDINATES } from '@/utils/constants';
import { Icon } from '@/components/ui/Icon';
import { useTranslation } from '@/hooks/useTranslation';

// Fix for default marker icons
const iconProto = L.Icon.Default.prototype as unknown as { _getIconUrl?: unknown };
delete iconProto._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

interface LocationPickerProps {
  onLocationSelect: (lat: number, lng: number) => void;
  selectedLocation?: { lat: number; lng: number };
}

function LocationMarker({
  onLocationSelect,
  selectedLocation,
}: LocationPickerProps) {
  useMapEvents({
    click(e) {
      onLocationSelect(e.latlng.lat, e.latlng.lng);
    },
  });

  return selectedLocation ? (
    <Marker position={[selectedLocation.lat, selectedLocation.lng]} />
  ) : null;
}

export default function LocationPicker({
  onLocationSelect,
  selectedLocation,
}: LocationPickerProps) {
  const { t, language } = useTranslation();
  const isRTL = language === 'ar';

  return (
    <div className="relative">
      <MapContainer
        center={[IFRANE_COORDINATES.lat, IFRANE_COORDINATES.lng]}
        zoom={13}
        style={{ height: '400px', width: '100%' }}
        className="rounded-lg shadow-lg z-0"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <LocationMarker
          onLocationSelect={onLocationSelect}
          selectedLocation={selectedLocation}
        />
      </MapContainer>
      <div
        className={`absolute top-4 ${isRTL ? 'right-4' : 'left-4'} rounded-lg border border-border bg-surface px-3 py-2 shadow-elev-1 z-[1000] text-sm`}
        dir={isRTL ? 'rtl' : 'ltr'}
      >
        <div className={`mb-1 flex items-center gap-2 font-bold ${isRTL ? 'justify-end text-right' : 'justify-start text-left'}`}>
          <Icon name="pin" aria-hidden="true" size={18} className="text-muted-foreground" />
          <span>{t('locationPickerTitle')}</span>
        </div>
        <div className={isRTL ? 'text-right text-muted-foreground' : 'text-left text-muted-foreground'}>
          {t('locationPickerSubtitle')}
        </div>
      </div>
    </div>
  );
}
