import { useMemo, useState } from 'react';
import { AlertCircle, Loader2 } from 'lucide-react';
import { StatsDateFilters } from './StatsDateFilters';
import { StatsTotalsGrid } from './StatsTotalsGrid';
import { StatsTeamsList } from './StatsTeamsList';
import { TeamsChart } from '../charts/TeamsChart';
import { getDatePresets } from '../lib/datePresets';
import { useStats } from '../hooks/useStats';

export const StatsPage = () => {
  const presets = useMemo(() => getDatePresets(), []);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [appliedStartDate, setAppliedStartDate] = useState('');
  const [appliedEndDate, setAppliedEndDate] = useState('');

  const applyPreset = (presetKey: string) => {
    const selected = presets[presetKey];
    if (selected) {
      setStartDate(selected.start);
      setEndDate(selected.end);
    }
  };

  const { stats, loading, error } = useStats(appliedStartDate, appliedEndDate);
  const canApply = startDate !== appliedStartDate || endDate !== appliedEndDate;

  if (loading) {
    return (
      <div className="p-12 text-center">
        <Loader2 className="animate-spin mx-auto mb-4 text-indigo-600" size={32} />
        <p className="text-slate-500">Загрузка статистики...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 text-center">
        <AlertCircle className="mx-auto mb-4 text-red-500" size={32} />
        <p className="text-red-600 font-medium mb-2">Ошибка загрузки</p>
        <p className="text-slate-500 text-sm">{error}</p>
        <p className="text-slate-400 text-xs mt-2">Проверьте доступность API и параметры запроса.</p>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="p-6 text-center">
        <p className="text-slate-500">Нет данных для отображения</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
      <StatsDateFilters
        presets={presets}
        startDate={startDate}
        endDate={endDate}
        onApplyPreset={applyPreset}
        onStartDateChange={setStartDate}
        onEndDateChange={setEndDate}
        onReset={() => {
          setStartDate('');
          setEndDate('');
          setAppliedStartDate('');
          setAppliedEndDate('');
        }}
        onApply={() => {
          setAppliedStartDate(startDate);
          setAppliedEndDate(endDate);
        }}
        canApply={canApply}
      />

      <StatsTotalsGrid totals={stats.totals} />

      <StatsTeamsList teams={stats.teams} totalRevenue={stats.totals.revenue} />

      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <h3 className="text-lg font-bold text-slate-800 mb-6">Выручка по командам</h3>
        <TeamsChart teams={stats.teams} />
      </div>
    </div>
  );
};
