import { useMemo, useState } from 'react';
import { DashboardFiltersBar } from './DashboardFiltersBar';
import { DashboardKpiGrid } from './DashboardKpiGrid';
import { DashboardTeamPerformance } from './DashboardTeamPerformance';
import { DashboardTopProjectsCard } from './DashboardTopProjectsCard';
import { RevenueProfitChart } from '../charts/RevenueProfitChart';
import { DashboardLoading } from './DashboardLoading';
import { DashboardError } from './DashboardError';
import { DashboardEmpty } from './DashboardEmpty';
import { useDashboardSummary } from '../hooks/useDashboardSummary';
import { generateSparklineData } from '../lib/selectors';
import { KpiData } from '../types';

export const DashboardPage = () => {
  const [selectedMonth, setSelectedMonth] = useState<string | null>(null);
  const { summary, loading, error } = useDashboardSummary(selectedMonth);

  const availableMonths = summary?.availableMonths ?? [];
  const monthlyData = summary?.monthly ?? [];
  const teamPerformance = summary?.teamPerformance ?? [];
  const topProjects = summary?.topProjects ?? [];
  const kpiSource = summary?.kpis;

  const kpis = useMemo<KpiData[]>(() => {
    const revenueTrend = kpiSource?.revenueTrendPercent ?? 0;
    const profitTrend = kpiSource?.profitTrendPercent ?? 0;
    const totalRevenue = kpiSource?.totalRevenue ?? 0;
    const totalProfit = kpiSource?.totalProfit ?? 0;
    const outstandingDebt = kpiSource?.outstandingDebt ?? 0;
    const totalOperations = kpiSource?.totalOperations ?? 0;
    const averageMargin = kpiSource?.averageMargin ?? 0;
    const unpaidCount = kpiSource?.unpaidCount ?? 0;

    const revenueChartData = generateSparklineData(monthlyData.map((m) => m.revenue));
    const profitChartData = generateSparklineData(monthlyData.map((m) => m.profit));
    const debtChartData = generateSparklineData([outstandingDebt]);
    const operationsChartData = generateSparklineData([totalOperations]);

    return [
      {
        label: 'Выручка (Всего)',
        val: totalRevenue,
        trend: `${revenueTrend >= 0 ? '+' : ''}${revenueTrend.toFixed(0)}%`,
        sub: `${monthlyData.length} месяцев данных`,
        chart: revenueChartData,
        color: '#4F46E5',
      },
      {
        label: 'Чистая Прибыль',
        val: totalProfit,
        trend: `${profitTrend >= 0 ? '+' : ''}${profitTrend.toFixed(0)}%`,
        sub: `Маржа ${averageMargin.toFixed(1)}%`,
        chart: profitChartData,
        color: '#10B981',
      },
      {
        label: 'Дебиторка (Долг)',
        val: outstandingDebt,
        trend: `${unpaidCount}`,
        sub: `${unpaidCount} неоплаченных`,
        chart: debtChartData,
        color: '#F59E0B',
      },
      {
        label: 'Всего объектов',
        val: totalOperations,
        trend: `+${totalOperations}`,
        sub: `${monthlyData.length > 0 ? `Последний: ${monthlyData[monthlyData.length - 1].name}` : 'Нет данных'}`,
        chart: operationsChartData,
        color: '#6366F1',
      },
    ];
  }, [kpiSource, monthlyData]);

  if (loading) return <DashboardLoading />;
  if (error) return <DashboardError message={error} />;
  const hasData =
    monthlyData.length > 0 ||
    teamPerformance.length > 0 ||
    topProjects.length > 0 ||
    (kpiSource?.totalOperations ?? 0) > 0;

  if (!hasData) return <DashboardEmpty />;

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <DashboardFiltersBar
        selectedMonth={selectedMonth}
        availableMonths={availableMonths}
        onMonthChange={setSelectedMonth}
      />

      <DashboardKpiGrid kpis={kpis} />

      <DashboardTeamPerformance data={teamPerformance} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="font-bold text-slate-800">{selectedMonth ? 'Выручка и прибыль' : 'Рост выручки (Полгода)'}</h3>
              <p className="text-sm text-slate-400">
                {selectedMonth ? 'Данные за выбранный период' : 'Сравнение эффективности команд'}
              </p>
            </div>
            <div className="flex bg-slate-100 p-1 rounded-lg">
              <button className="text-xs font-bold px-3 py-1 bg-white shadow-sm rounded text-slate-800">Выручка</button>
              <button className="text-xs font-bold px-3 py-1 text-slate-500 hover:text-slate-800">Маржа %</button>
            </div>
          </div>
          <RevenueProfitChart data={monthlyData} />
        </div>

        <DashboardTopProjectsCard projects={topProjects} />
      </div>
    </div>
  );
};
