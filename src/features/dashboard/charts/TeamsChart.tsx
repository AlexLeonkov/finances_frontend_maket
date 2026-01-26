import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { StatsTeam } from '../types';
import { formatEUR } from '../../../shared/lib/format';
import { getTeamColor, normalizeTeamName } from '../lib/selectors';

type TeamsChartProps = {
  teams: StatsTeam[];
};

export const TeamsChart = ({ teams }: TeamsChartProps) => {
  const chartData = teams.map((team) => ({
    name: normalizeTeamName(team.name),
    revenue: team.revenue,
    profit: team.profit,
    color: getTeamColor(team.name),
  }));

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748B', fontSize: 12 }} />
        <YAxis
          axisLine={false}
          tickLine={false}
          tick={{ fill: '#64748B', fontSize: 12 }}
          tickFormatter={(val) => `€${(val / 1000).toFixed(0)}k`}
        />
        <Tooltip
          contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
          formatter={(value: number) => formatEUR(value)}
        />
        <Bar dataKey="revenue" fill="#4F46E5" radius={[4, 4, 0, 0]} name="Выручка" />
        <Bar dataKey="profit" fill="#10B981" radius={[4, 4, 0, 0]} name="Прибыль" />
      </BarChart>
    </ResponsiveContainer>
  );
};
