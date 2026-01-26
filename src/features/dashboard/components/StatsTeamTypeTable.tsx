import { TeamTypePerformanceRow } from '../types';
import { formatEUR } from '../../../shared/lib/format';
import { normalizeTeamName } from '../lib/selectors';

type StatsTeamTypeTableProps = {
  rows: TeamTypePerformanceRow[];
};

const formatPercent = (val: number) =>
  new Intl.NumberFormat('de-DE', {
    style: 'percent',
    maximumFractionDigits: 1,
  }).format(val);

export const StatsTeamTypeTable = ({ rows }: StatsTeamTypeTableProps) => {
  if (rows.length === 0) {
    return (
      <div className="flex items-center justify-center h-40 text-slate-400">
        <p>Нет данных для отображения</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead className="text-slate-500 border-b border-slate-200">
          <tr>
            <th className="text-left py-3 pr-3 font-semibold">Команда</th>
            <th className="text-left py-3 px-3 font-semibold">Тип</th>
            <th className="text-right py-3 px-3 font-semibold">Выручка</th>
            <th className="text-right py-3 px-3 font-semibold">Прибыль</th>
            <th className="text-right py-3 px-3 font-semibold">Маржа %</th>
            <th className="text-right py-3 pl-3 font-semibold">Операции</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {rows.map((row) => (
            <tr key={`${row.team}-${row.type}`} className="text-slate-700">
              <td className="py-3 pr-3 font-medium">{normalizeTeamName(row.team)}</td>
              <td className="py-3 px-3">{row.type}</td>
              <td className="py-3 px-3 text-right">{formatEUR(row.revenue)}</td>
              <td className="py-3 px-3 text-right">{formatEUR(row.profit)}</td>
              <td className="py-3 px-3 text-right">{formatPercent(row.profitPct)}</td>
              <td className="py-3 pl-3 text-right">{row.operations}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
