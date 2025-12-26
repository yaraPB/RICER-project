'use client';

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { format } from 'date-fns';

interface IncidentChartProps {
  data: Record<string, number>;
}

export default function IncidentChart({ data }: IncidentChartProps) {
  const chartData = Object.entries(data).map(([date, count]) => ({
    date,
    incidents: count,
    formattedDate: format(new Date(date), 'dd MMM'),
  }));

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h3 className="text-xl font-bold mb-4 text-right">الحرائق في آخر أسبوعين</h3>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="formattedDate" />
          <YAxis />
          <Tooltip 
            labelFormatter={(label) => `التاريخ: ${label}`}
            formatter={(value) => [`${value} حادث`, 'العدد']}
          />
          <Line 
            type="monotone" 
            dataKey="incidents" 
            stroke="#ef4444" 
            strokeWidth={2}
            dot={{ fill: '#ef4444' }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
