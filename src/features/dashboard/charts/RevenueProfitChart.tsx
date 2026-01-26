import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { MonthlyTrend } from '../types';
import { formatEUR } from '../../../shared/lib/format';

type RevenueProfitChartProps = {
  data: MonthlyTrend[];
};

export const RevenueProfitChart = ({ data }: RevenueProfitChartProps) => (
  <div className="h-72">
    {data.length > 0 ? (
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
          <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94A3B8' }} dy={10} />
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
          <Line type="monotone" dataKey="revenue" stroke="#4F46E5" strokeWidth={3} dot={{ r: 4 }} name="Выручка" />
          <Line type="monotone" dataKey="profit" stroke="#10B981" strokeWidth={3} dot={{ r: 4 }} name="Прибыль" />
        </LineChart>
      </ResponsiveContainer>
    ) : (
      <div className="flex items-center justify-center h-full text-slate-400">
        <p>Нет данных для отображения</p>
      </div>
    )}
  </div>
);
