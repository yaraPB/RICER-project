import React, { useEffect, useState } from 'react';
import { Box, Card, CardContent, Typography, CircularProgress } from '@mui/material';

const WindIcon = ({ direction }) => (
  <svg
    style={{ transform: `rotate(${direction}deg)`, transition: 'transform 0.3s ease' }}
    xmlns="http://www.w3.org/2000/svg"
    width="48"
    height="48"
    viewBox="0 0 24 24"
    fill="none"
    stroke="#00796b"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <line x1="12" y1="19" x2="12" y2="5" />
    <polyline points="5 12 12 5 19 12" />
  </svg>
);


const TempIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="48"
    height="48"
    viewBox="0 0 24 24"
    fill="none"
    stroke="#d32f2f"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M14 14.76V3.5a2 2 0 0 0-4 0v11.26a4 4 0 1 0 4 0z" />
  </svg>
);

const WeatherAPI = () => {
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(true);
  const lat = 33.5333;
  const lon = -5.1083;

  useEffect(() => {
    const fetchWeather = async () => {
      try {
        const res = await fetch(
          `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&hourly=temperature_2m,wind_speed_10m,wind_direction_10m&current_weather=true&timezone=auto`
        );
        const data = await res.json();

        if (data.current_weather) {
          setWeather({
            temperature: data.current_weather.temperature,
            wind_speed: data.current_weather.windspeed,
            wind_direction: data.current_weather.winddirection,
          });
        } else {
          const lastIndex = data.hourly.time.length - 1;
          setWeather({
            temperature: data.hourly.temperature_2m[lastIndex],
            wind_speed: data.hourly.wind_speed_10m[lastIndex],
            wind_direction: data.hourly.wind_direction_10m[lastIndex],
          });
        }
        setLoading(false);
      } catch (err) {
        console.error('Error fetching weather:', err);
        setLoading(false);
      }
    };

    fetchWeather();
  }, []);

  if (loading) return <CircularProgress />;

  if (!weather) return <Typography color="error">Failed to load weather data.</Typography>;

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        gap: 3,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 3,
      }}
    >
      {/* Temperature Box */}
      <Card
        sx={{
          flex: 1,
          maxWidth: 280,
          backgroundColor: '#ffebee',
          borderRadius: '1.5rem',
          textAlign: 'center',
          boxShadow: 3,
          padding: 3,
        }}
      >
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Temperature
          </Typography>
          <TempIcon />
          <Typography variant="h4" sx={{ marginTop: 1 }}>
            {weather.temperature}°C
          </Typography>
        </CardContent>
      </Card>

      {/* Wind Box */}
      <Card
        sx={{
          flex: 1,
          maxWidth: 280,
          backgroundColor: '#e0f7fa',
          borderRadius: '1.5rem',
          textAlign: 'center',
          boxShadow: 3,
          padding: 3,
        }}
      >
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Wind
          </Typography>
          <WindIcon direction={weather.wind_direction} />
          <Typography variant="h4" sx={{ marginTop: 1 }}>
            {weather.wind_speed} m/s
          </Typography>
          <Typography variant="body2" sx={{ marginTop: 1 }}>
            Direction: {weather.wind_direction}°
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
};

export default WeatherAPI;
