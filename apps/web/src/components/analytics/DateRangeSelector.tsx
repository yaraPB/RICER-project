'use client';

import { useAnalyticsStore } from '@/store/useAnalyticsStore';
import { useTranslation } from '@/hooks/useTranslation';
import { Button } from '@/components/ui/Button';
import type { DateRangePreset } from '@/types/analytics';
import type { TranslationKey } from '@/i18n/translations';

const PRESETS: { value: DateRangePreset; labelKey: TranslationKey }[] = [
  { value: '7d', labelKey: 'dateRange7d' },
  { value: '30d', labelKey: 'dateRange30d' },
  { value: 'season', labelKey: 'dateRangeSeason' },
  { value: 'year', labelKey: 'dateRangeYear' },
  { value: 'custom', labelKey: 'dateRangeCustom' },
  { value: 'all', labelKey: 'dateRangeAll' },
];

export function DateRangeSelector() {
  const { t } = useTranslation();
  const dateRange = useAnalyticsStore((s) => s.dateRange);
  const customFrom = useAnalyticsStore((s) => s.customFrom);
  const customTo = useAnalyticsStore((s) => s.customTo);
  const setDateRange = useAnalyticsStore((s) => s.setDateRange);
  const setCustomFrom = useAnalyticsStore((s) => s.setCustomFrom);
  const setCustomTo = useAnalyticsStore((s) => s.setCustomTo);

  return (
    <div className="mb-6">
      <div className="flex flex-wrap gap-2" role="group" aria-label={t('dateRangeAll')}>
        {PRESETS.map((p) => (
          <Button
            key={p.value}
            size="sm"
            variant={dateRange === p.value ? 'primary' : 'secondary'}
            onClick={() => setDateRange(p.value)}
            aria-pressed={dateRange === p.value}
          >
            {t(p.labelKey)}
          </Button>
        ))}
      </div>

      {dateRange === 'custom' && (
        <div className="mt-3 flex flex-wrap items-center gap-3">
          <label className="flex items-center gap-2 text-sm text-muted-foreground">
            {t('dateFrom')}
            <input
              type="date"
              value={customFrom}
              onChange={(e) => setCustomFrom(e.target.value)}
              className="rounded-md border border-border bg-surface px-3 py-1.5 text-sm text-foreground"
            />
          </label>
          <label className="flex items-center gap-2 text-sm text-muted-foreground">
            {t('dateTo')}
            <input
              type="date"
              value={customTo}
              onChange={(e) => setCustomTo(e.target.value)}
              className="rounded-md border border-border bg-surface px-3 py-1.5 text-sm text-foreground"
            />
          </label>
        </div>
      )}
    </div>
  );
}
