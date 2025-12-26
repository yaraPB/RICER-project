'use client';

import { useEffect, useState } from 'react';
import { WeatherData } from '@/types';
import { getWindDirection } from '@/utils/helpers';

export default function WeatherDisplay() {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchWeather();
  }, []);

  const fetchWeather = async () => {
    try {
      const res = await fetch('/api/weather');
      if (!res.ok) throw new Error('حدث خطأ أثناء جلب بيانات الطقس');
      const data = await res.json();
      setWeather(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-8 text-center">
        <p className="text-gray-600">جاري تحميل بيانات الطقس...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 rounded-lg shadow-lg p-8">
        <p className="text-red-800">{error}</p>
      </div>
    );
  }

  if (!weather) return null;

  return (
    <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg shadow-lg p-8 text-white">
      <h2 className="text-3xl font-bold mb-6 flex items-center justify-end">
        <span className="mr-3">🌤️</span>
        الطقس في إفران
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white bg-opacity-20 rounded-lg p-6 backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <span className="text-5xl">🌡️</span>
            <div className="text-right">
              <p className="text-sm opacity-90">درجة الحرارة</p>
              <p className="text-4xl font-bold mt-2">{weather.temperature}°</p>
            </div>
          </div>
        </div>

        <div className="bg-white bg-opacity-20 rounded-lg p-6 backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <span className="text-5xl">💨</span>
            <div className="text-right">
              <p className="text-sm opacity-90">سرعة الرياح</p>
              <p className="text-4xl font-bold mt-2">{weather.windSpeed}</p>
              <p className="text-sm opacity-75">كم/س</p>
            </div>
          </div>
        </div>

        <div className="bg-white bg-opacity-20 rounded-lg p-6 backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <span className="text-5xl">🧭</span>
            <div className="text-right">
              <p className="text-sm opacity-90">اتجاه الرياح</p>
              <p className="text-4xl font-bold mt-2">
                {getWindDirection(weather.windDirection)}
              </p>
              <p className="text-sm opacity-75 mt-1">{weather.windDirection}°</p>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6 bg-white bg-opacity-20 rounded-lg p-4 backdrop-blur-sm">
        <p className="text-sm opacity-90 text-right">
          ⚠️ <strong>تحذير:</strong> الرياح القوية قد تزيد من خطر الحرائق
        </p>
      </div>
    </div>
  );
}
