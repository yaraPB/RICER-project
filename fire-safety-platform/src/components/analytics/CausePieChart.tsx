'use client';

import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { FIRE_CAUSES } from '@/utils/constants';

interface CausePieChartProps {
  data: Record<string, number>;
}

const COLORS = ['#ef4444', '#f97316', '#f59e0b', '#eab308', '#84cc16', '#22c55e', '#06b6d4', '#3b82f6'];

export default function CausePieChart({ data }: CausePieChartProps) {
  const chartData = Object.entries(data).map(([cause, count], index) => ({
    name: FIRE_CAUSES.find(c => c.value === cause)?.label || cause,
    value: count,
    color: COLORS[index % COLORS.length],
  }));

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h3 className="text-xl font-bold mb-4 text-right">توزيع الأسباب</h3>
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
            outerRadius={80}
            fill="#8884d8"
            dataKey="value"
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip formatter={(value) => [`${value} حادث`, 'العدد']} />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
