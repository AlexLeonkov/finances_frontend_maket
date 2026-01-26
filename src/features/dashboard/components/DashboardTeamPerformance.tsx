import { TeamPerformanceChart } from '../charts/TeamPerformanceChart';
import { formatEUR } from '../../../shared/lib/format';
import { TeamPerformance } from '../types';

type DashboardTeamPerformanceProps = {
  data: TeamPerformance[];
};

export const DashboardTeamPerformance = ({ data }: DashboardTeamPerformanceProps) => {
  if (data.length === 0) return null;

  return (
    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
      <h3 className="font-bold text-slate-800 mb-6">Аналитика по командам</h3>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {data.map((team, idx) => (
          <div key={`${team.team}-${idx}`} className="border border-slate-200 rounded-lg p-4 hover:shadow-md transition-shadow">
            <div className="flex items-center gap-2 mb-3">
              <span className="w-3 h-3 rounded-full" style={{ backgroundColor: team.color }}></span>
              <h4 className="font-bold text-slate-800">{team.team}</h4>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Выручка:</span>
                <span className="font-bold text-slate-800">{formatEUR(team.revenue)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Прибыль:</span>
                <span className={`font-bold ${team.profit >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                  {formatEUR(team.profit)}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Маржа:</span>
                <span
                  className={`font-bold ${
                    team.margin > 20 ? 'text-emerald-600' : team.margin > 0 ? 'text-amber-600' : 'text-rose-600'
                  }`}
                >
                  {team.margin.toFixed(1)}%
                </span>
              </div>
              <div className="flex justify-between text-sm pt-2 border-t border-slate-100">
                <span className="text-slate-500">Проектов:</span>
                <span className="font-bold text-slate-800">{team.count}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <TeamPerformanceChart data={data} />
    </div>
  );
};
