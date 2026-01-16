'use client';

import { useEffect, useState } from 'react';
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
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { useTranslation } from '@/hooks/useTranslation';

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
  '#ef4444',
  '#f97316',
  '#f59e0b',
  '#eab308',
  '#84cc16',
  '#22c55e',
  '#10b981',
  '#14b8a6',
  '#06b6d4',
];

export default function AnalyticsPage() {
  const { t, language } = useTranslation();
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const response = await fetch('/api/analytics');
      if (response.ok) {
        const result = await response.json();
        setData(result);
      }
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const getCauseLabel = (causeKey: string) => {
    const causeMap: Record<string, string> = {
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
    return t(causeMap[causeKey] as any || 'unknown');
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
        <div className="bg-red-50 text-red-600 p-4 rounded-lg text-center">
          {language === 'ar' ? 'فشل في جلب الإحصائيات' : 'Échec du chargement des statistiques'}
        </div>
      </div>
    );
  }

  // Format causes for display
  const causesData = data.causes.map((item) => ({
    ...item,
    name: getCauseLabel(item.cause),
  }));

  const countLabel = language === 'ar' ? 'العدد' : 'Nombre';
  const fireLabel = language === 'ar' ? 'حريق' : 'incendie(s)';

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          {t('analyticsTitle')}
        </h1>
        <p className="text-gray-600">{t('analyticsDesc')}</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="text-center">
            <div className="text-4xl mb-2">🔥</div>
            <div className="text-3xl font-bold text-red-600">
              {data.stats.totalIncidents}
            </div>
            <div className="text-sm text-gray-600 mt-1">{t('totalFires')}</div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="text-center">
            <div className="text-4xl mb-2">📅</div>
            <div className="text-3xl font-bold text-orange-600">
              {data.stats.daysWithFires}
            </div>
            <div className="text-sm text-gray-600 mt-1">{t('daysWithFires')}</div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="text-center">
            <div className="text-4xl mb-2">📊</div>
            <div className="text-3xl font-bold text-blue-600">
              {data.stats.dailyAverage}
            </div>
            <div className="text-sm text-gray-600 mt-1">{t('dailyAverage')}</div>
          </div>
        </div>
      </div>

      {/* Timeline Chart */}
      <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
        <h2 className="text-xl font-bold mb-4 text-right">
          {t('fireEvolution')}
        </h2>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data.timeline}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="date"
              tickFormatter={(value) => {
                const date = new Date(value);
                return `${date.getDate()}/${date.getMonth() + 1}`;
              }}
            />
            <YAxis />
            <Tooltip
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
              stroke="#ef4444"
              strokeWidth={2}
              dot={{ fill: '#ef4444', r: 4 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Causes Pie Chart */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-xl font-bold mb-4 text-right">
          {t('distributionByCause')}
        </h2>
        <div className="flex flex-col md:flex-row items-center gap-8">
          <ResponsiveContainer width="100%" height={350}>
            <PieChart>
              <Pie
                data={causesData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={false}
                outerRadius={120}
                fill="#8884d8"
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
                  props.payload.name
                ]}
                contentStyle={{
                  backgroundColor: 'white',
                  border: '1px solid #ccc',
                  borderRadius: '8px',
                  padding: '10px',
                  color: '#000',
                }}
                labelStyle={{ color: '#000', fontWeight: 'bold' }}
                itemStyle={{ color: '#000' }}
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
                ></div>
                <span className="text-sm">
                  {entry.name}: {entry.count}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
