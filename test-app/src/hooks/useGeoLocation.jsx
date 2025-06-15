import { useState, useEffect } from 'react';

const useGeolocation = (defaultCoords) => {
  const [position, setPosition] = useState(defaultCoords);
  const [permissionDenied, setPermissionDenied] = useState(false);

  useEffect(() => {
    if (!navigator.geolocation) {
      console.warn("Geolocation not supported, using default.");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        setPosition([latitude, longitude]);
      },
      (err) => {
        console.warn("Geolocation error:", err.message);
        setPermissionDenied(true);
      }
    );
  }, []);

  return { position, permissionDenied };
};

export default useGeolocation;
