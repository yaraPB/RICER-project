'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { getWindDirection } from '@/utils/constants';
import type { WeatherData } from '@/types';

const FireMap = dynamic(() => import('@/components/map/FireMap'), {
  ssr: false,
  loading: () => <div className="h-[600px] flex items-center justify-center bg-gray-100 rounded-lg">جاري تحميل الخريطة...</div>,
});

export default function MapPage() {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [weatherLoading, setWeatherLoading] = useState(true);

  useEffect(() => {
    fetchWeather();
  }, []);

  const fetchWeather = async () => {
    try {
      const response = await fetch('/api/weather');
      if (response.ok) {
        const data = await response.json();
        setWeather(data);
      }
    } catch (err) {
      console.error('Failed to fetch weather:', err);
    } finally {
      setWeatherLoading(false);
    }
  };

  const windDirectionText = weather ? getWindDirection(weather.windDirection) : '';

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          خريطة الحرائق
          <span className="text-lg font-normal text-gray-600 mr-2">Carte des Incendies</span>
        </h1>
        <p className="text-gray-600">
          عرض جميع حوادث الحرائق المسجلة في منطقة إفران
          <span className="text-sm text-gray-500 mr-2">Voir tous les incidents d'incendie à Ifrane</span>
        </p>
      </div>

      {/* Weather Info Cards */}
      {!weatherLoading && weather && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {/* Temperature */}
          <div className="bg-gradient-to-br from-orange-50 to-red-50 rounded-lg shadow p-4 border border-orange-200">
            <div className="flex items-center justify-between">
              <span className="text-3xl">🌡️</span>
              <div className="text-right">
                <div className="text-xs text-gray-600 mb-1">
                  درجة الحرارة • Température
                </div>
                <div className="text-2xl font-bold text-red-600">
                  {weather.temperature}°C
                </div>
              </div>
            </div>
          </div>

          {/* Wind Speed */}
          <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-lg shadow p-4 border border-blue-200">
            <div className="flex items-center justify-between">
              <span className="text-3xl">💨</span>
              <div className="text-right">
                <div className="text-xs text-gray-600 mb-1">
                  سرعة الرياح • Vitesse du Vent
                </div>
                <div className="text-2xl font-bold text-blue-600">
                  {weather.windSpeed} km/h
                </div>
              </div>
            </div>
          </div>

          {/* Wind Direction */}
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg shadow p-4 border border-green-200">
            <div className="flex items-center justify-between">
              <span className="text-3xl">🧭</span>
              <div className="text-right">
                <div className="text-xs text-gray-600 mb-1">
                  اتجاه الرياح • Direction du vent
                </div>
                <div className="text-lg font-bold text-green-600">
                  {windDirectionText}
                </div>
                <div className="text-xs text-gray-500">{weather.windDirection}°</div>
              </div>
            </div>
          </div>
        </div>
      )}


      <FireMap />


      <div className='text-center text-2xl mt-4'>
        
      </div>
      <div  className='text-center text-xl underline text-blue-700 hover:scale-110'>
        <a href="http://sysfeu.com/" target="_blank">
        sysfeu.com
      </a>
      </div>
      

    </div>
  );
}
