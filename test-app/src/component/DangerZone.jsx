import React from 'react';
import { Circle } from 'react-leaflet';

const DangerZones = ({ zones }) => {
  return (
    <>
      {zones.map((zone, i) => (
        <Circle
          key={i}
          center={zone.center}
          radius={zone.radius}
          pathOptions={{
            color: 'red',
            fillColor: 'red',
            fillOpacity: 0.3
          }}
        />
      ))}
    </>
  );
};

export default DangerZones;
