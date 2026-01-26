import { SparklinePoint } from '../types';

const TEAM_COLORS: Record<string, string> = {
  AC01: '#3B82F6',
  AC02: '#10B981',
  AC03: '#F59E0B',
  AC04: '#EC4899',
};

export const normalizeTeamName = (team?: string | null): string => {
  if (!team) return 'Без команды';
  return team
    .trim()
    .replace(/А/g, 'A')
    .replace(/С/g, 'C')
    .toUpperCase();
};

export const getTeamColor = (teamName?: string | null): string => {
  const normalized = normalizeTeamName(teamName);
  return TEAM_COLORS[normalized] || '#94A3B8';
};

export const generateSparklineData = (values: number[]): SparklinePoint[] => {
  if (values.length === 0) return [{ val: 0 }];
  const max = Math.max(...values);
  const min = Math.min(...values);
  const range = max - min || 1;
  return values.map((val) => ({ val: ((val - min) / range) * 100 }));
};
