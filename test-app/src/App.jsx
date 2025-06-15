import React, { useEffect } from 'react'
import "leaflet/dist/leaflet.css"
import L from 'leaflet'
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'
import useGeolocation from './hooks/useGeoLocation'

const defaultCoords = [33.525835, -5.109813];

const markers = [
  {
    geocode: [33.548221, -5.112304],
    popup: "Water Source - Ain Vitel"
  },
  {
    geocode: [33.51432877479629, -5.134799896014312],
    popup: "Camping Farah"
  },
  {
    geocode: [33.525856, -5.117086],
    popup: "Caserne de pompier"
  },
];

const customIcons = new L.Icon({
  iconUrl: "/forest-icon.png",
  iconSize: [38, 38],
});

// ✅ Component that moves the map when the user's position changes
const FlyToUserLocation = ({ position }) => {
  const map = useMap();

  useEffect(() => {
    map.flyTo(position, 15, {
      duration: 2,
    });
  }, [position, map]);

  return null;
};

const App = () => {
  const { position, permissionDenied } = useGeolocation(defaultCoords);

  return (
    <div>
      <h1>Map for forest fire emergency management</h1>
      {permissionDenied && (
        <p style={{ color: 'red' }}>
          Location permission denied. Using default map center.
        </p>
      )}

      <MapContainer
        center={defaultCoords}
        zoom={15}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <FlyToUserLocation position={position} />

        {markers.map((marker, i) => (
          <Marker key={i} position={marker.geocode} icon={customIcons}>
            <Popup>{marker.popup}</Popup>
          </Marker>
        ))}

        {/* Optional: marker for user's location */}
        {!permissionDenied && (
          <Marker position={position}>
            <Popup>You are here</Popup>
          </Marker>
        )}
      </MapContainer>
    </div>
  );
};

export default App;
