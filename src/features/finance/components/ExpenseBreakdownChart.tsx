import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

import type { FinanceRow } from '../types';
import { formatEUR } from '../../../shared/lib/format';

type ExpenseBreakdownChartProps = {
  rows: FinanceRow[];
};

export const ExpenseBreakdownChart = ({ rows }: ExpenseBreakdownChartProps) => {
  const totals = rows.reduce(
    (acc, row) => ({
      materials: acc.materials + row.materials,
      salaryPaid: acc.salaryPaid + row.salaryPaid,
      marketing: acc.marketing + row.marketing,
      car: acc.car + row.car,
      rent: acc.rent + row.rent,
      other: acc.other + row.otherExpenses + row.food + row.insurance,
    }),
    { materials: 0, salaryPaid: 0, marketing: 0, car: 0, rent: 0, other: 0 }
  );

  const data = [
    { name: 'Materials', value: totals.materials },
    { name: 'Salaries', value: totals.salaryPaid },
    { name: 'Marketing', value: totals.marketing },
    { name: 'Car', value: totals.car },
    { name: 'Rent', value: totals.rent },
    { name: 'Other', value: totals.other },
  ];

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div>
        <p className="text-xs uppercase tracking-wide text-slate-400 font-semibold">
          Expense breakdown
        </p>
        <p className="text-lg font-semibold text-slate-800">Monthly totals</p>
      </div>
      <div className="h-64 mt-4">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <XAxis dataKey="name" fontSize={12} />
            <YAxis tickFormatter={(value) => formatEUR(Number(value))} fontSize={12} />
            <Tooltip formatter={(value) => formatEUR(Number(value))} />
            <Bar dataKey="value" fill="#f97316" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
