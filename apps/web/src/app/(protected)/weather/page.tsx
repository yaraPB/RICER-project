'use client';

import { useCallback, useEffect, useState } from 'react';
import type { WeatherData } from '@/types';
import { Icon } from '@/components/ui/Icon';
import { useTranslation } from '@/hooks/useTranslation';

export default function WeatherPage() {
  const { t, language } = useTranslation();
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchWeather = useCallback(async () => {
    try {
      const response = await fetch('/api/weather');
      if (!response.ok) throw new Error('Failed to fetch weather');
      const data = await response.json();
      setWeather(data);
    } catch {
      setError('weatherLoadFailed'); // Store key, not translated message
    } finally {
      setLoading(false);
    }
  }, []); // Remove [t] dependency

  useEffect(() => {
    fetchWeather();
  }, [fetchWeather]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto p-6">
        <div className="text-center py-12">{t('weatherLoading')}</div>
      </div>
    );
  }

  if (error || !weather) {
    return (
      <div className="max-w-7xl mx-auto p-6">
        <div className="bg-red-50 text-red-600 p-4 rounded-lg text-center">
          {t(error)} {/* Translate error key in render */}
        </div>
      </div>
    );
  }

  const directionKeys = ['windN', 'windNE', 'windE', 'windSE', 'windS', 'windSW', 'windW', 'windNW'] as const;
  const directionIndex = Math.round(weather.windDirection / 45) % 8;
  const windDirectionText = t(directionKeys[directionIndex]);
  const isRTL = language === 'ar';
  const textAlign = isRTL ? 'text-right' : 'text-left';

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="mb-8">
        <h1 className={`text-3xl font-bold text-gray-900 mb-2 ${textAlign}`}>{t('weatherTitle')}</h1>
        <p className={`text-gray-600 ${textAlign}`}>{t('weatherSubtitle')}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Temperature */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <span className="text-red-600">
              <Icon name="thermostat" aria-hidden={true} size={40} />
            </span>
            <div className={textAlign}>
              <div className="text-sm text-gray-500 mb-1">{t('temperature')}</div>
              <div className="text-4xl font-bold text-red-600">
                {weather.temperature}°
              </div>
            </div>
          </div>
          <div className={`text-sm text-gray-500 ${textAlign}`}>{t('temperatureUnit')}</div>
        </div>

        {/* Wind Speed */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <span className="text-blue-600">
              <Icon name="air" aria-hidden={true} size={40} />
            </span>
            <div className={textAlign}>
              <div className="text-sm text-gray-500 mb-1">{t('windSpeed')}</div>
              <div className="text-4xl font-bold text-blue-600">
                {weather.windSpeed}
              </div>
            </div>
          </div>
          <div className={`text-sm text-gray-500 ${textAlign}`}>{t('windSpeedUnit')}</div>
        </div>

        {/* Wind Direction */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <span className="text-green-600">
              <Icon name="compass" aria-hidden={true} size={40} />
            </span>
            <div className={textAlign}>
              <div className="text-sm text-gray-500 mb-1">{t('windDirection')}</div>
              <div className="text-2xl font-bold text-green-600">
                {windDirectionText}
              </div>
            </div>
          </div>
          <div className={`text-sm text-gray-500 ${textAlign}`}>
            {weather.windDirection}°
          </div>
        </div>
      </div>

      {/* Weather Alert */}
      <div className="mt-8 bg-gradient-to-r from-orange-50 to-red-50 rounded-xl p-6 border border-orange-200">
        <div className="flex items-start gap-4">
          <span className="text-warning">
            <Icon name="warning" aria-hidden={true} size={28} />
          </span>
          <div className={`flex-1 ${textAlign}`}>
            <h3 className="font-bold text-lg text-gray-900 mb-2">{t('windAlertTitle')}</h3>
            <p className="text-gray-700">
              {weather.windSpeed > 20
                ? t('windAlertHigh')
                : weather.temperature > 30
                ? t('windAlertHot')
                : t('windAlertOk')}
            </p>
          </div>
        </div>
      </div>

      {/* Last Update */}
      <div className="mt-6 text-center text-sm text-gray-500">
        {t('lastUpdatedLabel')}: {new Date(weather.timestamp).toLocaleString(language === 'ar' ? 'ar-MA' : 'fr-FR')}
      </div>
    </div>
  );
}
