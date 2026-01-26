import { useMemo, useState } from 'react';
import { AlertCircle, Loader2 } from 'lucide-react';
import { StatsDateFilters } from './StatsDateFilters';
import { StatsTotalsGrid } from './StatsTotalsGrid';
import { StatsTeamsList } from './StatsTeamsList';
import { TeamsChart } from '../charts/TeamsChart';
import { MarginByTypeChart } from '../charts/MarginByTypeChart';
import { StatsTypeBreakdownTable } from './StatsTypeBreakdownTable';
import { StatsTeamTypeTable } from './StatsTeamTypeTable';
import { DailyProfitChart } from '../charts/DailyProfitChart';
import { getDatePresets } from '../lib/datePresets';
import { normalizeTeamName } from '../lib/selectors';
import { useStats } from '../hooks/useStats';
import { DailyProfitPoint, TeamTypePerformanceRow, TypeBreakdownRow } from '../types';

type MarginByTypeEntry = { type: string } & Record<string, number | string>;

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
  const [selectedTeam, setSelectedTeam] = useState('all');
  const [selectedType, setSelectedType] = useState('all');
  const teamTypePerformanceRows: TeamTypePerformanceRow[] = stats?.teamTypePerformance ?? [];
  const teamOptions = ['all', ...new Set(teamTypePerformanceRows.map((row) => row.team))];
  const typeOptions = ['all', ...new Set(teamTypePerformanceRows.map((row) => row.type))];
  const filteredTeamTypeRows = teamTypePerformanceRows.filter((row) => {
    const matchesTeam = selectedTeam === 'all' || row.team === selectedTeam;
    const matchesType = selectedType === 'all' || row.type === selectedType;
    return matchesTeam && matchesType;
  });
  const dailyProfitData: DailyProfitPoint[] = stats?.dailyProfit ?? [];
  const typeBreakdownRows: TypeBreakdownRow[] = stats?.typeBreakdown ?? [];
  const marginByTypeRows: { type: string; team: string; profit: number }[] = stats?.marginByTypeTeams ?? [];
  const marginByTypeTeams = Array.from(new Set(marginByTypeRows.map((row) => row.team)));
  const marginByTypeData = Array.from(
    marginByTypeRows.reduce((acc, row) => {
      const existing: MarginByTypeEntry = acc.get(row.type) ?? { type: row.type };
      existing[row.team] = row.profit;
      acc.set(row.type, existing);
      return acc;
    }, new Map<string, MarginByTypeEntry>()).values(),
  ).map((entry) => {
    marginByTypeTeams.forEach((team) => {
      if (!(team in entry)) {
        entry[team] = 0;
      }
    });
    return entry;
  });

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

      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <h3 className="text-lg font-bold text-slate-800 mb-6">Маржа по типам проектов</h3>
        <MarginByTypeChart data={marginByTypeData} teams={marginByTypeTeams} />
      </div>

      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <h3 className="text-lg font-bold text-slate-800 mb-6">Детализация по типам проектов</h3>
        <StatsTypeBreakdownTable rows={typeBreakdownRows} />
      </div>

      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <h3 className="text-lg font-bold text-slate-800">Команда vs тип проекта</h3>
          <div className="flex flex-wrap gap-3">
            <label className="text-sm text-slate-500">
              Команда
              <select
                className="ml-2 rounded-md border border-slate-200 bg-white px-3 py-1 text-slate-700"
                value={selectedTeam}
                onChange={(event) => setSelectedTeam(event.target.value)}
              >
                {teamOptions.map((team) => (
                  <option key={team} value={team}>
                    {team === 'all' ? 'Все' : normalizeTeamName(team)}
                  </option>
                ))}
              </select>
            </label>
            <label className="text-sm text-slate-500">
              Тип
              <select
                className="ml-2 rounded-md border border-slate-200 bg-white px-3 py-1 text-slate-700"
                value={selectedType}
                onChange={(event) => setSelectedType(event.target.value)}
              >
                {typeOptions.map((type) => (
                  <option key={type} value={type}>
                    {type === 'all' ? 'Все' : type}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </div>
        <StatsTeamTypeTable rows={filteredTeamTypeRows} />
      </div>

      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <h3 className="text-lg font-bold text-slate-800 mb-6">Прибыль по дням</h3>
        <DailyProfitChart data={dailyProfitData} />
      </div>
    </div>
  );
};
