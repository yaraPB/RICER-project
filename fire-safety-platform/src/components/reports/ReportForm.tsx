'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import LocationPicker from '@/components/map/LocationPicker';
import { FIRE_CAUSES, IFRANE_COORDINATES } from '@/utils/constants';

export default function ReportForm() {
  const router = useRouter();
  const [latitude, setLatitude] = useState(IFRANE_COORDINATES.lat);
  const [longitude, setLongitude] = useState(IFRANE_COORDINATES.lng);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleLocationSelect = (lat: number, lng: number) => {
    setLatitude(lat);
    setLongitude(lng);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);

    const formData = new FormData(e.currentTarget);
    const data = {
      latitude,
      longitude,
      description: formData.get('description') as string,
      cause: formData.get('cause') as string || null,
    };

    try {
      const res = await fetch('/api/reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const result = await res.json();
        throw new Error(result.error || 'حدث خطأ أثناء إنشاء التقرير');
      }

      setSuccess(true);
      setTimeout(() => {
        router.push('/reports-list');
      }, 2000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2 text-right">
          موقع الحادث
        </label>
        <p className="text-sm text-gray-600 mb-2 text-right">
          انقر على الخريطة لتحديد الموقع الدقيق
        </p>
        <LocationPicker 
          onLocationSelect={handleLocationSelect}
          initialLat={latitude}
          initialLng={longitude}
        />
        <p className="text-sm text-gray-600 mt-2 text-right">
          الموقع المختار: {latitude.toFixed(5)}, {longitude.toFixed(5)}
        </p>
      </div>

      <div>
        <label htmlFor="cause" className="block text-sm font-medium text-gray-700 text-right">
          السبب المحتمل (اختياري)
        </label>
        <select
          id="cause"
          name="cause"
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-primary-500 focus:outline-none focus:ring-primary-500"
        >
          <option value="">اختر السبب</option>
          {FIRE_CAUSES.map((cause) => (
            <option key={cause.value} value={cause.value}>
              {cause.label}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700 text-right">
          الوصف التفصيلي *
        </label>
        <textarea
          id="description"
          name="description"
          required
          rows={5}
          placeholder="صف الحادث: ما شاهدته، حجم الحريق، الظروف، إلخ..."
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-primary-500 focus:outline-none focus:ring-primary-500"
        />
      </div>

      {error && (
        <div className="rounded-md bg-red-50 p-4">
          <p className="text-sm text-red-800 text-right">{error}</p>
        </div>
      )}

      {success && (
        <div className="rounded-md bg-green-50 p-4">
          <p className="text-sm text-green-800 text-right">
            ✅ تم إرسال التقرير بنجاح! جاري التحويل...
          </p>
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
      >
        {loading ? 'جاري الإرسال...' : 'إرسال التقرير'}
      </button>
    </form>
  );
}
