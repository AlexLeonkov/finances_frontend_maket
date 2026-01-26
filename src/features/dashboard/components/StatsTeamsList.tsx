import { StatsTeam } from '../types';
import { formatEUR } from '../../../shared/lib/format';
import { getTeamColor, normalizeTeamName } from '../lib/selectors';

type StatsTeamsListProps = {
  teams: StatsTeam[];
  totalRevenue: number;
};

const calculateMargin = (revenue: number, profit: number): number => {
  if (revenue === 0) return 0;
  return parseFloat(((profit / revenue) * 100).toFixed(1));
};

export const StatsTeamsList = ({ teams, totalRevenue }: StatsTeamsListProps) => (
  <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
    <h3 className="text-lg font-bold text-slate-800 mb-6">Производительность команд</h3>
    <div className="space-y-4">
      {teams.map((team, index) => {
        const normalizedName = normalizeTeamName(team.name);
        const teamColor = getTeamColor(team.name);
        const margin = calculateMargin(team.revenue, team.profit);
        const revenueShare = totalRevenue > 0 ? (team.revenue / totalRevenue) * 100 : 0;

        return (
          <div key={`${team.name}-${index}`} className="border border-slate-200 rounded-lg p-4 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: teamColor }}></div>
                <h4 className="font-bold text-slate-800">{normalizedName}</h4>
              </div>
              <span className="text-sm text-slate-500">{team.operations} операций</span>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <p className="text-xs text-slate-400 mb-1">Выручка</p>
                <p className="text-lg font-bold text-slate-800">{formatEUR(team.revenue)}</p>
              </div>
              <div>
                <p className="text-xs text-slate-400 mb-1">Прибыль</p>
                <p className={`text-lg font-bold ${team.profit >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                  {formatEUR(team.profit)}
                </p>
              </div>
              <div>
                <p className="text-xs text-slate-400 mb-1">Маржа</p>
                <p className={`text-lg font-bold ${margin > 20 ? 'text-emerald-600' : margin > 0 ? 'text-amber-600' : 'text-red-600'}`}>
                  {margin}%
                </p>
              </div>
            </div>

            <div className="mt-4">
              <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full transition-all duration-500" style={{ width: `${revenueShare}%`, backgroundColor: teamColor }}></div>
              </div>
              <p className="text-xs text-slate-400 mt-1">{revenueShare.toFixed(1)}% от общей выручки</p>
            </div>
          </div>
        );
      })}
    </div>
  </div>
);
