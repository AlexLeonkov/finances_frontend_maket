import { formatEUR } from '../../../shared/lib/format';

type StatsTotalsGridProps = {
  totals: {
    operations: number;
    revenue: number;
    profit: number;
    expenses: number;
  };
};

const calculateMargin = (revenue: number, profit: number): number => {
  if (revenue === 0) return 0;
  return parseFloat(((profit / revenue) * 100).toFixed(1));
};

export const StatsTotalsGrid = ({ totals }: StatsTotalsGridProps) => (
  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
      <p className="text-sm text-slate-500 mb-2">Всего операций</p>
      <p className="text-3xl font-bold text-slate-800">{totals.operations}</p>
    </div>

    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
      <p className="text-sm text-slate-500 mb-2">Выручка (всего)</p>
      <p className="text-3xl font-bold text-indigo-600">{formatEUR(totals.revenue)}</p>
    </div>

    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
      <p className="text-sm text-slate-500 mb-2">Чистая прибыль</p>
      <p className={`text-3xl font-bold ${totals.profit >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
        {formatEUR(totals.profit)}
      </p>
      <p className="text-xs text-slate-400 mt-1">Маржа: {calculateMargin(totals.revenue, totals.profit)}%</p>
    </div>

    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
      <p className="text-sm text-slate-500 mb-2">Расходы</p>
      <p className="text-3xl font-bold text-amber-600">{formatEUR(totals.expenses)}</p>
    </div>
  </div>
);
