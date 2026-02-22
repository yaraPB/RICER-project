'use client';

import type { RecordStatus } from '@/types';
import { useTranslation } from '@/hooks/useTranslation';

const STATUS_STYLES: Record<RecordStatus, string> = {
  DRAFT: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300',
  VALIDATED: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
  APPROVED: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
};

const STATUS_KEYS: Record<RecordStatus, string> = {
  DRAFT: 'fireRecordDraft',
  VALIDATED: 'fireRecordValidated',
  APPROVED: 'fireRecordApproved',
};

export function RecordStatusBadge({ status }: { status: RecordStatus }) {
  const { t } = useTranslation();

  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${STATUS_STYLES[status]}`}
      data-testid="record-status-badge"
    >
      {t(STATUS_KEYS[status] as Parameters<typeof t>[0])}
    </span>
  );
}
