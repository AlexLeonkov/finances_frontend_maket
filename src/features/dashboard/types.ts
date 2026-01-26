export interface Operation {
  id: number;
  invoiceNumber: string;
  team: string | null;
  members: string;
  date: string;
  revenue: number;
  materialCost: number;
  fuelCost: number;
  isPaid: boolean;
  profit: number;
  createdAt: string;
}

export interface StatsTeam {
  name: string;
  operations: number;
  revenue: number;
  profit: number;
}

export interface StatsResponse {
  period: {
    start: string;
    end: string;
  };
  totals: {
    operations: number;
    revenue: number;
    profit: number;
    expenses: number;
  };
  teams: StatsTeam[];
}

export interface MonthOption {
  key: string;
  label: string;
}

export interface MonthlyTrend {
  name: string;
  revenue: number;
  profit: number;
}

export interface TeamPerformance {
  team: string;
  revenue: number;
  profit: number;
  count: number;
  margin: number;
  color: string;
}

export interface KpiData {
  label: string;
  val: number;
  trend: string;
  sub: string;
  chart: SparklinePoint[];
  color: string;
}

export interface SparklinePoint {
  val: number;
}

export interface TopProject {
  name: string;
  margin: string;
  profit: number;
  team: string;
}

export interface DatePreset {
  start: string;
  end: string;
  label: string;
}

export interface DashboardSummaryKpis {
  totalRevenue: number;
  totalProfit: number;
  outstandingDebt: number;
  totalOperations: number;
  averageMargin: number;
  unpaidCount: number;
  revenueTrendPercent?: number;
  profitTrendPercent?: number;
}

export interface DashboardSummaryResponse {
  availableMonths?: MonthOption[];
  monthly?: MonthlyTrend[];
  topProjects?: TopProject[];
  teamPerformance?: TeamPerformance[];
  kpis?: DashboardSummaryKpis;
}
