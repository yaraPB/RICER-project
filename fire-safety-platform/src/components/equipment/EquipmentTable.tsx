'use client';

import { Equipment, RetardantProduct, Infrastructure } from '@/types';
import { formatDate } from '@/utils/helpers';

interface EquipmentTableProps {
  equipment: Equipment[];
  retardantProducts: RetardantProduct[];
  infrastructure: Infrastructure[];
}

export default function EquipmentTable({ equipment, retardantProducts, infrastructure }: EquipmentTableProps) {
  return (
    <div className="space-y-8">
      {/* Equipment Section */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-bold mb-4 text-right">المعدات</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">آخر صيانة</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">الموقع</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">الحالة</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">الكمية</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">الاسم</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">الفئة</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {equipment.map((item) => (
                <tr key={item.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 text-right">
                    {item.lastMaintenance ? formatDate(item.lastMaintenance) : 'غير متوفر'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 text-right">{item.location}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      item.condition === 'Bon' ? 'bg-green-100 text-green-800' :
                      item.condition === 'Moyen' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {item.condition === 'Bon' ? 'جيد' : item.condition === 'Moyen' ? 'متوسط' : 'سيء'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 text-right">{item.quantity}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 text-right">{item.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 text-right">{item.category}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Retardant Products Section */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-bold mb-4 text-right">المواد المثبطة للحريق</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">الكمية (لتر)</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">مكان التخزين</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">تاريخ الاقتناء</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">اسم المنتج</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {retardantProducts.map((product) => (
                <tr key={product.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 text-right">{product.quantity.toLocaleString()}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 text-right">{product.storageLocation}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 text-right">
                    {new Date(product.acquisitionDate).toLocaleDateString('ar-MA')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 text-right">{product.productName}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Infrastructure Section */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-bold mb-4 text-right">البنية التحتية</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">الموقع</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">الوصف</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">الحالة</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">الاسم</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">النوع</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {infrastructure.map((item) => (
                <tr key={item.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 text-right">
                    {item.latitude && item.longitude 
                      ? `${item.latitude.toFixed(5)}, ${item.longitude.toFixed(5)}`
                      : 'غير متوفر'}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-700 text-right">{item.description}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">
                      {item.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 text-right">{item.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 text-right">{item.type}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
