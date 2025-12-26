'use client';

import { useEffect, useState } from 'react';
import IncidentChart from '@/components/analytics/IncidentChart';
import CausePieChart from '@/components/analytics/CausePieChart';

export default function AnalyticsPage() {
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const res = await fetch('/api/analytics');
        const data = await res.json();
        setAnalytics(data);
      } catch (error) {
        console.error('Error fetching analytics:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">جاري تحميل الإحصائيات...</p>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600">حدث خطأ أثناء تحميل الإحصائيات</p>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-6 text-right">التحليلات والإحصائيات</h1>

      <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="text-4xl font-bold text-primary-600">{analytics.totalIncidents}</div>
            <p className="text-gray-600 mt-2">إجمالي الحرائق</p>
            <p className="text-sm text-gray-500">(آخر أسبوعين)</p>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-orange-600">
              {Object.keys(analytics.incidentsByDate).length}
            </div>
            <p className="text-gray-600 mt-2">أيام بها حرائق</p>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-green-600">
              {(analytics.totalIncidents / 14).toFixed(1)}
            </div>
            <p className="text-gray-600 mt-2">متوسط يومي</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <IncidentChart data={analytics.incidentsByDate} />
        <CausePieChart data={analytics.causeDistribution} />
      </div>
    </div>
  );
}
