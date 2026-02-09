'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslation } from '@/hooks/useTranslation';
import dynamic from 'next/dynamic';
import { FIRE_CAUSE_KEYS } from '@/config/constants';
import type { TranslationKey } from '@/i18n/translations';
import { Icon } from '@/components/ui/Icon';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { getApiErrorUserMessage } from '@/lib/errors/sdk';
import { ErrorDisplay } from '@/components/ui/ErrorDisplay';
import { clientLogger } from '@/lib/observability/clientLogger';

function LocationPickerLoading() {
  const { t } = useTranslation();
  return (
    <div className="h-[400px] flex items-center justify-center bg-muted rounded-lg">
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
  const [errorCode, setErrorCode] = useState<number | undefined>();
  const [requestId, setRequestId] = useState<string | undefined>();
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
    setErrorCode(undefined);
    setRequestId(undefined);

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

      const responseRequestId = response.headers.get('x-request-id');
      const data = await response.json();

      if (!response.ok) {
        setError(getApiErrorUserMessage(data, t('errorServer')));
        setErrorCode(data.error?.code);
        setRequestId(data.error?.requestId || responseRequestId || undefined);

        clientLogger.error({
          event: 'report_submission_failed',
          route: '/api/reports',
          requestId: responseRequestId || undefined,
          meta: {
            errorCode: data.error?.code,
            status: response.status,
          },
        });
        return;
      }

      setSuccess(true);
      setTimeout(() => {
        router.push('/reports-list');
      }, 2000);
    } catch (err) {
      setError(t('connectionError'));

      clientLogger.error({
        event: 'report_submission_exception',
        route: '/api/reports',
        error: {
          name: (err as Error)?.name,
          message: (err as Error)?.message,
          stack: (err as Error)?.stack,
        },
      });
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
        <Card tone="elevated" className="p-8 text-center">
          <div className="text-6xl mb-4">✅</div>
          <h2 className="text-2xl font-bold text-success mb-2">
            {t('reportSuccess')}
          </h2>
          <p className="text-success-foreground">{t('redirecting')}</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-8">
        <h1 className={`text-3xl font-bold text-foreground mb-2 ${textAlign}`}>
          {t('reportFireTitle')}
        </h1>
        <p className={`text-muted-foreground ${textAlign}`}>
          {t('reportFireDesc')}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6" noValidate>
        {error && (
          <ErrorDisplay
            message={error}
            code={errorCode}
            requestId={requestId}
            onRetry={() => handleSubmit(new Event('submit') as unknown as React.FormEvent)}
            retrying={loading}
          />
        )}

        {/* Location Picker */}
        <div>
          <label className={`block text-lg font-medium text-foreground mb-3 ${textAlign}`}>
            {t('fireLocation')}
          </label>
          <LocationPicker
            onLocationSelect={handleLocationSelect}
            selectedLocation={formData.location || undefined}
          />
          {formData.location && (
            <div className={`mt-2 text-sm text-muted-foreground ${textAlign}`}>
              {t('selectedLocation')}: {formData.location.lat.toFixed(6)},{' '}
              {formData.location.lng.toFixed(6)}
            </div>
          )}
        </div>

        {/* Description */}
        <div>
          <label className={`block text-lg font-medium text-foreground mb-3 ${textAlign}`}>
            {t('fireDescription')}
          </label>
          <textarea
            value={formData.description}
            onChange={(e) =>
              setFormData({ ...formData, description: e.target.value })
            }
            className={`w-full px-4 py-3 border border-input rounded-lg bg-surface text-foreground focus:ring-2 focus:ring-ring focus:border-transparent ${textAlign}`}
            rows={5}
            placeholder={t('descriptionPlaceholder')}
            required
          />
        </div>

        {/* Cause */}
        <div>
          <label className={`block text-lg font-medium text-foreground mb-3 ${textAlign}`}>
            {t('probableCause')}
          </label>
          <select
            value={formData.cause}
            onChange={(e) =>
              setFormData({ ...formData, cause: e.target.value })
            }
            className={`w-full px-4 py-3 border border-input rounded-lg bg-surface text-foreground focus:ring-2 focus:ring-ring focus:border-transparent ${textAlign}`}
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
          <Button
            type="button"
            variant="secondary"
            onClick={() => router.back()}
            className="flex-1"
          >
            {t('cancel')}
          </Button>
          <Button
            type="submit"
            variant="primary"
            disabled={loading}
            className="flex-1 bg-danger hover:bg-danger/90"
          >
            {loading ? (
              t('submitting')
            ) : (
              <span className="inline-flex items-center justify-center gap-2">
                <Icon name="siren" aria-hidden={true} size={18} />
                {t('submitReport')}
              </span>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
