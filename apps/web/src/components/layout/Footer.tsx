'use client';

import React from 'react';
import Link from 'next/link';
import { useTranslation } from '@/hooks/useTranslation';
import { Logo } from '@/components/ui/Logo';
import { Icon } from '@/components/ui/Icon';

export function Footer() {
  const { t } = useTranslation();
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-border bg-surface-2 mt-auto">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {/* Branding */}
          <div className="col-span-1">
            <div className="flex items-center gap-3 mb-4">
              <div className="h-12 w-12 bg-surface shadow-elev-1 rounded-md p-2 transition-all duration-200">
                <Logo variant="badge" size="md" />
              </div>
              <div>
                <div className="text-sm font-extrabold">{t('brandTitle')}</div>
                <div className="text-xs text-muted-foreground">{t('brandSubtitle')}</div>
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              {t('footerDescription')}
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-sm font-bold mb-3">{t('footerNavigation')}</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  href="/map"
                  className="text-muted-foreground hover:text-foreground transition"
                >
                  {t('footerFireMap')}
                </Link>
              </li>
              <li>
                <Link
                  href="/analytics"
                  className="text-muted-foreground hover:text-foreground transition"
                >
                  {t('footerAnalytics')}
                </Link>
              </li>
              <li>
                <Link
                  href="/report"
                  className="text-muted-foreground hover:text-foreground transition"
                >
                  {t('footerReportFire')}
                </Link>
              </li>
            </ul>
          </div>

          {/* Emergency */}
          <div>
            <h3 className="text-sm font-bold mb-3">{t('footerEmergency')}</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-center gap-2">
                <Icon name="phone" size={14} />
                <span>{t('footerCivilProtection')}</span>
              </li>
              <li className="flex items-center gap-2">
                <Icon name="phone" size={14} />
                <span>{t('footerWaterForests')}</span>
              </li>
            </ul>
          </div>

          {/* Info */}
          <div>
            <h3 className="text-sm font-bold mb-3">{t('footerInformation')}</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  href="/error-codes"
                  className="text-muted-foreground hover:text-foreground transition"
                >
                  {t('footerErrorCodes')}
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 border-t border-border pt-6 text-center text-xs text-muted-foreground">
          © {currentYear} RICER Ifrane. {t('footerAllRightsReserved')}.
        </div>
      </div>
    </footer>
  );
}
