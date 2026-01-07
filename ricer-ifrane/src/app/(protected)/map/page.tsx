'use client';

import dynamic from 'next/dynamic';

const FireMap = dynamic(() => import('@/components/map/FireMap'), {
  ssr: false,
  loading: () => <div className="h-[600px] flex items-center justify-center bg-gray-100 rounded-lg">جاري تحميل الخريطة...</div>,
});

export default function MapPage() {
  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          خريطة الحرائق
        </h1>
        <p className="text-gray-600">
          عرض جميع حوادث الحرائق المسجلة في منطقة إفران
        </p>
      </div>

      <FireMap />
    </div>
  );
}
