'use client';

import { useEffect, useState } from 'react';
import { useAuthStore } from '@/store/authStore';
import { useRouter } from 'next/navigation';
import EquipmentTable from '@/components/equipment/EquipmentTable';
import TruckMap from '@/components/equipment/TruckMap';
import { Equipment, RetardantProduct, Infrastructure, TruckDeployment } from '@/types';

export default function EquipmentPage() {
  const user = useAuthStore((state) => state.user);
  const router = useRouter();
  const [data, setData] = useState<{
    equipment: Equipment[];
    retardantProducts: RetardantProduct[];
    infrastructure: Infrastructure[];
    trucks: TruckDeployment[];
  } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.role !== 'OFFICIAL') {
      router.push('/weather');
      return;
    }

    const fetchData = async () => {
      try {
        const res = await fetch('/api/equipment');
        const result = await res.json();
        setData(result);
      } catch (error) {
        console.error('Error fetching equipment:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user, router]);

  if (loading) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">جاري تحميل المعدات...</p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600">حدث خطأ أثناء تحميل البيانات</p>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-6 text-right">المعدات والبنية التحتية</h1>

      <div className="mb-8 bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-bold mb-4 text-right">انتشار الشاحنات</h2>
        <TruckMap trucks={data.trucks} />
      </div>

      <EquipmentTable
        equipment={data.equipment}
        retardantProducts={data.retardantProducts}
        infrastructure={data.infrastructure}
      />
    </div>
  );
}
