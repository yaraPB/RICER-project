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
              <Logo variant="badge" size="md" />
              <div>
                <div className="text-sm font-extrabold">{t('brandTitle')}</div>
                <div className="text-xs text-muted-foreground">{t('brandSubtitle')}</div>
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              Système de gestion et de signalement des incendies pour Ifrane, Maroc
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-sm font-bold mb-3">Navigation</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  href="/map"
                  className="text-muted-foreground hover:text-foreground transition"
                >
                  Carte des incendies
                </Link>
              </li>
              <li>
                <Link
                  href="/analytics"
                  className="text-muted-foreground hover:text-foreground transition"
                >
                  Analytique
                </Link>
              </li>
              <li>
                <Link
                  href="/report"
                  className="text-muted-foreground hover:text-foreground transition"
                >
                  Signaler un incendie
                </Link>
              </li>
            </ul>
          </div>

          {/* Emergency */}
          <div>
            <h3 className="text-sm font-bold mb-3">Urgences</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-center gap-2">
                <Icon name="phone" size={14} />
                <span>15 - Protection Civile</span>
              </li>
              <li className="flex items-center gap-2">
                <Icon name="phone" size={14} />
                <span>190 - Eaux et Forêts</span>
              </li>
            </ul>
          </div>

          {/* Info */}
          <div>
            <h3 className="text-sm font-bold mb-3">Informations</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  href="/error-codes"
                  className="text-muted-foreground hover:text-foreground transition"
                >
                  Codes d&apos;erreur
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 border-t border-border pt-6 text-center text-xs text-muted-foreground">
          © {currentYear} RICER Ifrane. Tous droits réservés.
        </div>
      </div>
    </footer>
  );
}
