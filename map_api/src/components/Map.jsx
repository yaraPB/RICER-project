import React from 'react';
import "leaflet/dist/leaflet.css";
import { MapContainer, TileLayer } from 'react-leaflet';
import FireMarker from '../components/FireMarker';

const Map = () => {

const defaultCoords = [33.537600, -5.106647];

  return (
    <div className='min-h-screen flex items-center justify-center'>
          <MapContainer
            center={defaultCoords}
            zoom={18}
            
           className=" rounded-xl shadow-lg"  
            >
            <TileLayer
      url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
      attribution='&copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
      minZoom={0}
      maxZoom={20}
    />

    <FireMarker position={[33.534229, -5.108965]} />

    </MapContainer>
    </div>
  );
};

export default Map;