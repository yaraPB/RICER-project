'use client';

import { useCallback, useState } from 'react';
import ReactMapGL, { Marker, type MapMouseEvent } from 'react-map-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { IFRANE_COORDINATES } from '@/config/constants';
import { Icon } from '@/components/ui/Icon';
import { useTranslation } from '@/hooks/useTranslation';
import { getMapStyle } from '@/lib/map/styles';

interface LocationPickerProps {
  onLocationSelect: (lat: number, lng: number) => void;
  selectedLocation?: { lat: number; lng: number };
}

export default function LocationPicker({ onLocationSelect, selectedLocation }: LocationPickerProps) {
  const { t, language } = useTranslation();
  const isRTL = language === 'ar';
  const [mapReady, setMapReady] = useState(false);

  const handleClick = useCallback(
    (event: MapMouseEvent) => {
      if (event.lngLat) {
        onLocationSelect(event.lngLat.lat, event.lngLat.lng);
      }
    },
    [onLocationSelect]
  );

  const mapStyle = getMapStyle('streets');

  return (
    <div className="relative" data-map-ready={mapReady ? 'true' : undefined}>
      <ReactMapGL
        longitude={IFRANE_COORDINATES.lng}
        latitude={IFRANE_COORDINATES.lat}
        zoom={13}
        mapStyle={mapStyle as string}
        onClick={handleClick}
        style={{ width: '100%', height: '400px', borderRadius: '0.5rem', boxShadow: '0 10px 25px -5px rgb(0 0 0 / 0.1)' }}
        onLoad={() => setMapReady(true)}
      >
        {selectedLocation && (
          <Marker longitude={selectedLocation.lng} latitude={selectedLocation.lat} anchor="center">
            <div
              style={{
                width: 18,
                height: 18,
                borderRadius: '999px',
                background: 'white',
                border: '3px solid #0ea5e9',
                boxShadow: '0 2px 10px rgba(0,0,0,0.28)',
              }}
            />
          </Marker>
        )}
      </ReactMapGL>

      <div
        className={`absolute top-4 ${isRTL ? 'right-4' : 'left-4'} z-[1000] rounded-lg border border-border bg-surface px-3 py-2 shadow-elev-1 text-sm`}
        dir={isRTL ? 'rtl' : 'ltr'}
      >
        <div className={`mb-1 flex items-center gap-2 font-bold ${isRTL ? 'justify-end text-right' : 'justify-start text-left'}`}>
          <Icon name="pin" aria-hidden={true} size={18} className="text-muted-foreground" />
          <span>{t('locationPickerTitle')}</span>
        </div>
        <div className={isRTL ? 'text-right text-muted-foreground' : 'text-left text-muted-foreground'}>
          {t('locationPickerSubtitle')}
        </div>
      </div>
    </div>
  );
}
