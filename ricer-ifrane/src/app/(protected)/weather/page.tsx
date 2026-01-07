'use client';

import { useEffect, useState } from 'react';
import { getWindDirection } from '@/utils/constants';
import type { WeatherData } from '@/types';

export default function WeatherPage() {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchWeather();
  }, []);

  const fetchWeather = async () => {
    try {
      const response = await fetch('/api/weather');
      if (!response.ok) throw new Error('Failed to fetch weather');
      const data = await response.json();
      setWeather(data);
    } catch (err) {
      setError('فشل في جلب بيانات الطقس');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto p-6">
        <div className="text-center py-12">جاري تحميل بيانات الطقس...</div>
      </div>
    );
  }

  if (error || !weather) {
    return (
      <div className="max-w-7xl mx-auto p-6">
        <div className="bg-red-50 text-red-600 p-4 rounded-lg text-center">
          {error}
        </div>
      </div>
    );
  }

  const windDirectionText = getWindDirection(weather.windDirection);

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          الطقس في إفران
        </h1>
        <p className="text-gray-600">
          بيانات الطقس الحالية لمدينة إفران، المغرب
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Temperature */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <span className="text-5xl">🌡️</span>
            <div className="text-right">
              <div className="text-sm text-gray-500 mb-1">درجة الحرارة</div>
              <div className="text-4xl font-bold text-red-600">
                {weather.temperature}°
              </div>
            </div>
          </div>
          <div className="text-sm text-gray-500 text-right">درجة مئوية</div>
        </div>

        {/* Wind Speed */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <span className="text-5xl">💨</span>
            <div className="text-right">
              <div className="text-sm text-gray-500 mb-1">سرعة الرياح</div>
              <div className="text-4xl font-bold text-blue-600">
                {weather.windSpeed}
              </div>
            </div>
          </div>
          <div className="text-sm text-gray-500 text-right">كم/ساعة</div>
        </div>

        {/* Wind Direction */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <span className="text-5xl">🧭</span>
            <div className="text-right">
              <div className="text-sm text-gray-500 mb-1">اتجاه الرياح</div>
              <div className="text-2xl font-bold text-green-600">
                {windDirectionText}
              </div>
            </div>
          </div>
          <div className="text-sm text-gray-500 text-right">
            {weather.windDirection}°
          </div>
        </div>
      </div>

      {/* Weather Alert */}
      <div className="mt-8 bg-gradient-to-r from-orange-50 to-red-50 rounded-xl p-6 border border-orange-200">
        <div className="flex items-start gap-4">
          <span className="text-3xl">⚠️</span>
          <div className="flex-1 text-right">
            <h3 className="font-bold text-lg text-gray-900 mb-2">
              تحذير من خطر الحرائق
            </h3>
            <p className="text-gray-700">
              {weather.windSpeed > 20
                ? 'سرعة الرياح مرتفعة - خطر حريق متزايد. يرجى توخي الحذر الشديد.'
                : weather.temperature > 30
                ? 'درجة حرارة مرتفعة - خطر حريق متوسط. يرجى الحذر عند التعامل مع النار.'
                : 'الظروف الجوية مناسبة حاليا. استمر في اتباع إرشادات السلامة.'}
            </p>
          </div>
        </div>
      </div>

      {/* Last Update */}
      <div className="mt-6 text-center text-sm text-gray-500">
        آخر تحديث: {new Date(weather.timestamp).toLocaleString('ar-MA')}
      </div>
    </div>
  );
}
