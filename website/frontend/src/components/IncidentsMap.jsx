import React from 'react';
import "leaflet/dist/leaflet.css";
import { MapContainer, TileLayer, GeoJSON } from 'react-leaflet';
import MapLayers from './MapLayers';

const IncidentsMap = () => {

const defaultCoords = [33.537600, -5.106647];

  return (
    <div className='min-h-screen flex items-center justify-center'>
          <MapContainer
            center={defaultCoords}
            zoom={15}
            dragging={true}
            doubleClickZoom={true}
            scrollWheelZoom={true}
            attributionControl={true}
            zoomControl={true}
            
           className=" rounded-xl shadow-lg"  
            >
            <TileLayer
      url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
      attribution='&copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
      minZoom={0}
      maxZoom={20}
    />

      <MapLayers/>

    </MapContainer>
    </div>
  );
};

export default IncidentsMap;