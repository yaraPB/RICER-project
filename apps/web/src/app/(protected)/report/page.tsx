'use client';

import { useTranslation } from '@/hooks/useTranslation';
import { ReportWizard } from '@/components/report/ReportWizard';

export default function ReportPage() {
  const { t, language } = useTranslation();
  const isRTL = language === 'ar';
  const textAlign = isRTL ? 'text-right' : 'text-left';

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-6 page-enter">
      <div className="mb-6">
        <h1 className={`text-fluid-3xl font-bold text-foreground mb-1 ${textAlign}`}>
          {t('reportFireTitle')}
        </h1>
        <p className={`text-sm text-muted-foreground ${textAlign}`}>
          {t('reportFireDesc')}
        </p>
      </div>
      <ReportWizard />
    </div>
  );
}
