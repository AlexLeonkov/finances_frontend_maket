import { TypeBreakdownRow } from '../types';
import { formatEUR } from '../../../shared/lib/format';

type StatsTypeBreakdownTableProps = {
  rows: TypeBreakdownRow[];
};

const formatPercent = (val: number) =>
  new Intl.NumberFormat('de-DE', {
    style: 'percent',
    maximumFractionDigits: 1,
  }).format(val);

export const StatsTypeBreakdownTable = ({ rows }: StatsTypeBreakdownTableProps) => {
  if (rows.length === 0) {
    return (
      <div className="flex items-center justify-center h-40 text-slate-400">
        <p>Нет данных для отображения</p>
      </div>
    );
  }

  const hasSalary = rows.some((row) => typeof row.salary === 'number');

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead className="text-slate-500 border-b border-slate-200">
          <tr>
            <th className="text-left py-3 pr-3 font-semibold">Тип</th>
            <th className="text-right py-3 px-3 font-semibold">Топливо</th>
            <th className="text-right py-3 px-3 font-semibold">Материалы</th>
            {hasSalary && <th className="text-right py-3 px-3 font-semibold">Зарплата</th>}
            <th className="text-right py-3 px-3 font-semibold">Прибыль</th>
            <th className="text-right py-3 pl-3 font-semibold">Маржа %</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {rows.map((row) => (
            <tr key={row.type} className="text-slate-700">
              <td className="py-3 pr-3 font-medium">{row.type}</td>
              <td className="py-3 px-3 text-right">{formatEUR(row.fuelCost)}</td>
              <td className="py-3 px-3 text-right">{formatEUR(row.materialCost)}</td>
              {hasSalary && <td className="py-3 px-3 text-right">{formatEUR(row.salary ?? 0)}</td>}
              <td className="py-3 px-3 text-right">{formatEUR(row.profit)}</td>
              <td className="py-3 pl-3 text-right">{formatPercent(row.profitPct)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
