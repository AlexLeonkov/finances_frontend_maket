import { DashboardKpiCard } from './DashboardKpiCard';
import { KpiData } from '../types';

type DashboardKpiGridProps = {
  kpis: KpiData[];
};

export const DashboardKpiGrid = ({ kpis }: DashboardKpiGridProps) => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
    {kpis.map((kpi, index) => (
      <DashboardKpiCard key={`${kpi.label}-${index}`} kpi={kpi} />
    ))}
  </div>
);
