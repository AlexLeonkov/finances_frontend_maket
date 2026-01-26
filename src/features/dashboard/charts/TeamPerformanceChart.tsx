import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { TeamPerformance } from '../types';
import { formatEUR } from '../../../shared/lib/format';

type TeamPerformanceChartProps = {
  data: TeamPerformance[];
};

export const TeamPerformanceChart = ({ data }: TeamPerformanceChartProps) => (
  <div className="h-64">
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
        <XAxis dataKey="team" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94A3B8' }} />
        <YAxis
          axisLine={false}
          tickLine={false}
          tick={{ fontSize: 12, fill: '#94A3B8' }}
          tickFormatter={(val) => `€${(val / 1000).toFixed(0)}k`}
        />
        <Tooltip
          contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
          formatter={(value: number) => formatEUR(value)}
        />
        <Bar dataKey="revenue" fill="#4F46E5" radius={[4, 4, 0, 0]} name="Выручка" />
        <Bar dataKey="profit" fill="#10B981" radius={[4, 4, 0, 0]} name="Прибыль" />
      </BarChart>
    </ResponsiveContainer>
  </div>
);
