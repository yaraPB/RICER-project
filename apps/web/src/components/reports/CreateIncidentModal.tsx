'use client';

import { useState } from 'react';
import { useTranslation } from '@/hooks/useTranslation';
import type { Report, IncidentStatus } from '@/types';
import { Button } from '@/components/ui/Button';
import { Icon } from '@/components/ui/Icon';

interface CreateIncidentModalProps {
  report: Report | null;
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function CreateIncidentModal({ report, open, onClose, onSuccess }: CreateIncidentModalProps) {
  const { t } = useTranslation();
  const [severity, setSeverity] = useState(3);
  const [status, setStatus] = useState<IncidentStatus>('VIGILANCE');
  const [description, setDescription] = useState(report?.description || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!open || !report) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/incidents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reportId: report.id,
          latitude: report.latitude,
          longitude: report.longitude,
          cause: report.cause || 'UNKNOWN',
          severity,
          status,
          description: description || report.description
        })
      });

      if (!response.ok) {
        const data = await response.json();
        setError(data.error?.userMessage || t('errorServer'));
        return;
      }

      onSuccess();
      onClose();
    } catch {
      setError(t('connectionError'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-full max-w-lg rounded-lg bg-surface p-6 shadow-xl">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold">{t('createIncident')}</h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
            <Icon name="close" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-2 block text-sm font-medium">{t('severity')}</label>
            <input
              type="range"
              min="1"
              max="5"
              value={severity}
              onChange={(e) => setSeverity(parseInt(e.target.value))}
              className="w-full"
            />
            <div className="mt-1 text-sm text-muted-foreground">
              {t('severityLevel')}: {severity}/5
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">{t('initialStatus')}</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as IncidentStatus)}
              className="w-full rounded-lg border border-border bg-surface px-3 py-2"
            >
              <option value="VIGILANCE">{t('statusVigilance')}</option>
              <option value="ALERTE">{t('statusAlerte')}</option>
              <option value="INTERVENTION">{t('statusIntervention')}</option>
            </select>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">{t('description')}</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              className="w-full rounded-lg border border-border bg-surface px-3 py-2"
            />
          </div>

          {error && (
            <div className="rounded-lg bg-danger/10 px-3 py-2 text-sm text-danger">
              {error}
            </div>
          )}

          <div className="flex gap-3">
            <Button type="button" variant="secondary" onClick={onClose} className="flex-1">
              {t('cancel')}
            </Button>
            <Button type="submit" variant="primary" disabled={loading} className="flex-1">
              {loading ? t('creating') : t('createIncident')}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
