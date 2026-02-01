'use client';

import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { IFRANE_COORDINATES } from '@/utils/constants';
import type { TruckDeployment } from '@/types';
import { Icon } from '@/components/ui/Icon';

// Fix for default marker icons
const iconProto = L.Icon.Default.prototype as unknown as { _getIconUrl?: unknown };
delete iconProto._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

// Create custom truck icons
const createTruckIcon = (status: string) => {
  const color = status === 'Disponible' ? '#22c55e' : status === 'En route' ? '#f97316' : '#ef4444';

  return L.divIcon({
    className: 'custom-truck-marker',
    html: `<div style="
      background-color: ${color};
      width: 40px;
      height: 40px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      border: 3px solid white;
      box-shadow: 0 2px 8px rgba(0,0,0,0.3);
    "><div style="
      width: 14px;
      height: 14px;
      border-radius: 9999px;
      background: rgba(255,255,255,0.9);
    "></div></div>`,
    iconSize: [40, 40],
    iconAnchor: [20, 20],
  });
};

interface TruckMapProps {
  trucks: TruckDeployment[];
}

export default function TruckMap({ trucks }: TruckMapProps) {
  return (
    <div className="relative">
      <MapContainer
        center={[IFRANE_COORDINATES.lat, IFRANE_COORDINATES.lng]}
        zoom={13}
        style={{ height: '500px', width: '100%' }}
        className="rounded-lg shadow-lg z-0"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {trucks.map((truck) => (
          <Marker
            key={truck.id}
            position={[truck.latitude, truck.longitude]}
            icon={createTruckIcon(truck.status)}
          >
            <Popup>
              <div className="text-right" dir="rtl">
                <div className="font-bold text-lg mb-2">{truck.truckName}</div>
                <div className="text-sm space-y-1">
                  <div>
                    <span className="font-medium">رقم الشاحنة:</span>{' '}
                    {truck.truckId}
                  </div>
                  <div>
                    <span className="font-medium">الحالة:</span>{' '}
                    <span
                      className={`font-bold ${
                        truck.status === 'Disponible'
                          ? 'text-green-600'
                          : truck.status === 'En route'
                          ? 'text-orange-600'
                          : 'text-red-600'
                      }`}
                    >
                      {truck.status}
                    </span>
                  </div>
                  {truck.assignedTo && (
                    <div>
                      <span className="font-medium">موزعة على:</span>{' '}
                      {truck.assignedTo}
                    </div>
                  )}
                  <div className="text-xs text-gray-500 mt-2">
                    {truck.latitude.toFixed(6)}, {truck.longitude.toFixed(6)}
                  </div>
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>

      {/* Legend */}
      <div className="absolute bottom-6 left-6 bg-white rounded-lg shadow-lg p-4 z-[1000]">
        <div className="text-sm font-bold mb-3 text-right">حالات الشاحنات</div>
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <div className="text-green-600">
              <Icon name="truck" aria-hidden="true" size={20} />
            </div>
            <span className="text-sm">Disponible (متاحة)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="text-orange-600">
              <Icon name="truck" aria-hidden="true" size={20} />
            </div>
            <span className="text-sm">En route (في الطريق)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="text-red-600">
              <Icon name="truck" aria-hidden="true" size={20} />
            </div>
            <span className="text-sm">Sur place (في الموقع)</span>
          </div>
        </div>
      </div>
    </div>
  );
}
