import { Sparkline } from '../charts/Sparkline';
import { formatEUR } from '../../../shared/lib/format';
import { KpiData } from '../types';

type DashboardKpiCardProps = {
  kpi: KpiData;
};

export const DashboardKpiCard = ({ kpi }: DashboardKpiCardProps) => (
  <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex justify-between items-end hover:shadow-md transition-shadow">
    <div>
      <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">{kpi.label}</p>
      <h3 className="text-2xl font-bold text-slate-800 tabular-nums">
        {kpi.label.includes('объектов') ? kpi.val : formatEUR(kpi.val)}
      </h3>
      <div className="flex items-center gap-2 mt-2">
        <span
          className={`text-xs font-bold px-1.5 py-0.5 rounded ${
            kpi.trend.startsWith('+') || !kpi.trend.includes('-')
              ? 'bg-emerald-50 text-emerald-600'
              : 'bg-rose-50 text-rose-600'
          }`}
        >
          {kpi.trend}
        </span>
        <span className="text-xs text-slate-400">{kpi.sub}</span>
      </div>
    </div>
    <Sparkline data={kpi.chart} color={kpi.color} />
  </div>
);
