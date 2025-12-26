'use client';

import { useEffect } from 'react';
import dynamic from 'next/dynamic';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import { Icon } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Incident } from '@/types';
import { IFRANE_COORDINATES, STATUS_LABELS, SEVERITY_COLORS } from '@/utils/constants';
import { formatDate } from '@/utils/helpers';

// Fix for default marker icons in Next.js
import L from 'leaflet';
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface FireMapProps {
  incidents: Incident[];
}

const getMarkerColor = (status: string) => {
  switch (status) {
    case 'PENDING':
      return 'red';
    case 'IN_PROGRESS':
      return 'orange';
    case 'COMPLETED':
      return 'green';
    default:
      return 'red';
  }
};

function MapUpdater({ incidents }: { incidents: Incident[] }) {
  const map = useMap();

  useEffect(() => {
    if (incidents.length > 0) {
      const bounds = incidents.map(inc => [inc.latitude, inc.longitude] as [number, number]);
      if (bounds.length > 0) {
        map.fitBounds(bounds, { padding: [50, 50] });
      }
    }
  }, [incidents, map]);

  return null;
}

function FireMapContent({ incidents }: FireMapProps) {
  return (
    <MapContainer
      center={[IFRANE_COORDINATES.lat, IFRANE_COORDINATES.lng]}
      zoom={12}
      style={{ height: '100%', width: '100%' }}
      className="rounded-lg"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <MapUpdater incidents={incidents} />
      {incidents.map((incident) => {
        const iconUrl = `https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-${getMarkerColor(incident.status)}.png`;
        const customIcon = new Icon({
          iconUrl,
          shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
          iconSize: [25, 41],
          iconAnchor: [12, 41],
          popupAnchor: [1, -34],
          shadowSize: [41, 41]
        });

        return (
          <Marker
            key={incident.id}
            position={[incident.latitude, incident.longitude]}
            icon={customIcon}
          >
            <Popup>
              <div className="p-2">
                <h3 className="font-bold text-lg mb-2">حادث حريق</h3>
                <div className="space-y-1 text-sm">
                  <p>
                    <span className="font-semibold">الحالة:</span>{' '}
                    <span className={`px-2 py-1 rounded ${
                      incident.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                      incident.status === 'IN_PROGRESS' ? 'bg-orange-100 text-orange-800' :
                      'bg-green-100 text-green-800'
                    }`}>
                      {STATUS_LABELS[incident.status]}
                    </span>
                  </p>
                  <p>
                    <span className="font-semibold">الشدة:</span>{' '}
                    <span className={SEVERITY_COLORS[incident.severity - 1]}>
                      {incident.severity}/5
                    </span>
                  </p>
                  <p>
                    <span className="font-semibold">السبب:</span>{' '}
                    {incident.cause.replace(/_/g, ' ')}
                  </p>
                  <p>
                    <span className="font-semibold">التاريخ:</span>{' '}
                    {formatDate(incident.createdAt)}
                  </p>
                  {incident.description && (
                    <p className="mt-2 text-gray-700">{incident.description}</p>
                  )}
                </div>
              </div>
            </Popup>
          </Marker>
        );
      })}
    </MapContainer>
  );
}

// Export with SSR disabled
const FireMap = dynamic(() => Promise.resolve(FireMapContent), {
  ssr: false,
  loading: () => (
    <div className="h-full w-full flex items-center justify-center bg-gray-100 rounded-lg">
      <p className="text-gray-600">جاري تحميل الخريطة...</p>
    </div>
  ),
});

export default FireMap;
