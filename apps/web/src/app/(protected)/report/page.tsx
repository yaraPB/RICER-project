'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslation } from '@/hooks/useTranslation';
import dynamic from 'next/dynamic';
import { FIRE_CAUSE_KEYS } from '@/config/constants';
import type { TranslationKey } from '@/i18n/translations';
import { Icon } from '@/components/ui/Icon';
import { getApiErrorUserMessage } from '@/lib/errors/sdk';

function LocationPickerLoading() {
  const { t } = useTranslation();
  return (
    <div className="h-[400px] flex items-center justify-center bg-gray-100 rounded-lg">
      {t('loadingMap')}
    </div>
  );
}

const LocationPicker = dynamic(
  () => import('@/components/map/LocationPicker'),
  {
    ssr: false,
    loading: () => <LocationPickerLoading />,
  }
);

export default function ReportPage() {
  const router = useRouter();
  const { t, language } = useTranslation();
  const [formData, setFormData] = useState({
    location: null as { lat: number; lng: number } | null,
    description: '',
    cause: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const isRTL = language === 'ar';
  const textAlign = isRTL ? 'text-right' : 'text-left';

  const handleLocationSelect = (lat: number, lng: number) => {
    setFormData({ ...formData, location: { lat, lng } });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!formData.location) {
      setError(t('locationRequired'));
      return;
    }

    if (!formData.description.trim()) {
      setError(t('descriptionRequired'));
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          latitude: formData.location.lat,
          longitude: formData.location.lng,
          description: formData.description,
          cause: formData.cause || 'UNKNOWN',
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(getApiErrorUserMessage(data, t('errorServer')));
        return;
      }

      setSuccess(true);
      setTimeout(() => {
        router.push('/reports-list');
      }, 2000);
    } catch {
      setError(t('connectionError'));
    } finally {
      setLoading(false);
    }
  };

  const getCauseLabel = (causeKey: string) => {
    const causeMap: Record<string, TranslationKey> = {
      'CAMPFIRE_UNATTENDED': 'campfireUnattended',
      'CIGARETTE': 'cigarette',
      'AGRICULTURAL_BURNING': 'agriculturalBurning',
      'ELECTRICAL': 'electrical',
      'LIGHTNING': 'lightning',
      'ARSON': 'arson',
      'EQUIPMENT_MALFUNCTION': 'equipmentMalfunction',
      'OTHER': 'other',
      'UNKNOWN': 'unknown',
    };
    return t(causeMap[causeKey] ?? 'unknown');
  };

  if (success) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-green-50 border border-green-200 rounded-lg p-8 text-center">
          <div className="text-6xl mb-4">✅</div>
          <h2 className="text-2xl font-bold text-green-800 mb-2">
            {t('reportSuccess')}
          </h2>
          <p className="text-green-700">{t('redirecting')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-8">
        <h1 className={`text-3xl font-bold text-gray-900 mb-2 ${textAlign}`}>
          {t('reportFireTitle')}
        </h1>
        <p className={`text-gray-600 ${textAlign}`}>
          {t('reportFireDesc')}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6" noValidate>
        {error && (
          <div className={`bg-red-50 text-red-600 p-4 rounded-lg ${textAlign}`}>
            {error}
          </div>
        )}

        {/* Location Picker */}
        <div>
          <label className={`block text-lg font-medium text-gray-700 mb-3 ${textAlign}`}>
            {t('fireLocation')}
          </label>
          <LocationPicker
            onLocationSelect={handleLocationSelect}
            selectedLocation={formData.location || undefined}
          />
          {formData.location && (
            <div className={`mt-2 text-sm text-gray-600 ${textAlign}`}>
              {t('selectedLocation')}: {formData.location.lat.toFixed(6)},{' '}
              {formData.location.lng.toFixed(6)}
            </div>
          )}
        </div>

        {/* Description */}
        <div>
          <label className={`block text-lg font-medium text-gray-700 mb-3 ${textAlign}`}>
            {t('fireDescription')}
          </label>
          <textarea
            value={formData.description}
            onChange={(e) =>
              setFormData({ ...formData, description: e.target.value })
            }
            className={`w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent ${textAlign}`}
            rows={5}
            placeholder={t('descriptionPlaceholder')}
            required
          />
        </div>

        {/* Cause */}
        <div>
          <label className={`block text-lg font-medium text-gray-700 mb-3 ${textAlign}`}>
            {t('probableCause')}
          </label>
          <select
            value={formData.cause}
            onChange={(e) =>
              setFormData({ ...formData, cause: e.target.value })
            }
            className={`w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent ${textAlign}`}
          >
            <option value="">{t('selectCause')}</option>
            {FIRE_CAUSE_KEYS.map((key) => (
              <option key={key} value={key}>
                {getCauseLabel(key)}
              </option>
            ))}
          </select>
        </div>

        {/* Submit Button */}
        <div className="flex gap-4">
          <button
            type="button"
            onClick={() => router.back()}
            className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium py-3 rounded-lg transition-colors"
          >
            {t('cancel')}
          </button>
          <button
            type="submit"
            disabled={loading}
            className="flex-1 bg-red-600 hover:bg-red-700 disabled:bg-red-300 text-white font-medium py-3 rounded-lg transition-colors"
          >
            {loading ? (
              t('submitting')
            ) : (
              <span className="inline-flex items-center justify-center gap-2">
                <Icon name="siren" aria-hidden={true} size={18} />
                {t('submitReport')}
              </span>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
