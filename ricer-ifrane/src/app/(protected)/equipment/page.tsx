'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import dynamic from 'next/dynamic';
import type {
  Equipment,
  RetardantProduct,
  Infrastructure,
  TruckDeployment,
} from '@/types';

const TruckMap = dynamic(
  () => import('@/components/equipment/TruckMap'),
  {
    ssr: false,
    loading: () => (
      <div className="h-[400px] flex items-center justify-center bg-gray-100 rounded-lg">
        جاري تحميل خريطة الشاحنات...
      </div>
    ),
  }
);

interface EquipmentData {
  equipment: Equipment[];
  retardantProducts: RetardantProduct[];
  infrastructure: Infrastructure[];
  truckDeployments: TruckDeployment[];
}

export default function EquipmentPage() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const [data, setData] = useState<EquipmentData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.role !== 'OFFICIAL') {
      router.push('/weather');
      return;
    }
    fetchEquipment();
  }, [user, router]);

  const fetchEquipment = async () => {
    try {
      const response = await fetch('/api/equipment');
      if (response.ok) {
        const result = await response.json();
        setData(result);
      } else if (response.status === 403) {
        router.push('/weather');
      }
    } catch (error) {
      console.error('Failed to fetch equipment:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto p-6">
        <div className="text-center py-12">جاري تحميل بيانات المعدات...</div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="max-w-7xl mx-auto p-6">
        <div className="bg-red-50 text-red-600 p-4 rounded-lg text-center">
          فشل في جلب بيانات المعدات
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          إدارة المعدات والموارد
        </h1>
        <p className="text-gray-600">لوحة تحكم المسؤولين - متاح للمسؤولين فقط</p>
      </div>

      {/* Truck Deployment Map */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-2xl font-bold mb-4 text-right">خريطة نشر الشاحنات</h2>
        <TruckMap trucks={data.truckDeployments} />
      </div>

      {/* Equipment Table */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-2xl font-bold mb-4 text-right">جرد المعدات</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-right">
            <thead>
              <tr className="border-b-2 border-gray-200">
                <th className="py-3 px-4 text-right font-bold">الفئة</th>
                <th className="py-3 px-4 text-right font-bold">الاسم</th>
                <th className="py-3 px-4 text-right font-bold">الكمية</th>
                <th className="py-3 px-4 text-right font-bold">الحالة</th>
                <th className="py-3 px-4 text-right font-bold">الموقع</th>
                <th className="py-3 px-4 text-right font-bold">آخر صيانة</th>
              </tr>
            </thead>
            <tbody>
              {data.equipment.map((item) => (
                <tr key={item.id} className="border-b border-gray-100">
                  <td className="py-3 px-4">{item.category}</td>
                  <td className="py-3 px-4">{item.name}</td>
                  <td className="py-3 px-4">{item.quantity}</td>
                  <td className="py-3 px-4">
                    <span
                      className={`px-2 py-1 rounded text-sm ${
                        item.condition === 'Bon'
                          ? 'bg-green-100 text-green-800'
                          : item.condition === 'Moyen'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {item.condition}
                    </span>
                  </td>
                  <td className="py-3 px-4">{item.location}</td>
                  <td className="py-3 px-4 text-sm text-gray-500">
                    {item.lastMaintenance
                      ? new Date(item.lastMaintenance).toLocaleDateString(
                          'ar-MA'
                        )
                      : '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Retardant Products */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-2xl font-bold mb-4 text-right">
          منتجات مثبطات الحريق
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full text-right">
            <thead>
              <tr className="border-b-2 border-gray-200">
                <th className="py-3 px-4 text-right font-bold">اسم المنتج</th>
                <th className="py-3 px-4 text-right font-bold">الكمية (لتر)</th>
                <th className="py-3 px-4 text-right font-bold">الموقع</th>
                <th className="py-3 px-4 text-right font-bold">تاريخ الشراء</th>
              </tr>
            </thead>
            <tbody>
              {data.retardantProducts.map((product) => (
                <tr key={product.id} className="border-b border-gray-100">
                  <td className="py-3 px-4">{product.productName}</td>
                  <td className="py-3 px-4 font-bold text-blue-600">
                    {product.quantity.toLocaleString()}
                  </td>
                  <td className="py-3 px-4">{product.storageLocation}</td>
                  <td className="py-3 px-4 text-sm text-gray-500">
                    {new Date(product.acquisitionDate).toLocaleDateString(
                      'ar-MA'
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="mt-4 p-4 bg-blue-50 rounded-lg">
          <div className="text-right font-bold text-blue-800">
            المجموع الكلي:{' '}
            {data.retardantProducts
              .reduce((sum, p) => sum + p.quantity, 0)
              .toLocaleString()}{' '}
            لتر
          </div>
        </div>
      </div>

      {/* Infrastructure */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-2xl font-bold mb-4 text-right">
          البنية التحتية
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full text-right">
            <thead>
              <tr className="border-b-2 border-gray-200">
                <th className="py-3 px-4 text-right font-bold">النوع</th>
                <th className="py-3 px-4 text-right font-bold">الاسم</th>
                <th className="py-3 px-4 text-right font-bold">الحالة</th>
                <th className="py-3 px-4 text-right font-bold">الوصف</th>
                <th className="py-3 px-4 text-right font-bold">الموقع</th>
              </tr>
            </thead>
            <tbody>
              {data.infrastructure.map((item) => (
                <tr key={item.id} className="border-b border-gray-100">
                  <td className="py-3 px-4">{item.type}</td>
                  <td className="py-3 px-4">{item.name}</td>
                  <td className="py-3 px-4">
                    <span
                      className={`px-2 py-1 rounded text-sm ${
                        item.status.includes('Opérationnel') ||
                        item.status.includes('Bon')
                          ? 'bg-green-100 text-green-800'
                          : item.status.includes('Excellent')
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}
                    >
                      {item.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-sm">{item.description}</td>
                  <td className="py-3 px-4 text-sm text-gray-500">
                    {item.latitude && item.longitude
                      ? `${item.latitude.toFixed(4)}, ${item.longitude.toFixed(
                          4
                        )}`
                      : '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
