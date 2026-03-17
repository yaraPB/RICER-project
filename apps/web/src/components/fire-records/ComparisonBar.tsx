'use client';

import { useTranslation } from '@/hooks/useTranslation';
import { useFireRecordStore } from '@/store/useFireRecordStore';
import { Button } from '@/components/ui/Button';

export function ComparisonBar() {
  const { t } = useTranslation();
  const { comparisonIds, comparisonLoading, fetchComparison, clearComparison } = useFireRecordStore();

  if (comparisonIds.length === 0) return null;

  return (
    <div
      className="flex items-center justify-between rounded-lg border border-primary/30 bg-primary/5 px-4 py-2"
      data-testid="comparison-bar"
    >
      <span className="text-sm font-medium">
        {comparisonIds.length} {t('recordsSelected' as Parameters<typeof t>[0])}
      </span>
      <div className="flex gap-2">
        <Button
          variant="secondary"
          size="sm"
          onClick={clearComparison}
        >
          {t('cancel')}
        </Button>
        <Button
          variant="primary"
          size="sm"
          disabled={comparisonIds.length < 2 || comparisonLoading}
          onClick={fetchComparison}
        >
          {comparisonLoading ? t('loading') : t('compare' as Parameters<typeof t>[0])}
        </Button>
      </div>
    </div>
  );
}
