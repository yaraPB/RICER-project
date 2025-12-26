'use client';

import { useEffect, useState } from 'react';
import FireMap from '@/components/map/FireMap';
import { Incident } from '@/types';

export default function MapPage() {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchIncidents = async () => {
      try {
        const res = await fetch('/api/incidents');
        const data = await res.json();
        setIncidents(data.incidents);
      } catch (error) {
        console.error('Error fetching incidents:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchIncidents();
  }, []);

  return (
    <div>
      <div className="mb-6 text-right">
        <h1 className="text-3xl font-bold text-gray-900">خريطة الحرائق</h1>
        <p className="text-gray-600 mt-2">
          عرض حوادث الحرائق في منطقة إفران
        </p>
      </div>

      <div className="bg-white rounded-lg shadow-lg p-4">
        <div className="flex space-x-reverse space-x-4 mb-4 justify-end">
          <div className="flex items-center">
            <span className="text-sm mr-2">قيد الانتظار</span>
            <div className="w-4 h-4 bg-red-500 rounded-full"></div>
          </div>
          <div className="flex items-center">
            <span className="text-sm mr-2">قيد التنفيذ</span>
            <div className="w-4 h-4 bg-orange-500 rounded-full"></div>
          </div>
          <div className="flex items-center">
            <span className="text-sm mr-2">مكتمل</span>
            <div className="w-4 h-4 bg-green-500 rounded-full"></div>
          </div>
        </div>

        {loading ? (
          <div className="h-[600px] flex items-center justify-center bg-gray-100 rounded-lg">
            <p className="text-gray-600">جاري تحميل الخريطة...</p>
          </div>
        ) : (
          <div className="h-[600px]">
            <FireMap incidents={incidents} />
          </div>
        )}
      </div>
    </div>
  );
}
