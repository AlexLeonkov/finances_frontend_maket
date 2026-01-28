import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

import type { FinanceRow } from '../types';
import { formatEUR } from '../../../shared/lib/format';

type BalanceChartProps = {
  rows: FinanceRow[];
};

const formatDate = (value: string) =>
  new Date(value).toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit' });

export const BalanceChart = ({ rows }: BalanceChartProps) => {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-wide text-slate-400 font-semibold">
            Balance over time
          </p>
          <p className="text-lg font-semibold text-slate-800">Closing balance</p>
        </div>
      </div>
      <div className="h-64 mt-4">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={rows}>
            <XAxis dataKey="date" tickFormatter={formatDate} fontSize={12} />
            <YAxis tickFormatter={(value) => formatEUR(Number(value))} fontSize={12} />
            <Tooltip
              formatter={(value) => formatEUR(Number(value))}
              labelFormatter={(label) => formatDate(String(label))}
            />
            <Line
              type="monotone"
              dataKey="closingBalance"
              stroke="#4f46e5"
              strokeWidth={2.5}
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
