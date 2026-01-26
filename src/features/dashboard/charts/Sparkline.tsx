import { Area, AreaChart, ResponsiveContainer } from 'recharts';
import { SparklinePoint } from '../types';

type SparklineProps = {
  data: SparklinePoint[];
  color: string;
};

export const Sparkline = ({ data, color }: SparklineProps) => (
  <div className="h-12 w-24">
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={data}>
        <defs>
          <linearGradient id={`grad_${color}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={color} stopOpacity={0.3} />
            <stop offset="95%" stopColor={color} stopOpacity={0} />
          </linearGradient>
        </defs>
        <Area type="monotone" dataKey="val" stroke={color} strokeWidth={2} fill={`url(#grad_${color})`} />
      </AreaChart>
    </ResponsiveContainer>
  </div>
);
