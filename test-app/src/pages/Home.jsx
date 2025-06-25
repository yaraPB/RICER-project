import React, { useEffect  } from 'react'
import "leaflet/dist/leaflet.css"
import L from 'leaflet'
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'
import useGeolocation from '../hooks/useGeoLocation'
import DangerZones from '../component/DangerZone'
import InteractiveDangerZones from '../component/InteractiveDangerZones'
import Incident from '../component/Incident'

const defaultCoords = [33.525835, -5.109813];

const markers = [
  {
    geocode: [33.548221, -5.112304],
    popup: "Water Source - Ain Vitel",
    icon: "/water-icon.png"
  },
  {
    geocode: [33.51432877479629, -5.134799896014312],
    popup: "Camping Farah",
    icon: "/camping-area-icon.png"
  },
  {
    geocode: [33.525856, -5.117086],
    popup: "Caserne de pompier",
    icon: "/fire-station-icon.png"
  },
  {
    geocode: [33.49291, -5.178666],
    popup: "Barrage Ben Smim",
    icon: "/water-icon.png"
  },
];

const dangerZones = [
  {
    center: [33.54536, -5.10800],
    radius: 300, // in meters
  },
  {
    center: [33.51626, -5.10452],
    radius: 900,
  },
];

const FlyToUserLocation = ({ position }) => {
  const map = useMap();

  useEffect(() => {
    map.flyTo(position, 15, {
      duration: 2,
    });
  }, [position, map]);

  return null;
};

const Home = () => {
  const { position, permissionDenied } = useGeolocation(defaultCoords);

  const incidents = [
  {
    location: { lat: 33.5731, lng: -7.5898 },
    cause: 'Man-made',
    report: 'Fire started near a campsite due to unattended fire.'
  },
  {
    location: { lat: 33.5920, lng: -7.6123 },
    cause: 'Natural',
    report: 'Lightning strike caused forest fire.'
  }
];

  return (
    <div className='bg-[aliceblue]'>
      {permissionDenied && (
        <p style={{ color: 'red' }}>
          Location permission denied. Using default map center.
        </p>
      )}

      <MapContainer
        center={defaultCoords}
        zoom={12}>
        <TileLayer
  url="https://tiles.stadiamaps.com/tiles/alidade_satellite/{z}/{x}/{y}{r}.jpg"
  attribution='&copy; CNES, Distribution Airbus DS, © Airbus DS, © PlanetObserver (Contains Copernicus Data) | &copy; <a href="https://www.stadiamaps.com/" target="_blank">Stadia Maps</a> &copy; <a href="https://openmaptiles.org/" target="_blank">OpenMapTiles</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
  minZoom={0}
  maxZoom={20}
/>


        <FlyToUserLocation position={position} />

        {markers.map((marker, i) => {
        const customIcon = new L.Icon({
          iconUrl: marker.icon,
          iconSize: [38, 38],
          iconAnchor: [19, 38],
          popupAnchor: [0, -38],
        });

        return (
          <Marker key={i} position={marker.geocode} icon={customIcon}>
            <Popup>{marker.popup}</Popup>
          </Marker>
        );
      })}

        {/* Optional: marker for user's location */}
        {!permissionDenied && (
          <Marker position={position}>
            <Popup>You are here</Popup>
          </Marker>
        )}

    <DangerZones zones={dangerZones} />
    <InteractiveDangerZones />        
  </MapContainer>

  <div className='p-4'>
        <h2 >Fire Incidents Report</h2>
        {incidents.map((incident, index) => (
          <Incident
            key={index}
            location={incident.location}
            cause={incident.cause}
            report={incident.report}
          />
        ))}
  </div>

    </div>
  );
};

export default Home;
