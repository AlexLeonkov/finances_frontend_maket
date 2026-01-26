import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { formatEUR } from '../../../shared/lib/format';
import { getTeamColor, normalizeTeamName } from '../lib/selectors';

type MarginByTypeDatum = {
  type: string;
  [team: string]: number | string;
};

type MarginByTypeChartProps = {
  data: MarginByTypeDatum[];
  teams: string[];
};

export const MarginByTypeChart = ({ data, teams }: MarginByTypeChartProps) => (
  <div className="h-72">
    {data.length > 0 ? (
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
          <XAxis dataKey="type" axisLine={false} tickLine={false} tick={{ fill: '#64748B', fontSize: 12 }} />
          <YAxis
            axisLine={false}
            tickLine={false}
            tick={{ fill: '#64748B', fontSize: 12 }}
            tickFormatter={(val) => `€${(Number(val) / 1000).toFixed(0)}k`}
          />
          <Tooltip
            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
            formatter={(value: number) => formatEUR(value)}
          />
          {teams.map((team) => (
            <Bar
              key={team}
              dataKey={team}
              stackId="margin"
              fill={getTeamColor(team)}
              name={normalizeTeamName(team)}
              radius={[4, 4, 0, 0]}
            />
          ))}
        </BarChart>
      </ResponsiveContainer>
    ) : (
      <div className="flex items-center justify-center h-full text-slate-400">
        <p>Нет данных для отображения</p>
      </div>
    )}
  </div>
);
