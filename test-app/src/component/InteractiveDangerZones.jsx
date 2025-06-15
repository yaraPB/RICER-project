import React, { useState } from 'react';
import { Circle, Popup, useMapEvents } from 'react-leaflet';

const InteractiveDangerZones = () => {
  const [zones, setZones] = useState([]);

  useMapEvents({
    click(e) {
      const { lat, lng } = e.latlng;
      const newZone = { center: [lat, lng], radius: 300 };
      setZones((currentZones) => [...currentZones, newZone]);
    },
  });

  const deleteZone = (index) => {
    setZones((currentZones) => currentZones.filter((_, i) => i !== index));
  };

  return (
    <>
      {zones.map((zone, i) => (
        <Circle
          key={i}
          center={zone.center}
          radius={zone.radius}
          pathOptions={{ color: 'orange', fillColor: 'yellow', fillOpacity: 0.5 }}
        >
          <Popup>
            Danger Zone #{i + 1}
            <br />
            <button onClick={() => deleteZone(i)}>Delete</button>
          </Popup>
        </Circle>
      ))}
    </>
  );
};

export default InteractiveDangerZones;
