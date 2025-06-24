import React from 'react';

const Incident = ({ location, cause, report }) => {
  return (
    <div style={{ border: '4px solid #ccc', padding: '12px', marginBottom: '10px', borderRadius: '6px' }}>
      <p><strong>Location:</strong> Lat: {location.lat}, Lng: {location.lng}</p>
      <p><strong>Cause:</strong> {cause}</p>
      <p><strong>Report:</strong> {report}</p>
    </div>
  );
};

export default Incident;
