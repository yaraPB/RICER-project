'use client';

import { useState } from 'react';
import ReactMapGL, { Marker, Popup } from 'react-map-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { IFRANE_COORDINATES } from '@/config/constants';
import type { TruckDeployment } from '@/types';
import { Icon } from '@/components/ui/Icon';
import { getMapStyle } from '@/lib/map/styles';
import { TRUCK_STATUS_COLORS } from '@/lib/map/colors';

const truckColor = (status: string) => {
  return TRUCK_STATUS_COLORS[status] || '#ef4444';
};

interface TruckMapProps {
  trucks: TruckDeployment[];
}

export default function TruckMap({ trucks }: TruckMapProps) {
  const [popupTruckId, setPopupTruckId] = useState<string | null>(null);

  const mapStyle = getMapStyle('streets');

  return (
    <div className="relative">
      <ReactMapGL
        longitude={IFRANE_COORDINATES.lng}
        latitude={IFRANE_COORDINATES.lat}
        zoom={13}
        mapStyle={mapStyle as string}
        style={{ width: '100%', height: '500px', borderRadius: '0.5rem', boxShadow: '0 10px 25px -5px rgb(0 0 0 / 0.1)' }}
      >
        {trucks.map((truck) => (
          <Marker
            key={truck.id}
            longitude={truck.longitude}
            latitude={truck.latitude}
            anchor="center"
            onClick={() => setPopupTruckId(popupTruckId === truck.id ? null : truck.id)}
          >
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: '999px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '3px solid white',
                boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
                backgroundColor: truckColor(truck.status),
                cursor: 'pointer',
              }}
            >
              <div
                style={{
                  width: 14,
                  height: 14,
                  borderRadius: '999px',
                  background: 'rgba(255,255,255,0.9)',
                }}
              />
            </div>
          </Marker>
        ))}

        {popupTruckId && (() => {
          const truck = trucks.find((t) => t.id === popupTruckId);
          if (!truck) return null;
          return (
            <Popup
              longitude={truck.longitude}
              latitude={truck.latitude}
              anchor="bottom"
              closeButton={true}
              onClose={() => setPopupTruckId(null)}
              offset={[0, -14]}
            >
              <div className="text-right" dir="rtl" style={{ fontSize: 13 }}>
                <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 8 }}>{truck.truckName}</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <div>
                    <span style={{ fontWeight: 600 }}>رقم الشاحنة:</span> {truck.truckId}
                  </div>
                  <div>
                    <span style={{ fontWeight: 600 }}>الحالة:</span>{' '}
                    <span style={{ fontWeight: 800, color: truckColor(truck.status) }}>{truck.status}</span>
                  </div>
                  {truck.assignedTo && (
                    <div>
                      <span style={{ fontWeight: 600 }}>موزعة على:</span> {truck.assignedTo}
                    </div>
                  )}
                  <div style={{ marginTop: 8, fontSize: 12, opacity: 0.7 }}>
                    {truck.latitude.toFixed(6)}, {truck.longitude.toFixed(6)}
                  </div>
                </div>
              </div>
            </Popup>
          );
        })()}
      </ReactMapGL>

      {/* Legend */}
      <div className="absolute bottom-6 left-6 z-[1000] rounded-lg bg-white p-4 shadow-lg">
        <div className="mb-3 text-right text-sm font-bold">حالات الشاحنات</div>
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <div className="text-green-600">
              <Icon name="truck" aria-hidden={true} size={20} />
            </div>
            <span className="text-sm">Disponible (متاحة)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="text-orange-600">
              <Icon name="truck" aria-hidden={true} size={20} />
            </div>
            <span className="text-sm">En route (في الطريق)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="text-red-600">
              <Icon name="truck" aria-hidden={true} size={20} />
            </div>
            <span className="text-sm">Sur place (في الموقع)</span>
          </div>
        </div>
      </div>
    </div>
  );
}
