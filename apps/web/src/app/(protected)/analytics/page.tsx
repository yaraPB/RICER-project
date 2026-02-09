'use client';

import { useCallback, useEffect, useState } from 'react';
import {
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { useTranslation } from '@/hooks/useTranslation';
import type { TranslationKey } from '@/i18n/translations';
import { Icon } from '@/components/ui/Icon';
import { KpiCard } from '@/components/ui/KpiCard';
import { Card } from '@/components/ui/Card';
import { getApiErrorUserMessage } from '@/lib/errors/sdk';

interface AnalyticsData {
  timeline: { date: string; count: number }[];
  causes: { cause: string; count: number }[];
  stats: {
    totalIncidents: number;
    daysWithFires: number;
    dailyAverage: string;
  };
}

const COLORS = [
  'hsl(var(--danger))',
  'hsl(var(--primary))',
  'hsl(var(--warning))',
  'hsl(38 92% 50%)',
  'hsl(142 71% 45%)',
  'hsl(142 71% 55%)',
  'hsl(180 71% 45%)',
  'hsl(200 71% 45%)',
];

export default function AnalyticsPage() {
  const { t, language } = useTranslation();
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAnalytics = useCallback(async () => {
    setError(null);
    try {
      const response = await fetch('/api/analytics');
      const result = (await response.json().catch(() => null)) as unknown;
      if (!response.ok) {
        setData(null);
        setError(getApiErrorUserMessage(result, t('analyticsLoadFailed')));
        return;
      }
      setData(result as AnalyticsData);
    } catch {
      setData(null);
      setError(t('connectionError'));
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

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

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto p-6">
        <div className="text-center py-12">{t('loadingStats')}</div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="max-w-7xl mx-auto p-6">
        <div className="rounded-lg border border-danger/30 bg-danger-muted px-4 py-3 text-center text-danger-foreground">
          {error ?? t('analyticsLoadFailed')}
        </div>
      </div>
    );
  }

  // Format causes for display
  const causesData = data.causes.map((item) => ({
    ...item,
    name: getCauseLabel(item.cause),
  }));

  const countLabel = language === 'ar' ? 'العدد' : language === 'fr' ? 'Nombre' : 'Count';
  const fireLabel = language === 'ar' ? 'حريق' : language === 'fr' ? 'incendie(s)' : 'fire(s)';

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">
          {t('analyticsTitle')}
        </h1>
        <p className="text-muted-foreground">{t('analyticsDesc')}</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <KpiCard
          label={t('totalFires')}
          value={data.stats.totalIncidents}
          tone="danger"
          icon={<Icon name="fire" aria-hidden size={28} className="text-danger" />}
        />
        <KpiCard
          label={t('daysWithFires')}
          value={data.stats.daysWithFires}
          tone="warning"
          icon={<Icon name="calendar" aria-hidden size={28} className="text-warning" />}
        />
        <KpiCard
          label={t('dailyAverage')}
          value={data.stats.dailyAverage}
          tone="primary"
          icon={<Icon name="analytics" aria-hidden size={28} className="text-primary" />}
        />
      </div>

      {/* Timeline Chart */}
      <Card tone="elevated" className="p-6 mb-8">
        <h2 className="text-xl font-bold mb-4">{t('fireEvolution')}</h2>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data.timeline}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
              tickFormatter={(value) => {
                const date = new Date(value);
                return `${date.getDate()}/${date.getMonth() + 1}`;
              }}
            />
            <YAxis tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }} />
            <Tooltip
              contentStyle={{
                backgroundColor: 'hsl(var(--surface))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '8px',
                color: 'hsl(var(--foreground))',
              }}
              labelFormatter={(value) => {
                const date = new Date(value);
                return date.toLocaleDateString(
                  language === 'ar' ? 'ar-MA' : 'fr-FR'
                );
              }}
              formatter={(value) => [`${value} ${fireLabel}`, countLabel]}
            />
            <Line
              type="monotone"
              dataKey="count"
              stroke="hsl(var(--danger))"
              strokeWidth={2}
              dot={{ fill: 'hsl(var(--danger))', r: 4 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </Card>

      {/* Causes Pie Chart */}
      <Card tone="elevated" className="p-6">
        <h2 className="text-xl font-bold mb-4">{t('distributionByCause')}</h2>
        <div className="flex flex-col md:flex-row items-center gap-8">
          <ResponsiveContainer width="100%" height={350}>
            <PieChart>
              <Pie
                data={causesData}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={120}
                dataKey="count"
              >
                {causesData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip
                formatter={(value, name, props) => [
                  `${value} ${fireLabel}`,
                  props.payload.name,
                ]}
                contentStyle={{
                  backgroundColor: 'hsl(var(--surface))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                  color: 'hsl(var(--foreground))',
                }}
              />
            </PieChart>
          </ResponsiveContainer>

          {/* Legend on the side */}
          <div className="space-y-2 min-w-[250px]">
            {causesData.map((entry, index) => (
              <div key={entry.cause} className="flex items-center gap-3">
                <div
                  className="w-4 h-4 rounded flex-shrink-0"
                  style={{ backgroundColor: COLORS[index % COLORS.length] }}
                />
                <span className="text-sm text-foreground">
                  {entry.name}: {entry.count}
                </span>
              </div>
            ))}
          </div>
        </div>
      </Card>
    </div>
  );
}
