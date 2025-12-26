'use client';

import dynamic from 'next/dynamic';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { Icon } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { TruckDeployment } from '@/types';
import { IFRANE_COORDINATES } from '@/utils/constants';

interface TruckMapProps {
  trucks: TruckDeployment[];
}

function TruckMapContent({ trucks }: TruckMapProps) {
  const getTruckIcon = (status: string) => {
    const color = status === 'Disponible' ? 'blue' : status === 'En route' ? 'orange' : 'green';
    return new Icon({
      iconUrl: `https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-${color}.png`,
      shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      shadowSize: [41, 41]
    });
  };

  return (
    <div>
      <div className="flex space-x-reverse space-x-4 mb-4 justify-end">
        <div className="flex items-center">
          <span className="text-sm mr-2">متاح</span>
          <div className="w-4 h-4 bg-blue-500 rounded-full"></div>
        </div>
        <div className="flex items-center">
          <span className="text-sm mr-2">في الطريق</span>
          <div className="w-4 h-4 bg-orange-500 rounded-full"></div>
        </div>
        <div className="flex items-center">
          <span className="text-sm mr-2">في الموقع</span>
          <div className="w-4 h-4 bg-green-500 rounded-full"></div>
        </div>
      </div>

      <div className="h-96 rounded-lg overflow-hidden">
        <MapContainer
          center={[IFRANE_COORDINATES.lat, IFRANE_COORDINATES.lng]}
          zoom={12}
          style={{ height: '100%', width: '100%' }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {trucks.map((truck) => (
            <Marker
              key={truck.id}
              position={[truck.latitude, truck.longitude]}
              icon={getTruckIcon(truck.status)}
            >
              <Popup>
                <div className="p-2 text-right">
                  <h3 className="font-bold">{truck.truckName}</h3>
                  <p className="text-sm">الرقم التعريفي: {truck.truckId}</p>
                  <p className="text-sm">الحالة: {truck.status}</p>
                  {truck.assignedTo && (
                    <p className="text-sm">المكلف بـ: {truck.assignedTo}</p>
                  )}
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>
    </div>
  );
}

const TruckMap = dynamic(() => Promise.resolve(TruckMapContent), {
  ssr: false,
  loading: () => (
    <div className="h-96 bg-gray-100 rounded-lg flex items-center justify-center">
      <p className="text-gray-600">جاري التحميل...</p>
    </div>
  ),
});

export default TruckMap;
