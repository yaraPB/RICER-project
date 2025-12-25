'use client';

import { useEffect } from 'react';
import Dashboard from '@/src/pages/Dashboard';
import { useEquipmentStore } from '@/store/useEquipmentStore';
import { useInfrastructureStore } from '@/store/useInfrastructureStore';

export default function DashboardPage() {
  const { fetchEquipment } = useEquipmentStore();
  const { fetchInfrastructure } = useInfrastructureStore();

  useEffect(() => {
    fetchEquipment();
    fetchInfrastructure();
  }, [fetchEquipment, fetchInfrastructure]);

  return <Dashboard />;
}
