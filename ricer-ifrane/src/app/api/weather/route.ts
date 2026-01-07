import { NextResponse } from 'next/server';
import { IFRANE_COORDINATES } from '@/utils/constants';

export async function GET() {
  try {
    const { lat, lng } = IFRANE_COORDINATES;

    const response = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&current=temperature_2m,wind_speed_10m,wind_direction_10m&timezone=Africa/Casablanca`
    );

    if (!response.ok) {
      throw new Error('Failed to fetch weather data');
    }

    const data = await response.json();

    return NextResponse.json({
      temperature: data.current.temperature_2m,
      windSpeed: data.current.wind_speed_10m,
      windDirection: data.current.wind_direction_10m,
      timestamp: data.current.time,
    });
  } catch (error) {
    console.error('Weather API error:', error);
    return NextResponse.json(
      { error: 'فشل في جلب بيانات الطقس' },
      { status: 500 }
    );
  }
}
