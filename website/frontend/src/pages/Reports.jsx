import React, { useState } from 'react';
import {
  TextField,
  Button,
  Typography,
  Box,
  Container
} from '@mui/material';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';

import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

const markerIcon = new L.Icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41]
});

const LocationSelector = ({ position, setPosition }) => {
  useMapEvents({
    click(e) {
      setPosition([e.latlng.lat, e.latlng.lng]);
      console.log(position)
    }
  });

  return position ? <Marker position={position} icon={markerIcon} /> : null;
};

const Reports = () => {
  const [position, setPosition] = useState(null);
  const [datetime, setDatetime] = useState(new Date());
  const [files, setFiles] = useState([]);
  const [comment, setComment] = useState('');
  const [manualLocation, setManualLocation] = useState('');

  const handleFileChange = (e) => {
    setFiles(Array.from(e.target.files));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log({
      location: manualLocation || position,
      datetime,
      files,
      comment
    });
  };

  return (
    <Container maxWidth="xl" sx={{ bgcolor: "aliceblue" }}>
      <Typography variant="h4" align="center" fontWeight="bold" gutterBottom>
        Report An Incident
      </Typography>

      <Box
        sx={{
          display: 'flex',
          flexDirection: { xs: 'column', md: 'row' },
          gap: 4,
          mt: 4
        }}
      >
        {/* LEFT SIDE: FORM */}
        <Box
          component="form"
          onSubmit={handleSubmit}
          sx={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            placeContent: "center",
            gap: 2
          }}
        >
          <TextField
            label="Enter Location (optional)"
            placeholder="City, district, etc."
            value={manualLocation}
            onChange={(e) => setManualLocation(e.target.value)}
            variant="filled"
          />

          <Typography variant="subtitle1">
            Or select your location on the map:
          </Typography>

          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <DateTimePicker
              label="Date and Time of Incident"
              value={datetime}
              onChange={setDatetime}
              sx={{ mt: 1, width: 'fit-content' }}
            />
          </LocalizationProvider>

          <Button
            variant="contained"
            component="label"
            size="large"
            sx={{ my: 1, bgcolor: '#108b8b', width: 'fit-content' }}
          >
            Upload Photos or Files
            <input hidden multiple type="file" onChange={handleFileChange} />
          </Button>

          {files.length > 0 && (
            <Typography variant="body2">
              {files.length} file(s) selected
            </Typography>
          )}

          <TextField
            label="Additional Comments"
            multiline
            rows={4}
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            variant="filled"
          />

          <Button
            type="submit"
            variant="contained"
            size="large"
            sx={{ my: 2, bgcolor: '#108b8b', width: 'fit-content' }}
          >
            Submit Report
          </Button>
        </Box>

        {/* RIGHT SIDE: WIDER MAP */}
        <Box sx={{ flex: 1.3, height: 800, borderRadius: 2, overflow: 'hidden' }}>
          <MapContainer
            center={[33.537600, -5.106647]} // Casablanca default
            zoom={17}
            dragging={true}
            doubleClickZoom={true}
            scrollWheelZoom={true}
            attributionControl={true}
            zoomControl={true}
          >
            <TileLayer
              url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
              attribution='&copy; Esri — Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
            />
            <LocationSelector position={position} setPosition={setPosition} />
          </MapContainer>
        </Box>
      </Box>
    </Container>
  );
};

export default Reports;
