import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

import type { FinanceRow } from '../types';
import { formatEUR } from '../../../shared/lib/format';

type MonthlyComparisonChartProps = {
  rows: FinanceRow[];
};

const formatMonth = (value: string) =>
  new Date(`${value}-01`).toLocaleDateString('de-DE', { month: 'short', year: 'numeric' });

export const MonthlyComparisonChart = ({ rows }: MonthlyComparisonChartProps) => {
  const byMonth = rows.reduce<Record<string, { income: number; expenses: number }>>(
    (acc, row) => {
      const month = row.date.slice(0, 7);
      const income = row.incomeBills + row.otherIncome;
      acc[month] = acc[month] ?? { income: 0, expenses: 0 };
      acc[month].income += income;
      acc[month].expenses += row.totalExpenses;
      return acc;
    },
    {}
  );

  const data = Object.entries(byMonth)
    .map(([month, values]) => ({
      month,
      income: values.income,
      expenses: values.expenses,
    }))
    .sort((a, b) => a.month.localeCompare(b.month));

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div>
        <p className="text-xs uppercase tracking-wide text-slate-400 font-semibold">
          Сравнение по месяцам
        </p>
        <p className="text-lg font-semibold text-slate-800">Доходы vs расходы</p>
      </div>
      <div className="h-72 mt-4">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <XAxis dataKey="month" tickFormatter={formatMonth} fontSize={12} />
            <YAxis tickFormatter={(value) => formatEUR(Number(value))} fontSize={12} />
            <Tooltip
              formatter={(value) => formatEUR(Number(value))}
              labelFormatter={(label) => formatMonth(String(label))}
            />
            <Bar dataKey="income" name="Доход" fill="#22c55e" radius={[8, 8, 0, 0]} />
            <Bar dataKey="expenses" name="Расходы" fill="#f97316" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
