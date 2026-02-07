import { NextResponse } from 'next/server';
import { IFRANE_COORDINATES } from '@/config/constants';
import { withApiHandler } from '@/lib/errors/withApiHandler';
import { AppError } from '@/lib/errors/AppError';

type OpenMeteoResponse = {
  current: {
    temperature_2m: number;
    wind_speed_10m: number;
    wind_direction_10m: number;
    time: string;
  };
};

function isOpenMeteoResponse(value: unknown): value is OpenMeteoResponse {
  if (!value || typeof value !== 'object') return false;
  const current = (value as { current?: unknown }).current;
  if (!current || typeof current !== 'object') return false;
  const c = current as Record<string, unknown>;
  return (
    typeof c.temperature_2m === 'number' &&
    typeof c.wind_speed_10m === 'number' &&
    typeof c.wind_direction_10m === 'number' &&
    typeof c.time === 'string'
  );
}

export const GET = withApiHandler(async () => {
  const { lat, lng } = IFRANE_COORDINATES;

  const response = await fetch(
    `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&current=temperature_2m,wind_speed_10m,wind_direction_10m&timezone=Africa/Casablanca`
  );

  if (!response.ok) {
    throw new AppError(4002, { meta: { status: response.status } });
  }

  let data: unknown;
  try {
    data = await response.json();
  } catch (error) {
    throw new AppError(4002, { cause: error });
  }

  if (!isOpenMeteoResponse(data)) {
    throw new AppError(4002, { meta: { reason: 'invalid_payload' } });
  }

  return NextResponse.json({
    temperature: data.current.temperature_2m,
    windSpeed: data.current.wind_speed_10m,
    windDirection: data.current.wind_direction_10m,
    timestamp: data.current.time,
  });
});
