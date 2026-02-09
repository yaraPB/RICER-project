'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/useAuthStore';
import { useTranslation } from '@/hooks/useTranslation';
import dynamic from 'next/dynamic';
import type {
  Equipment,
  RetardantProduct,
  Infrastructure,
  TruckDeployment,
} from '@/types';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { getApiErrorUserMessage } from '@/lib/errors/sdk';

function TruckMapLoading() {
  const { t } = useTranslation();
  return (
    <div className="h-[400px] flex items-center justify-center bg-muted rounded-lg">
      {t('loadingMap')}
    </div>
  );
}

const TruckMap = dynamic(
  () => import('@/components/equipment/TruckMap'),
  {
    ssr: false,
    loading: () => <TruckMapLoading />,
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
  const { t, language } = useTranslation();
  const [data, setData] = useState<EquipmentData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValues, setEditValues] = useState<{ quantity: number; condition: string }>({ quantity: 0, condition: '' });
  const [saving, setSaving] = useState(false);
  const isRTL = language === 'ar';
  const textAlign = isRTL ? 'text-right' : 'text-left';
  const locale = isRTL ? 'ar-MA' : language === 'fr' ? 'fr-FR' : 'en-US';

  const fetchEquipment = useCallback(async () => {
    setError(null);
    try {
      const response = await fetch('/api/equipment');
      const result = await response.json().catch(() => null);
      if (response.ok) {
        setData(result as EquipmentData);
      } else if (response.status === 403) {
        router.push('/map');
      } else {
        setData(null);
        setError(getApiErrorUserMessage(result, t('errorServer')));
      }
    } catch {
      setData(null);
      setError(t('connectionError'));
    } finally {
      setLoading(false);
    }
  }, [router, t]);

  useEffect(() => {
    if (user?.role !== 'OFFICIAL') {
      router.push('/map');
      return;
    }
    fetchEquipment();
  }, [fetchEquipment, router, user?.role]);

  const startEdit = (item: Equipment) => {
    setEditingId(item.id);
    setEditValues({ quantity: item.quantity, condition: item.condition });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditValues({ quantity: 0, condition: '' });
  };

  const saveEdit = async (id: string) => {
    setSaving(true);
    setError(null);
    try {
      const response = await fetch(`/api/equipment/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editValues),
      });

      const result = await response.json().catch(() => null);
      if (!response.ok) {
        setError(getApiErrorUserMessage(result, t('errorServer')));
        return;
      }

      if (result) {
        // Update local state
        setData(prev => prev ? {
          ...prev,
          equipment: prev.equipment.map(item => 
            item.id === id ? result.equipment : item
          )
        } : null);
        setEditingId(null);
      }
    } catch {
      setError(t('connectionError'));
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto p-6">
        <div className="text-center py-12">{t('loadingEquipment')}</div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="max-w-7xl mx-auto p-6">
        <div className="bg-danger-muted text-danger-foreground p-4 rounded-lg text-center border border-danger/30">
          {error ?? t('errorServer')}
        </div>
      </div>
    );
  }

  const getConditionColor = (condition: string) => {
    if (condition === 'Bon') return 'bg-success-muted text-success-foreground';
    if (condition === 'Moyen') return 'bg-warning-muted text-warning-foreground';
    return 'bg-danger-muted text-danger-foreground';
  };

  const getConditionLabel = (condition: string) => {
    if (condition === 'Bon') return t('good');
    if (condition === 'Moyen') return t('average');
    return t('poor');
  };

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-8">
      <div className="mb-8">
        <h1 className={`text-3xl font-bold text-foreground mb-2 ${textAlign}`}>
          {t('equipmentTitle')}
        </h1>
        <p className={`text-muted-foreground ${textAlign}`}>{t('equipmentDesc')}</p>
      </div>

      {/* Truck Deployment Map */}
      <Card tone="elevated" className="p-6">
        <h2 className={`text-2xl font-bold mb-4 ${textAlign}`}>{t('truckDeploymentMap')}</h2>
        <TruckMap trucks={data.truckDeployments} />
      </Card>

      {/* Equipment Table */}
      <Card tone="elevated" className="p-6">
        <h2 className={`text-2xl font-bold mb-4 ${textAlign}`}>{t('equipmentInventory')}</h2>
        <div className="overflow-x-auto">
          <table className={`w-full ${textAlign}`}>
            <thead>
              <tr className="border-b-2 border-border">
                <th className={`py-3 px-4 font-bold text-foreground ${textAlign}`}>{t('category')}</th>
                <th className={`py-3 px-4 font-bold text-foreground ${textAlign}`}>{t('name')}</th>
                <th className={`py-3 px-4 font-bold text-foreground ${textAlign}`}>{t('quantity')}</th>
                <th className={`py-3 px-4 font-bold text-foreground ${textAlign}`}>{t('condition')}</th>
                <th className={`py-3 px-4 font-bold text-foreground ${textAlign}`}>{t('locationLabel')}</th>
                <th className={`py-3 px-4 font-bold text-foreground ${textAlign}`}>{t('lastMaintenance')}</th>
                <th className={`py-3 px-4 font-bold text-foreground ${textAlign}`}></th>
              </tr>
            </thead>
            <tbody>
              {data.equipment.map((item) => (
                <tr key={item.id} className="border-b border-border/50">
                  <td className="py-3 px-4">{item.category}</td>
                  <td className="py-3 px-4">{item.name}</td>
                  <td className="py-3 px-4 text-foreground">
                    {editingId === item.id ? (
                      <input
                        type="number"
                        min="0"
                        value={editValues.quantity}
                        onChange={(e) => setEditValues({ ...editValues, quantity: parseInt(e.target.value) || 0 })}
                        className={`w-20 px-2 py-1 border border-input bg-surface text-foreground rounded ${textAlign}`}
                      />
                    ) : (
                      item.quantity
                    )}
                  </td>
                  <td className="py-3 px-4">
                    {editingId === item.id ? (
                      <select
                        value={editValues.condition}
                        onChange={(e) => setEditValues({ ...editValues, condition: e.target.value })}
                        className={`px-2 py-1 border border-input bg-surface text-foreground rounded ${textAlign}`}
                      >
                        <option value="Bon">{t('good')}</option>
                        <option value="Moyen">{t('average')}</option>
                        <option value="Mauvais">{t('poor')}</option>
                      </select>
                    ) : (
                      <span className={`px-2 py-1 rounded text-sm ${getConditionColor(item.condition)}`}>
                        {getConditionLabel(item.condition)}
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-foreground">{item.location}</td>
                  <td className="py-3 px-4 text-sm text-muted-foreground">
                    {item.lastMaintenance
                      ? new Date(item.lastMaintenance).toLocaleDateString(locale)
                      : '-'}
                  </td>
                  <td className="py-3 px-4">
                    {editingId === item.id ? (
                      <div className="flex gap-2">
                        <Button
                          onClick={() => saveEdit(item.id)}
                          disabled={saving}
                          variant="primary"
                          className="bg-success hover:bg-success/90 text-sm"
                        >
                          {saving ? t('saving') : t('save')}
                        </Button>
                        <Button
                          onClick={cancelEdit}
                          disabled={saving}
                          variant="secondary"
                          className="text-sm"
                        >
                          {t('cancel')}
                        </Button>
                      </div>
                    ) : (
                      <Button
                        onClick={() => startEdit(item)}
                        variant="primary"
                        className="text-sm"
                      >
                        {t('edit')}
                      </Button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Retardant Products */}
      <Card tone="elevated" className="p-6">
        <h2 className={`text-2xl font-bold mb-4 ${textAlign}`}>{t('retardantProducts')}</h2>
        <div className="overflow-x-auto">
          <table className={`w-full ${textAlign}`}>
            <thead>
              <tr className="border-b-2 border-border">
                <th className={`py-3 px-4 font-bold text-foreground ${textAlign}`}>{t('productName')}</th>
                <th className={`py-3 px-4 font-bold text-foreground ${textAlign}`}>{t('quantityLiters')}</th>
                <th className={`py-3 px-4 font-bold text-foreground ${textAlign}`}>{t('locationLabel')}</th>
                <th className={`py-3 px-4 font-bold text-foreground ${textAlign}`}>{t('acquisitionDate')}</th>
              </tr>
            </thead>
            <tbody>
              {data.retardantProducts.map((product) => (
                <tr key={product.id} className="border-b border-border/50">
                  <td className="py-3 px-4 text-foreground">{product.productName}</td>
                  <td className="py-3 px-4 font-bold text-primary">
                    {product.quantity.toLocaleString()}
                  </td>
                  <td className="py-3 px-4 text-foreground">{product.storageLocation}</td>
                  <td className="py-3 px-4 text-sm text-muted-foreground">
                    {new Date(product.acquisitionDate).toLocaleDateString(locale)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="mt-4 p-4 bg-primary/10 rounded-lg border border-primary/20">
          <div className={`${textAlign} font-bold text-primary`}>
            {t('totalAmount')}:{' '}
            {data.retardantProducts
              .reduce((sum, p) => sum + p.quantity, 0)
              .toLocaleString()}{' '}
            {t('liters')}
          </div>
        </div>
      </Card>

      {/* Infrastructure */}
      <Card tone="elevated" className="p-6">
        <h2 className={`text-2xl font-bold mb-4 ${textAlign}`}>{t('infrastructure')}</h2>
        <div className="overflow-x-auto">
          <table className={`w-full ${textAlign}`}>
            <thead>
              <tr className="border-b-2 border-border">
                <th className={`py-3 px-4 font-bold text-foreground ${textAlign}`}>{t('type')}</th>
                <th className={`py-3 px-4 font-bold text-foreground ${textAlign}`}>{t('name')}</th>
                <th className={`py-3 px-4 font-bold text-foreground ${textAlign}`}>{t('status')}</th>
                <th className={`py-3 px-4 font-bold text-foreground ${textAlign}`}>{t('description')}</th>
                <th className={`py-3 px-4 font-bold text-foreground ${textAlign}`}>{t('locationLabel')}</th>
              </tr>
            </thead>
            <tbody>
              {data.infrastructure.map((item) => (
                <tr key={item.id} className="border-b border-border/50">
                  <td className="py-3 px-4 text-foreground">{item.type}</td>
                  <td className="py-3 px-4 text-foreground">{item.name}</td>
                  <td className="py-3 px-4">
                    <span
                      className={`px-2 py-1 rounded text-sm ${
                        item.status.includes('Opérationnel') ||
                        item.status.includes('Bon')
                          ? 'bg-success-muted text-success-foreground'
                          : item.status.includes('Excellent')
                          ? 'bg-primary/10 text-primary'
                          : 'bg-warning-muted text-warning-foreground'
                      }`}
                    >
                      {item.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-sm text-foreground">{item.description}</td>
                  <td className="py-3 px-4 text-sm text-muted-foreground">
                    {item.latitude && item.longitude
                      ? `${item.latitude.toFixed(4)}, ${item.longitude.toFixed(4)}`
                      : '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
