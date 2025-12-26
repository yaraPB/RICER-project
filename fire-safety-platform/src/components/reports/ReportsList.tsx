'use client';

import { useEffect, useState } from 'react';
import { Report } from '@/types';
import { STATUS_COLORS, STATUS_LABELS, FIRE_CAUSES } from '@/utils/constants';
import { formatDate } from '@/utils/helpers';
import { useAuthStore } from '@/store/authStore';

export default function ReportsList() {
  const user = useAuthStore((state) => state.user);
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      const res = await fetch('/api/reports');
      const data = await res.json();
      setReports(data.reports);
    } catch (error) {
      console.error('Error fetching reports:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (reportId: string, newStatus: string) => {
    setUpdatingId(reportId);
    try {
      const res = await fetch(`/api/reports/${reportId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      if (res.ok) {
        const data = await res.json();
        setReports(reports.map(r => r.id === reportId ? data.report : r));
      }
    } catch (error) {
      console.error('Error updating status:', error);
    } finally {
      setUpdatingId(null);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">جاري تحميل التقارير...</p>
      </div>
    );
  }

  if (reports.length === 0) {
    return (
      <div className="text-center py-12 bg-gray-50 rounded-lg">
        <p className="text-gray-600">لا توجد تقارير حالياً</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {reports.map((report) => (
        <div key={report.id} className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center space-x-reverse space-x-3 mb-2 justify-end">
                {report.cause && (
                  <span className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-sm">
                    {FIRE_CAUSES.find(c => c.value === report.cause)?.label}
                  </span>
                )}
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${STATUS_COLORS[report.status]}`}>
                  {STATUS_LABELS[report.status]}
                </span>
              </div>
              
              <p className="text-gray-700 mb-3 text-right">{report.description}</p>
              
              <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                <div className="text-right">
                  <span className="font-semibold">المُبلِّغ:</span> {report.user?.cin || 'غير متوفر'}
                </div>
                <div className="text-right">
                  <span className="font-semibold">الهاتف:</span> {report.user?.phone || 'غير متوفر'}
                </div>
                <div className="text-right">
                  <span className="font-semibold">الموقع:</span> {report.latitude.toFixed(5)}, {report.longitude.toFixed(5)}
                </div>
                <div className="text-right">
                  <span className="font-semibold">التاريخ:</span> {formatDate(report.createdAt)}
                </div>
              </div>
            </div>

            {user?.role === 'OFFICIAL' && (
              <div className="mr-4">
                <select
                  value={report.status}
                  onChange={(e) => updateStatus(report.id, e.target.value)}
                  disabled={updatingId === report.id}
                  className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="PENDING">قيد الانتظار</option>
                  <option value="IN_PROGRESS">قيد التنفيذ</option>
                  <option value="COMPLETED">مكتمل</option>
                </select>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
