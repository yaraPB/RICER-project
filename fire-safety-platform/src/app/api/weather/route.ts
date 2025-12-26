import { NextResponse } from 'next/server';
import { IFRANE_COORDINATES } from '@/utils/constants';

export async function GET() {
  try {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${IFRANE_COORDINATES.lat}&longitude=${IFRANE_COORDINATES.lng}&current=temperature_2m,wind_speed_10m,wind_direction_10m&timezone=Africa%2FCasablanca`;

    const response = await fetch(url);
    const data = await response.json();

    if (!data.current) {
      throw new Error('Invalid weather data');
    }

    return NextResponse.json({
      temperature: data.current.temperature_2m,
      windSpeed: data.current.wind_speed_10m,
      windDirection: data.current.wind_direction_10m,
    });
  } catch (error) {
    console.error('Weather API error:', error);
    return NextResponse.json(
      { error: 'حدث خطأ أثناء استرجاع بيانات الطقس' },
      { status: 500 }
    );
  }
}
