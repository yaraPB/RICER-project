'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { FIRE_CAUSES } from '@/utils/constants';

const LocationPicker = dynamic(
  () => import('@/components/map/LocationPicker'),
  {
    ssr: false,
    loading: () => (
      <div className="h-[400px] flex items-center justify-center bg-gray-100 rounded-lg">
        جاري تحميل الخريطة...
      </div>
    ),
  }
);

export default function ReportPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    location: null as { lat: number; lng: number } | null,
    description: '',
    cause: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleLocationSelect = (lat: number, lng: number) => {
    setFormData({ ...formData, location: { lat, lng } });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!formData.location) {
      setError('يرجى تحديد موقع الحريق على الخريطة');
      return;
    }

    if (!formData.description.trim()) {
      setError('يرجى إضافة وصف للحريق');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          latitude: formData.location.lat,
          longitude: formData.location.lng,
          description: formData.description,
          cause: formData.cause || 'UNKNOWN',
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'حدث خطأ أثناء إرسال التقرير');
        return;
      }

      setSuccess(true);
      setTimeout(() => {
        router.push('/reports-list');
      }, 2000);
    } catch (err) {
      setError('حدث خطأ في الاتصال');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-green-50 border border-green-200 rounded-lg p-8 text-center">
          <div className="text-6xl mb-4">✅</div>
          <h2 className="text-2xl font-bold text-green-800 mb-2">
            تم إرسال التقرير بنجاح
          </h2>
          <p className="text-green-700">جاري التوجيه إلى قائمة التقارير...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          الإبلاغ عن حريق
          <span className="text-lg font-normal text-gray-600 mr-2">Signaler un Incendie</span>
        </h1>
        <p className="text-gray-600">
          حدد موقع الحريق على الخريطة وأضف التفاصيل
          <span className="text-sm text-gray-500 mr-2">Localisez l'incendie sur la carte et ajoutez les détails</span>
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-lg text-right">
            {error}
          </div>
        )}

        {/* Location Picker */}
        <div>
          <label className="block text-right text-lg font-medium text-gray-700 mb-3">
            موقع الحريق
          </label>
          <LocationPicker
            onLocationSelect={handleLocationSelect}
            selectedLocation={formData.location || undefined}
          />
          {formData.location && (
            <div className="mt-2 text-sm text-gray-600 text-right">
              الموقع المحدد: {formData.location.lat.toFixed(6)},{' '}
              {formData.location.lng.toFixed(6)}
            </div>
          )}
        </div>

        {/* Description */}
        <div>
          <label className="block text-right text-lg font-medium text-gray-700 mb-3">
            وصف الحريق
          </label>
          <textarea
            value={formData.description}
            onChange={(e) =>
              setFormData({ ...formData, description: e.target.value })
            }
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent text-right"
            rows={5}
            placeholder="اكتب وصفاً تفصيلياً للحريق (الحجم، الدخان، الخطورة...)"
            required
          />
        </div>

        {/* Cause */}
        <div>
          <label className="block text-right text-lg font-medium text-gray-700 mb-3">
            السبب المحتمل (اختياري)
          </label>
          <select
            value={formData.cause}
            onChange={(e) =>
              setFormData({ ...formData, cause: e.target.value })
            }
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent text-right"
          >
            <option value="">اختر السبب إذا كنت تعرفه</option>
            {Object.entries(FIRE_CAUSES).map(([key, label]) => (
              <option key={key} value={key}>
                {label}
              </option>
            ))}
          </select>
        </div>

        {/* Submit Button */}
        <div className="flex gap-4">
          <button
            type="button"
            onClick={() => router.back()}
            className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium py-3 rounded-lg transition-colors"
          >
            إلغاء
          </button>
          <button
            type="submit"
            disabled={loading}
            className="flex-1 bg-red-600 hover:bg-red-700 disabled:bg-red-300 text-white font-medium py-3 rounded-lg transition-colors"
          >
            {loading ? 'جاري الإرسال...' : 'إرسال التقرير 🚨'}
          </button>
        </div>
      </form>
    </div>
  );
}
