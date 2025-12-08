import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

import { 

  LayoutGrid, Users, Box, Layers, Plus, 

  AlertTriangle, 

  Filter, Download, MoreHorizontal, 

  ChevronRight, 

  Zap, Battery, Settings,

  ChevronLeft, FileText, Send, Check, RefreshCw,

  Home, Plug, Loader2, AlertCircle, 

  Package, TrendingUp

} from 'lucide-react';

import { 

  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,

  BarChart, Bar, AreaChart, Area

} from 'recharts';

// --- CONFIG & CONSTANTS ---

// Backend API URL configuration (приоритет):
// 1. VITE_API_URL из env переменной (если задана)
// 2. VITE_BACKEND_URL из env переменной (если задана) 
// 3. Если dev режим: используем /api (Vite proxy)
// 4. Иначе: захардкоженный Heroku URL по умолчанию
const DEFAULT_HEROKU_URL = 'https://bakcenderp-c6bdf019f05d.herokuapp.com';
const isDev = (import.meta as any).env?.DEV || (import.meta as any).env?.MODE === 'development';
const envApiUrl = (import.meta as any).env?.VITE_API_URL || (import.meta as any).env?.VITE_BACKEND_URL;
const API_BASE_URL = envApiUrl || (isDev ? '/api' : DEFAULT_HEROKU_URL);

const COLORS = {

  AC01: '#3B82F6', AC02: '#10B981', AC03: '#F59E0B', AC04: '#EC4899',

  bg: '#F5F6FA', card: '#FFFFFF', text: '#1E293B'

};

const TEAMS = [

  { id: 'AC01', name: 'AC01', members: 'Alex + Dima', color: COLORS.AC01, avatar: 'A', stats: { rev: '€ 245k', speed: 'High' } },

  { id: 'AC02', name: 'AC02', members: 'Sergei + Ivan', color: COLORS.AC02, avatar: 'S', stats: { rev: '€ 210k', speed: 'Avg' } },

  { id: 'AC03', name: 'AC03', members: 'Max + Oleg', color: COLORS.AC03, avatar: 'M', stats: { rev: '€ 195k', speed: 'Avg' } },

  { id: 'AC04', name: 'AC04', members: 'Viktor + Andy', color: COLORS.AC04, avatar: 'V', stats: { rev: '€ 192k', speed: 'Low' } },

];

// --- 6 MONTHS MOCK DATA ---

// Mock data removed - now using real backend data

// 3. WAREHOUSE (Realistic Cable & Components)

const WAREHOUSE_DATA = [

  { id: 'w1', name: 'NYM-J 5x10 mm²', cat: 'Kabel AC', stock: 320, unit: 'm', max: 500, min: 50, status: 'ok' },

  { id: 'w2', name: 'NYM-J 5x6 mm²', cat: 'Kabel AC', stock: 25, unit: 'm', max: 200, min: 40, status: 'warning' }, 

  { id: 'w3', name: 'H1Z2Z2-K 6mm² (Solar)', cat: 'Kabel DC', stock: 850, unit: 'm', max: 1000, min: 200, status: 'ok' },

  { id: 'w4', name: 'SLS Schalter E35A', cat: 'Schutz', stock: 2, unit: 'stk', max: 20, min: 4, status: 'critical' }, 

  { id: 'w5', name: 'ÜSS Weidmüller DC', cat: 'Schutz', stock: 14, unit: 'stk', max: 30, min: 5, status: 'ok' },

  { id: 'w6', name: 'Huawei SmartMeter 3-phase', cat: 'Komponenten', stock: 8, unit: 'stk', max: 15, min: 2, status: 'ok' },

  { id: 'w7', name: 'Sungrow Hybrid SH10RT', cat: 'Inverter', stock: 3, unit: 'stk', max: 5, min: 1, status: 'ok' },

  { id: 'w8', name: 'MC4 Stecker (Paar)', cat: 'Kleinteile', stock: 120, unit: 'paar', max: 200, min: 50, status: 'ok' },

];

// 4. INVOICE QUEUE

const MOCK_INVOICE_QUEUE = [

  { id: 205, client: 'Enpal GmbH', address: 'Berlin, Hauptstr. 12', type: 'PV Complete', planDate: '2023-10-26', status: 'ready', team: 'AC01' },

  { id: 204, client: '1KOMMA5°', address: 'Potsdam, Lindenweg 4', type: 'Speicher', planDate: '2023-10-25', status: 'sent', team: 'AC02' },

  { id: 203, client: 'Dr. Müller (Private)', address: 'Bernau, Feldstr. 88', type: 'Wallbox', planDate: '2023-10-24', status: 'paid', team: 'AC03' },

  { id: 202, client: 'Enpal GmbH', address: 'Oranienburg, See 2', type: 'PV Complete', planDate: '2023-10-27', status: 'ready', team: 'AC01' },

  { id: 201, client: 'SolarDirekt', address: 'Falkensee, Ring 10', type: 'Gen1/Gen2', planDate: '2023-10-23', status: 'sent', team: 'AC04' },

];

const JOB_TEMPLATES = [

  { id: 'pv_ac_dc', name: 'PV Complete (AC+DC)', price: 2400, icon: Zap, desc: 'Полный монтаж до 10 kWp' },

  { id: 'pv_dc', name: 'PV DC Only', price: 1500, icon: Home, desc: 'Только крышные работы' },

  { id: 'speicher', name: 'Speicher Installation', price: 850, icon: Battery, desc: 'Установка аккумулятора' },

  { id: 'retrofit', name: 'Retrofit / Wechsel', price: 1200, icon: RefreshCw, desc: 'Замена инвертора/системы' },

  { id: 'wallbox', name: 'Wallbox', price: 650, icon: Plug, desc: 'Монтаж зарядной станции' },

  { id: 'service', name: 'Wartung / Service', price: 250, icon: Settings, desc: 'Выезд сервисной бригады' },

];

// --- TYPES ---

interface Operation {
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

interface BackendStatsTeam {
  name: string;
  operations: number;
  revenue: number;
  profit: number;
}

interface BackendStatsResponse {
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
  teams: BackendStatsTeam[];
}

// --- UTILS ---

const formatEUR = (val: number) => new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(val);

// --- COMPONENTS ---

const Sparkline = ({ data, color }: { data: any[], color: string }) => (

  <div className="h-12 w-24">

    <ResponsiveContainer width="100%" height="100%">

      <AreaChart data={data}>

        <defs>

          <linearGradient id={`grad_${color}`} x1="0" y1="0" x2="0" y2="1">

            <stop offset="5%" stopColor={color} stopOpacity={0.3}/>

            <stop offset="95%" stopColor={color} stopOpacity={0}/>

          </linearGradient>

        </defs>

        <Area type="monotone" dataKey="val" stroke={color} strokeWidth={2} fill={`url(#grad_${color})`} />

      </AreaChart>

    </ResponsiveContainer>

  </div>

);

const StatusTag = ({ status }: { status: string }) => {

  const styles: any = {

    paid: 'bg-emerald-100 text-emerald-700',

    pending: 'bg-amber-100 text-amber-700',

    overdue: 'bg-rose-100 text-rose-700',

    ready: 'bg-indigo-100 text-indigo-700',

    sent: 'bg-slate-100 text-slate-700',

  };

  const labels: any = {

    paid: 'Оплачено', pending: 'В работе', overdue: 'Просрочено', ready: 'Ждет счет', sent: 'Отправлено'

  };

  return (

    <span className={`px-2.5 py-1 rounded-md text-xs font-bold uppercase tracking-wider ${styles[status] || 'bg-slate-100'}`}>

      {labels[status] || status}

    </span>

  );

};

const TypeTag = ({ type }: { type: string }) => {

  let color = 'bg-slate-100 text-slate-600';

  if(type.includes('PV')) color = 'bg-blue-100 text-blue-700';

  if(type.includes('Speicher')) color = 'bg-purple-100 text-purple-700';

  if(type.includes('Wallbox')) color = 'bg-orange-100 text-orange-700';

  if(type.includes('Retrofit')) color = 'bg-amber-100 text-amber-700';

  return <span className={`px-2 py-0.5 rounded text-[11px] font-medium ${color}`}>{type}</span>

}

// ============================================

// PAGE: DASHBOARD (6 MONTH VIEW)

// ============================================

const Dashboard = () => {

  const [operations, setOperations] = useState<Operation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedMonth, setSelectedMonth] = useState<string | null>(null); // Format: "2025-12" or null for all

  useEffect(() => {
    const fetchOperations = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Direct backend call using Heroku URL from env
        const response = await fetch(`${API_BASE_URL}/operations`, {
          method: 'GET',
          mode: 'cors',
          credentials: 'omit',
          headers: {
            'Accept': 'application/json',
          },
        });
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        setOperations(data);
        setError(null);
      } catch (err) {
        const errorMessage = err instanceof Error 
          ? err.message 
          : 'Failed to load operations';
        
        let userMessage = 'Не удалось загрузить данные';
        if (errorMessage.includes('Failed to fetch') || errorMessage.includes('NetworkError') || errorMessage.includes('CORS')) {
          userMessage = 'Ошибка CORS: Сервер не отправляет заголовок Access-Control-Allow-Origin. Backend должен разрешать запросы с этого домена.';
        } else if (errorMessage.includes('Unexpected token') || errorMessage.includes('JSON')) {
          userMessage = 'Ошибка формата данных: Сервер вернул невалидный JSON.';
        } else if (errorMessage.includes('HTTP error')) {
          userMessage = `Ошибка сервера: ${errorMessage}`;
        }
        
        console.error('Full error details:', {
          message: errorMessage,
          error: err,
          url: `${API_BASE_URL}/operations`
        });
        
        setError(userMessage);
        console.error('Error fetching operations:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchOperations();
  }, []);

  // Filter operations by selected month
  const getFilteredOperations = () => {
    if (!selectedMonth) return operations;
    
    return operations.filter(op => {
      const date = new Date(op.date);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      return monthKey === selectedMonth;
    });
  };

  // Get available months from data
  const getAvailableMonths = () => {
    const monthsSet = new Set<string>();
    operations.forEach(op => {
      const date = new Date(op.date);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      monthsSet.add(monthKey);
    });
    
    const monthNames = ['Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь', 'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'];
    
    return Array.from(monthsSet)
      .sort()
      .reverse()
      .map(monthKey => {
        const [year, month] = monthKey.split('-');
        const monthIndex = parseInt(month) - 1;
        return {
          key: monthKey,
          label: `${monthNames[monthIndex]} ${year}`,
        };
      });
  };

  // Normalize team name - replace cyrillic С with latin C, uppercase and trim
  const normalizeTeam = (team: string | null | undefined): string => {
    if (!team) return 'Без команды';
    // Replace cyrillic С (U+0421) with latin C (U+0043) and А (U+0410) with A (U+0041)
    return team.trim()
      .replace(/А/g, 'A')  // Replace cyrillic А with latin A
      .replace(/С/g, 'C')  // Replace cyrillic С with latin C
      .toUpperCase();
  };

  // Calculate team performance
  const calculateTeamPerformance = () => {
    const filteredOps = getFilteredOperations();
    const teamStats: { [key: string]: { revenue: number; profit: number; count: number; margin: number } } = {};
    
    filteredOps.forEach(op => {
      const teamKey = normalizeTeam(op.team);
      
      if (!teamStats[teamKey]) {
        teamStats[teamKey] = { revenue: 0, profit: 0, count: 0, margin: 0 };
      }
      
      teamStats[teamKey].revenue += op.revenue;
      teamStats[teamKey].profit += op.profit;
      teamStats[teamKey].count += 1;
    });
    
    // Calculate margins
    Object.keys(teamStats).forEach(team => {
      const stats = teamStats[team];
      stats.margin = stats.revenue > 0 ? (stats.profit / stats.revenue) * 100 : 0;
    });
    
    return Object.entries(teamStats)
      .map(([team, stats]) => ({
        team,
        ...stats,
        color: COLORS[team as keyof typeof COLORS] || '#94A3B8',
      }))
      .sort((a, b) => b.revenue - a.revenue);
  };

  // Calculate KPIs from real data
  const calculateKPIs = () => {
    const filteredOps = getFilteredOperations();
    
    if (filteredOps.length === 0) {
      return {
        totalRevenue: 0,
        totalProfit: 0,
        outstandingDebt: 0,
        totalOperations: 0,
        averageMargin: 0,
        unpaidCount: 0,
        unprofitableCount: 0,
        unprofitableProjects: [] as Operation[],
      };
    }

    const totalRevenue = filteredOps.reduce((sum, op) => sum + op.revenue, 0);
    const totalProfit = filteredOps.reduce((sum, op) => sum + op.profit, 0);
    const outstandingDebt = filteredOps
      .filter(op => !op.isPaid)
      .reduce((sum, op) => sum + op.revenue, 0);
    const unpaidCount = filteredOps.filter(op => !op.isPaid).length;
    const averageMargin = totalRevenue > 0 ? (totalProfit / totalRevenue) * 100 : 0;
    
    const unprofitableProjects = filteredOps.filter(op => op.profit < 0);
    const unprofitableCount = unprofitableProjects.length;

    return {
      totalRevenue,
      totalProfit,
      outstandingDebt,
      totalOperations: filteredOps.length,
      averageMargin,
      unpaidCount,
      unprofitableCount,
      unprofitableProjects,
    };
  };

  // Calculate monthly revenue for chart
  const calculateMonthlyData = () => {
    const filteredOps = getFilteredOperations();
    const monthlyData: { [key: string]: { revenue: number; profit: number } } = {};
    
    filteredOps.forEach(op => {
      const date = new Date(op.date);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      
      if (!monthlyData[monthKey]) {
        monthlyData[monthKey] = { revenue: 0, profit: 0 };
      }
      
      monthlyData[monthKey].revenue += op.revenue;
      monthlyData[monthKey].profit += op.profit;
    });

    // Get last 6 months or selected month
    const months = selectedMonth 
      ? [selectedMonth]
      : Object.keys(monthlyData).sort().slice(-6);
    const monthNames = ['Янв', 'Фев', 'Мар', 'Апр', 'Май', 'Июн', 'Июл', 'Авг', 'Сен', 'Окт', 'Ноя', 'Дек'];
    
    return months.map(monthKey => {
      const [, month] = monthKey.split('-');
      const monthIndex = parseInt(month) - 1;
      return {
        name: monthNames[monthIndex],
        revenue: monthlyData[monthKey]?.revenue || 0,
        profit: monthlyData[monthKey]?.profit || 0,
      };
    });
  };

  // Get top 3 most profitable projects
  const getTopProjects = () => {
    const filteredOps = getFilteredOperations();
    return filteredOps
      .filter(op => op.profit > 0)
      .sort((a, b) => b.profit - a.profit)
      .slice(0, 3)
      .map(op => ({
        name: op.invoiceNumber,
        margin: op.revenue > 0 ? ((op.profit / op.revenue) * 100).toFixed(1) : '0',
        profit: op.profit,
        team: op.team || op.members,
      }));
  };

  // Generate sparkline data from monthly trends
  const generateSparklineData = (values: number[]) => {
    if (values.length === 0) return [{val: 0}];
    const max = Math.max(...values);
    const min = Math.min(...values);
    const range = max - min || 1;
    return values.map(val => ({ val: ((val - min) / range) * 100 }));
  };

  const kpis = calculateKPIs();
  const monthlyData = calculateMonthlyData();
  const topProjects = getTopProjects();
  const teamPerformance = calculateTeamPerformance();
  const availableMonths = getAvailableMonths();

  // Calculate trends (comparing last 2 months if available)
  const revenueTrendNum = monthlyData.length >= 2 
    ? ((monthlyData[monthlyData.length - 1].revenue - monthlyData[monthlyData.length - 2].revenue) / monthlyData[monthlyData.length - 2].revenue * 100)
    : 0;
  const revenueTrend = revenueTrendNum.toFixed(0);
  
  const profitTrendNum = monthlyData.length >= 2
    ? ((monthlyData[monthlyData.length - 1].profit - monthlyData[monthlyData.length - 2].profit) / Math.abs(monthlyData[monthlyData.length - 2].profit) * 100)
    : 0;
  const profitTrend = profitTrendNum.toFixed(0);

  const revenueChartData = generateSparklineData(monthlyData.map(m => m.revenue));
  const profitChartData = generateSparklineData(monthlyData.map(m => m.profit));
  const debtChartData = generateSparklineData([kpis.outstandingDebt]);
  const operationsChartData = generateSparklineData([kpis.totalOperations]);

  const kpiData = [

    { label: 'Выручка (Всего)', val: kpis.totalRevenue, trend: `${revenueTrendNum >= 0 ? '+' : ''}${revenueTrend}%`, sub: `${monthlyData.length} месяцев данных`, chart: revenueChartData, color: '#4F46E5' },

    { label: 'Чистая Прибыль', val: kpis.totalProfit, trend: `${profitTrendNum >= 0 ? '+' : ''}${profitTrend}%`, sub: `Маржа ${kpis.averageMargin.toFixed(1)}%`, chart: profitChartData, color: '#10B981' },

    { label: 'Дебиторка (Долг)', val: kpis.outstandingDebt, trend: `${kpis.unpaidCount}`, sub: `${kpis.unpaidCount} неоплаченных`, chart: debtChartData, color: '#F59E0B' },

    { label: 'Всего объектов', val: kpis.totalOperations, trend: `+${kpis.totalOperations}`, sub: `${monthlyData.length > 0 ? `Последний: ${monthlyData[monthlyData.length - 1].name}` : 'Нет данных'}`, chart: operationsChartData, color: '#6366F1' },

  ];

  if (loading) {
    return (
      <div className="space-y-6 animate-in fade-in duration-500">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm animate-pulse">
              <div className="h-4 bg-slate-200 rounded w-24 mb-4"></div>
              <div className="h-8 bg-slate-200 rounded w-32 mb-2"></div>
              <div className="h-4 bg-slate-200 rounded w-20"></div>
            </div>
          ))}
        </div>
        <div className="flex items-center justify-center p-12">
          <Loader2 className="animate-spin text-indigo-600" size={32} />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6 animate-in fade-in duration-500">
        <div className="bg-rose-50 border border-rose-200 rounded-xl p-6 text-center">
          <AlertCircle className="text-rose-600 mx-auto mb-4" size={32} />
          <h3 className="font-bold text-rose-800 mb-2">Ошибка загрузки данных</h3>
          <p className="text-rose-600 text-sm">{error}</p>
        </div>
      </div>
    );
  }

  return (

    <div className="space-y-6 animate-in fade-in duration-500">

      {/* FILTER BAR */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="text-sm font-bold text-slate-600">Период:</span>
          <select
            value={selectedMonth || ''}
            onChange={(e) => setSelectedMonth(e.target.value || null)}
            className="px-4 py-2 border border-slate-300 rounded-lg text-sm font-medium text-slate-700 bg-white hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          >
            <option value="">Все периоды</option>
            {availableMonths.map(month => (
              <option key={month.key} value={month.key}>{month.label}</option>
            ))}
          </select>
          {selectedMonth && (
            <button
              onClick={() => setSelectedMonth(null)}
              className="text-xs text-slate-500 hover:text-slate-700 underline"
            >
              Сбросить
            </button>
          )}
        </div>
        {selectedMonth && (
          <div className="text-sm text-slate-500">
            Показано: {availableMonths.find(m => m.key === selectedMonth)?.label}
          </div>
        )}
      </div>

      {/* KPI GRID */}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">

        {kpiData.map((kpi, i) => (

          <div key={i} className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex justify-between items-end hover:shadow-md transition-shadow">

            <div>

              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">{kpi.label}</p>

              <h3 className="text-2xl font-bold text-slate-800 tabular-nums">{kpi.label.includes('объектов') ? kpi.val : formatEUR(kpi.val)}</h3>

              <div className="flex items-center gap-2 mt-2">

                <span className={`text-xs font-bold px-1.5 py-0.5 rounded ${kpi.trend.startsWith('+') || !kpi.trend.includes('-') ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>

                  {kpi.trend}

                </span>

                <span className="text-xs text-slate-400">{kpi.sub}</span>

              </div>

            </div>

            <Sparkline data={kpi.chart} color={kpi.color} />

          </div>

        ))}

      </div>

      {/* WARNINGS BLOCK */}
{/* 
      {kpis.unprofitableCount > 0 && (
        <div className="bg-rose-50 border border-rose-100 rounded-xl p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">

          <div className="flex items-center gap-3">

              <div className="bg-white p-2 rounded-full text-rose-600 shadow-sm"><AlertTriangle size={20}/></div>

              <div>

                  <h4 className="font-bold text-rose-800 text-sm">Внимание: {kpis.unprofitableCount} {kpis.unprofitableCount === 1 ? 'убыточный проект' : kpis.unprofitableCount < 5 ? 'убыточных проекта' : 'убыточных проектов'}</h4>

                  <p className="text-xs text-rose-600">
                    {kpis.unprofitableProjects.slice(0, 2).map((op, idx) => (
                      <span key={op.id}>
                        {op.invoiceNumber} ({formatEUR(op.profit)}){idx < Math.min(2, kpis.unprofitableProjects.length) - 1 ? ', ' : ''}
                      </span>
                    ))}
                    {kpis.unprofitableProjects.length > 2 && ` и еще ${kpis.unprofitableProjects.length - 2}`}
                  </p>

              </div>

          </div>

          <div className="flex gap-2">

              <button className="text-xs font-bold bg-white text-rose-700 px-3 py-2 rounded-lg border border-rose-200 hover:bg-rose-100">Подробнее</button>

          </div>

        </div>
      )} */}

      {/* TEAM PERFORMANCE SECTION */}
      {teamPerformance.length > 0 && (
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <h3 className="font-bold text-slate-800 mb-6">Аналитика по командам</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {teamPerformance.map((team, idx) => (
              <div key={idx} className="border border-slate-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex items-center gap-2 mb-3">
                  <span className="w-3 h-3 rounded-full" style={{backgroundColor: team.color}}></span>
                  <h4 className="font-bold text-slate-800">{team.team}</h4>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">Выручка:</span>
                    <span className="font-bold text-slate-800">{formatEUR(team.revenue)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">Прибыль:</span>
                    <span className={`font-bold ${team.profit >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                      {formatEUR(team.profit)}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">Маржа:</span>
                    <span className={`font-bold ${team.margin > 20 ? 'text-emerald-600' : team.margin > 0 ? 'text-amber-600' : 'text-rose-600'}`}>
                      {team.margin.toFixed(1)}%
                    </span>
                  </div>
                  <div className="flex justify-between text-sm pt-2 border-t border-slate-100">
                    <span className="text-slate-500">Проектов:</span>
                    <span className="font-bold text-slate-800">{team.count}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Team Comparison Chart */}
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={teamPerformance}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0"/>
                <XAxis 
                  dataKey="team" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{fontSize:12, fill:'#94A3B8'}} 
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{fontSize:12, fill:'#94A3B8'}} 
                  tickFormatter={(val) => `€${(val/1000).toFixed(0)}k`}
                />
                <Tooltip 
                  contentStyle={{borderRadius:'8px', border:'none', boxShadow:'0 10px 15px -3px rgb(0 0 0 / 0.1)'}}
                  formatter={(value: number) => formatEUR(value)}
                />
                <Bar dataKey="revenue" fill="#4F46E5" radius={[4,4,0,0]} name="Выручка" />
                <Bar dataKey="profit" fill="#10B981" radius={[4,4,0,0]} name="Прибыль" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          

          {/* MAIN CHART (6 MONTHS) */}

          <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-slate-200 shadow-sm">

             <div className="flex justify-between items-center mb-6">

                <div>

                    <h3 className="font-bold text-slate-800">
                      {selectedMonth ? 'Выручка и прибыль' : 'Рост выручки (Полгода)'}
                    </h3>

                    <p className="text-sm text-slate-400">
                      {selectedMonth ? 'Данные за выбранный период' : 'Сравнение эффективности команд'}
                    </p>

                </div>

                <div className="flex bg-slate-100 p-1 rounded-lg">

                    <button className="text-xs font-bold px-3 py-1 bg-white shadow-sm rounded text-slate-800">Выручка</button>

                    <button className="text-xs font-bold px-3 py-1 text-slate-500 hover:text-slate-800">Маржа %</button>

                </div>

             </div>

             <div className="h-72">

                {monthlyData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">

                      <LineChart data={monthlyData}>

                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0"/>

                          <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize:12, fill:'#94A3B8'}} dy={10} />

                          <YAxis axisLine={false} tickLine={false} tick={{fontSize:12, fill:'#94A3B8'}} tickFormatter={(val) => `€${(val/1000).toFixed(0)}k`}/>

                          <Tooltip 
                            contentStyle={{borderRadius:'8px', border:'none', boxShadow:'0 10px 15px -3px rgb(0 0 0 / 0.1)'}}
                            formatter={(value: number) => formatEUR(value)}
                          />

                          <Line type="monotone" dataKey="revenue" stroke="#4F46E5" strokeWidth={3} dot={{r:4}} name="Выручка" />

                          <Line type="monotone" dataKey="profit" stroke="#10B981" strokeWidth={3} dot={{r:4}} name="Прибыль" />

                      </LineChart>

                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-full text-slate-400">
                    <p>Нет данных для отображения</p>
                  </div>
                )}

             </div>

          </div>

          {/* TOP PROJECTS LIST */}

          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col">

              <h3 className="font-bold text-slate-800 mb-4">ТОП-3 Проекта</h3>

              <div className="flex-1 space-y-4">

                  {topProjects.length > 0 ? (
                    topProjects.map((p, i) => (

                        <div key={i} className="flex justify-between items-center pb-3 border-b border-slate-50 last:border-0">

                            <div>

                                <p className="font-bold text-sm text-slate-700 truncate w-32 md:w-auto">{p.name}</p>

                                <div className="flex items-center gap-2">

                                  <span className="text-[10px] font-bold px-1.5 py-0.5 bg-slate-100 text-slate-500 rounded">{p.team}</span>

                                  <p className="text-xs text-slate-400">Прибыль: {formatEUR(p.profit)}</p>

                                </div>

                            </div>

                            <div className="text-right">

                                <span className="text-sm font-bold text-emerald-600">{p.margin}%</span>

                            </div>

                        </div>

                    ))
                  ) : (
                    <div className="text-center text-slate-400 py-8">
                      <p className="text-sm">Нет прибыльных проектов</p>
                    </div>
                  )}

              </div>

              {kpis.unprofitableCount > 0 && (
                <button className="mt-auto w-full py-3 text-xs font-bold text-rose-600 hover:bg-rose-50 rounded-lg border border-dashed border-rose-300 transition-colors">

                    Показать убыточные проекты ({kpis.unprofitableCount})

                </button>
              )}

          </div>

      </div>

    </div>

  );

};

// ============================================

// PAGE: TEAMS

// ============================================

// Helper function to normalize team names - replace cyrillic С with latin C
const normalizeTeam = (team: string | null | undefined): string => {
    if (!team) return 'Без команды';
    // Replace cyrillic С (U+0421) with latin C (U+0043) and А (U+0410) with A (U+0041)
    return team.trim()
      .replace(/А/g, 'A')  // Replace cyrillic А with latin A
      .replace(/С/g, 'C')  // Replace cyrillic С with latin C
      .toUpperCase();
};

const Teams = () => {

    const [operations, setOperations] = useState<Operation[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedTeam, setSelectedTeam] = useState<string | null>(null);
    const [dateRange, setDateRange] = useState<{ from: string; to: string }>({ from: '', to: '' });

    useEffect(() => {
        const fetchOperations = async () => {
          try {
            setLoading(true);
            setError(null);
            
            // Direct backend call using Heroku URL from env
            const response = await fetch(`${API_BASE_URL}/operations`, {
              headers: {
                'Content-Type': 'application/json',
              },
            });
            
            if (!response.ok) {
              throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            setOperations(data);
            setError(null);
          } catch (err) {
            const errorMessage = err instanceof Error 
              ? err.message 
              : 'Failed to load operations';
            
            let userMessage = 'Не удалось загрузить данные';
            if (errorMessage.includes('Failed to fetch') || errorMessage.includes('NetworkError') || errorMessage.includes('CORS')) {
              userMessage = 'Ошибка CORS: Backend должен разрешать запросы с этого домена. Проверьте настройки CORS на сервере.';
            } else if (errorMessage.includes('HTTP error')) {
              userMessage = `Ошибка сервера: ${errorMessage}`;
            }
            
            setError(userMessage);
            console.error('Error fetching operations:', err);
          } finally {
            setLoading(false);
          }
        };
    
        fetchOperations();
    }, []);

    const filteredOperations = operations.filter(op => {
        const opDate = new Date(op.date).getTime();
        const fromOk = dateRange.from ? opDate >= new Date(dateRange.from).getTime() : true;
        const toOk = dateRange.to ? opDate <= new Date(dateRange.to).getTime() : true;
        return fromOk && toOk;
    });

    const calculateTeamPerformance = () => {
        const teamStats: { [key: string]: { revenue: number; profit: number; count: number; margin: number } } = {};
        
        filteredOperations.forEach(op => {
          const teamKey = normalizeTeam(op.team);
          
          if (!teamStats[teamKey]) {
            teamStats[teamKey] = { revenue: 0, profit: 0, count: 0, margin: 0 };
          }
          
          teamStats[teamKey].revenue += op.revenue;
          teamStats[teamKey].profit += op.profit;
          teamStats[teamKey].count += 1;
        });
        
        Object.keys(teamStats).forEach(team => {
          const stats = teamStats[team];
          stats.margin = stats.revenue > 0 ? (stats.profit / stats.revenue) * 100 : 0;
        });
        
        return Object.entries(teamStats)
          .map(([team, stats]) => ({
            team,
            ...stats,
            color: COLORS[team as keyof typeof COLORS] || '#94A3B8',
          }))
          .sort((a, b) => b.revenue - a.revenue);
    };

    const getTeamHistory = (teamId: string) => {
        const normalizedTeamId = normalizeTeam(teamId);
        const teamOps = filteredOperations.filter(op => normalizeTeam(op.team) === normalizedTeamId);
        const monthly: { [key: string]: { revenue: number; profit: number } } = {};
      
        teamOps.forEach(op => {
          const date = new Date(op.date);
          const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
          if (!monthly[monthKey]) monthly[monthKey] = { revenue: 0, profit: 0 };
          monthly[monthKey].revenue += op.revenue;
          monthly[monthKey].profit += op.profit;
        });
      
        return Object.keys(monthly)
          .sort()
          .slice(-6)
          .map(key => {
            const [, month] = key.split('-');
            const monthNames = ['Янв', 'Фев', 'Мар', 'Апр', 'Май', 'Июн', 'Июл', 'Авг', 'Сен', 'Окт', 'Ноя', 'Дек'];
            const monthIndex = parseInt(month) - 1;
            return {
              name: monthNames[monthIndex],
              revenue: monthly[key].revenue,
              profit: monthly[key].profit,
            };
          });
    };

    const teamPerformance = calculateTeamPerformance();
    const normalizedSelectedTeam = selectedTeam ? normalizeTeam(selectedTeam) : null;
    const selectedStats = normalizedSelectedTeam ? teamPerformance.find(t => normalizeTeam(t.team) === normalizedSelectedTeam) : null;
    const selectedTeamMeta = selectedTeam ? TEAMS.find(t => t.id === selectedTeam) : null;
    const selectedTeamHistory = selectedTeam ? getTeamHistory(selectedTeam) : [];
    const selectedTeamOperations = normalizedSelectedTeam ? filteredOperations.filter(op => normalizeTeam(op.team) === normalizedSelectedTeam).slice(0, 5) : [];

    if (loading) {
        return (
            <div className="space-y-4">
                {[1,2,3].map(key => (
                    <div key={key} className="bg-white h-24 rounded-xl border border-slate-200 animate-pulse" />
                ))}
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-rose-50 border border-rose-200 rounded-xl p-4 text-rose-700">
                {error}
            </div>
        );
    }

    if (!selectedTeam) return (

        <div className="space-y-6 animate-in fade-in">

            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col sm:flex-row gap-3 sm:items-center justify-between">
                <div className="flex flex-wrap items-center gap-2 text-sm text-slate-600">
                    <span className="font-bold text-slate-700">Период:</span>
                    <input
                        type="date"
                        value={dateRange.from}
                        onChange={(e) => setDateRange(r => ({ ...r, from: e.target.value }))}
                        className="px-3 py-2 border border-slate-300 rounded-lg text-sm"
                    />
                    <span className="text-slate-400">—</span>
                    <input
                        type="date"
                        value={dateRange.to}
                        onChange={(e) => setDateRange(r => ({ ...r, to: e.target.value }))}
                        className="px-3 py-2 border border-slate-300 rounded-lg text-sm"
                    />
                </div>
                {(dateRange.from || dateRange.to) && (
                    <button
                        onClick={() => setDateRange({ from: '', to: '' })}
                        className="text-xs font-bold text-indigo-600 hover:text-indigo-700"
                    >
                        Сбросить даты
                    </button>
                )}
            </div>

            {teamPerformance.length > 0 && (
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                    <h3 className="font-bold text-slate-800 mb-6">Аналитика по командам</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                        {teamPerformance.map((team, idx) => (
                          <div key={idx} className="border border-slate-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                            <div className="flex items-center gap-2 mb-3">
                              <span className="w-3 h-3 rounded-full" style={{backgroundColor: team.color}}></span>
                              <h4 className="font-bold text-slate-800">{team.team}</h4>
                            </div>
                            <div className="space-y-2">
                              <div className="flex justify-between text-sm">
                                <span className="text-slate-500">Выручка:</span>
                                <span className="font-bold text-slate-800">{formatEUR(team.revenue)}</span>
                              </div>
                              <div className="flex justify-between text-sm">
                                <span className="text-slate-500">Прибыль:</span>
                                <span className={`font-bold ${team.profit >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                                  {formatEUR(team.profit)}
                                </span>
                              </div>
                              <div className="flex justify-between text-sm">
                                <span className="text-slate-500">Маржа:</span>
                                <span className={`font-bold ${team.margin > 20 ? 'text-emerald-600' : team.margin > 0 ? 'text-amber-600' : 'text-rose-600'}`}>
                                  {team.margin.toFixed(1)}%
                                </span>
                              </div>
                              <div className="flex justify-between text-sm pt-2 border-t border-slate-100">
                                <span className="text-slate-500">Проектов:</span>
                                <span className="font-bold text-slate-800">{team.count}</span>
                              </div>
                            </div>
                          </div>
                        ))}
                    </div>

                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={teamPerformance}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0"/>
                            <XAxis 
                              dataKey="team" 
                              axisLine={false} 
                              tickLine={false} 
                              tick={{fontSize:12, fill:'#94A3B8'}} 
                            />
                            <YAxis 
                              axisLine={false} 
                              tickLine={false} 
                              tick={{fontSize:12, fill:'#94A3B8'}} 
                              tickFormatter={(val) => `€${(val/1000).toFixed(0)}k`}
                            />
                            <Tooltip 
                              contentStyle={{borderRadius:'8px', border:'none', boxShadow:'0 10px 15px -3px rgb(0 0 0 / 0.1)'}}
                              formatter={(value: number) => formatEUR(value)}
                            />
                            <Bar dataKey="revenue" fill="#4F46E5" radius={[4,4,0,0]} name="Выручка" />
                            <Bar dataKey="profit" fill="#10B981" radius={[4,4,0,0]} name="Прибыль" />
                          </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                {TEAMS.map(team => {
                    const stats = teamPerformance.find(t => t.team === team.id);
                    return (
                        <div key={team.id} onClick={() => setSelectedTeam(team.id)} className="group bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:shadow-lg hover:border-indigo-200 transition-all cursor-pointer relative overflow-hidden">
                            <div className={`absolute top-0 left-0 w-1 h-full`} style={{backgroundColor: team.color}}></div>
                            <div className="flex justify-between items-start mb-6">
                                <div className="flex items-center gap-4">
                                    <div className="w-14 h-14 rounded-full flex items-center justify-center text-white font-bold text-xl shadow-md" style={{backgroundColor: team.color}}>
                                        {team.avatar}
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold text-slate-800 group-hover:text-indigo-600 transition-colors">{team.name}</h3>
                                        <p className="text-sm text-slate-500">{team.members}</p>
                                    </div>
                                </div>
                                <ChevronRight className="text-slate-300 group-hover:text-indigo-500" />
                            </div>
                            
                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-slate-50 p-3 rounded-lg">
                                    <p className="text-[10px] text-slate-400 uppercase font-bold">Выручка</p>
                                    <p className="text-lg font-bold text-slate-800">{stats ? formatEUR(stats.revenue) : '—'}</p>
                                </div>
                                <div className="bg-slate-50 p-3 rounded-lg">
                                    <p className="text-[10px] text-slate-400 uppercase font-bold">Маржа</p>
                                    <p className={`text-lg font-bold ${stats ? (stats.margin > 20 ? 'text-emerald-600' : stats.margin > 0 ? 'text-amber-600' : 'text-rose-600') : 'text-slate-500'}`}>
                                        {stats ? `${stats.margin.toFixed(1)}%` : '—'}
                                    </p>
                                </div>
                            </div>

                        </div>
                    );
                })}

            </div>

        </div>

    );

    return (

        <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">

            <button onClick={() => setSelectedTeam(null)} className="flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-indigo-600 mb-2">

                <ChevronLeft size={16}/> Назад к списку

            </button>

            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">

                <div className="flex items-center gap-4">

                    <div className="w-16 h-16 rounded-full flex items-center justify-center text-white font-bold text-2xl shadow-md" style={{backgroundColor: selectedTeamMeta?.color}}>

                        {selectedTeamMeta?.avatar}

                    </div>

                    <div>

                        <h1 className="text-2xl font-bold text-slate-800">{selectedTeamMeta?.name}</h1>

                        <p className="text-slate-500 text-sm flex items-center gap-2"><Users size={14}/> {selectedTeamMeta?.members}</p>

                    </div>

                </div>

                {selectedStats && (
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 w-full md:w-auto">
                        <div className="bg-slate-50 rounded-lg p-3">
                            <p className="text-[10px] text-slate-400 uppercase font-bold">Выручка</p>
                            <p className="text-lg font-bold text-slate-800">{formatEUR(selectedStats.revenue)}</p>
                        </div>
                        <div className="bg-slate-50 rounded-lg p-3">
                            <p className="text-[10px] text-slate-400 uppercase font-bold">Прибыль</p>
                            <p className={`text-lg font-bold ${selectedStats.profit >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>{formatEUR(selectedStats.profit)}</p>
                        </div>
                        <div className="bg-slate-50 rounded-lg p-3">
                            <p className="text-[10px] text-slate-400 uppercase font-bold">Маржа</p>
                            <p className={`text-lg font-bold ${selectedStats.margin > 20 ? 'text-emerald-600' : selectedStats.margin > 0 ? 'text-amber-600' : 'text-rose-600'}`}>{selectedStats.margin.toFixed(1)}%</p>
                        </div>
                        <div className="bg-slate-50 rounded-lg p-3">
                            <p className="text-[10px] text-slate-400 uppercase font-bold">Проектов</p>
                            <p className="text-lg font-bold text-slate-800">{selectedStats.count}</p>
                        </div>
                    </div>
                )}

            </div>

            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">

                <h3 className="font-bold text-slate-800 mb-4">История эффективности (6 мес)</h3>

                <div className="h-64">

                    <ResponsiveContainer width="100%" height="100%">

                        <BarChart data={selectedTeamHistory}>

                             <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0"/>

                             <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize:12}} />

                             <YAxis axisLine={false} tickLine={false} tick={{fontSize:12}} tickFormatter={(val) => `€${(val/1000).toFixed(0)}k`} />

                             <Tooltip cursor={{fill: '#F1F5F9'}} formatter={(value: number) => formatEUR(value)} />

                             <Bar dataKey="revenue" fill={selectedTeamMeta?.color || '#4F46E5'} radius={[4,4,0,0]} name="Выручка" />

                             <Bar dataKey="profit" fill="#10B981" radius={[4,4,0,0]} name="Прибыль" />

                        </BarChart>

                    </ResponsiveContainer>

                </div>

            </div>

            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">

                <h3 className="font-bold text-slate-800 mb-4">Недавние операции</h3>

                {selectedTeamOperations.length === 0 ? (
                    <p className="text-slate-500 text-sm">Нет операций для отображения.</p>
                ) : (
                    <div className="space-y-3">
                        {selectedTeamOperations.map(op => (
                            <div key={op.id} className="flex items-center justify-between py-3 border-b border-slate-100 last:border-0">
                                <div>
                                    <p className="font-bold text-slate-800">{op.invoiceNumber}</p>
                                    <p className="text-xs text-slate-400">{op.date}</p>
                                </div>
                                <div className="text-right">
                                    <p className={`font-bold ${op.profit >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>{formatEUR(op.profit)}</p>
                                    <p className="text-xs text-slate-500">Маржа {(op.revenue > 0 ? (op.profit / op.revenue) * 100 : 0).toFixed(1)}%</p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

            </div>

        </div>

    );

}

// ============================================

// PAGE: WAREHOUSE (Detailed)

// ============================================

const Warehouse = () => {

    return (

        <div className="space-y-6 animate-in fade-in">

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                <div className="col-span-2 bg-indigo-600 text-white p-6 rounded-xl flex items-center justify-between shadow-lg shadow-indigo-200 relative overflow-hidden">

                    <div className="relative z-10">

                        <h3 className="text-xl font-bold mb-1">Склад заполнен на 82%</h3>

                        <p className="text-indigo-200 text-sm">Стоимость остатков: € 68,240</p>

                    </div>

                    <div className="flex gap-3 relative z-10">

                        <button className="bg-white text-indigo-700 px-4 py-2 rounded-lg text-sm font-bold shadow-sm hover:bg-indigo-50">Инвентаризация</button>

                    </div>

                    <Package className="absolute right-4 bottom-4 text-slate-700 w-24 h-24 opacity-20" />

                </div>

                <div className="bg-white p-6 rounded-xl border border-rose-200 shadow-sm flex flex-col justify-center">

                    <h4 className="font-bold text-rose-600 flex items-center gap-2 mb-2"><AlertCircle size={18}/> Критические (2)</h4>

                    <ul className="space-y-2">

                        <li className="flex justify-between text-sm text-slate-700"><span>SLS E35A</span> <span className="font-bold text-rose-600">2 шт</span></li>

                        <li className="flex justify-between text-sm text-slate-700"><span>NYM 5x6</span> <span className="font-bold text-amber-500">25 м</span></li>

                    </ul>

                </div>

            </div>

            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

                 {WAREHOUSE_DATA.map(item => {

                     const pct = (item.stock / item.max) * 100;

                     let statusColor = 'bg-indigo-500';

                     if(item.status === 'critical') statusColor = 'bg-rose-500';

                     else if(item.status === 'warning') statusColor = 'bg-amber-500';

                     return (

                         <div key={item.id} className="border border-slate-200 rounded-xl p-4 hover:border-indigo-300 transition-colors group">

                             <div className="flex justify-between items-start mb-4">

                                 <div>

                                     <span className="text-[10px] font-bold text-slate-400 uppercase">{item.cat}</span>

                                     <h4 className="font-bold text-slate-800">{item.name}</h4>

                                 </div>

                                 <span className={`text-lg font-bold tabular-nums ${item.status === 'critical' ? 'text-rose-600' : 'text-slate-700'}`}>

                                     {item.stock} <span className="text-xs font-normal text-slate-400">{item.unit}</span>

                                 </span>

                             </div>

                             <div className="w-full h-2 bg-slate-100 rounded-full mb-4 overflow-hidden">

                                 <div className={`h-full ${statusColor} transition-all duration-500`} style={{width: `${pct}%`}}></div>

                             </div>

                             <div className="flex gap-2">

                                 <button className="flex-1 py-1.5 text-xs font-bold text-slate-600 bg-slate-50 border border-slate-200 rounded hover:bg-slate-100">-</button>

                                 <button className="flex-1 py-1.5 text-xs font-bold text-slate-600 bg-slate-50 border border-slate-200 rounded hover:bg-slate-100">+</button>

                             </div>

                         </div>

                     )

                 })}

            </div>

        </div>

    )

}

// ============================================

// PAGE: BACKEND DASHBOARD

// ============================================

const BackendDashboard = () => {
  const [stats, setStats] = useState<BackendStatsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');

  // Helper to get date presets
  const getDatePresets = () => {
    const today = new Date();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();

    // Get first day of current month
    const firstDayCurrentMonth = new Date(currentYear, currentMonth, 1).toISOString().split('T')[0];
    
    // Get first day of previous month
    const firstDayPrevMonth = new Date(currentYear, currentMonth - 1, 1).toISOString().split('T')[0];
    
    // Get last day of previous month
    const lastDayPrevMonth = new Date(currentYear, currentMonth, 0).toISOString().split('T')[0];

    // Get first day of current quarter
    const quarterStartMonth = Math.floor(currentMonth / 3) * 3;
    const firstDayQuarter = new Date(currentYear, quarterStartMonth, 1).toISOString().split('T')[0];

    // Get first day of previous quarter
    const prevQuarterStartMonth = quarterStartMonth - 3;
    const prevQuarterYear = prevQuarterStartMonth < 0 ? currentYear - 1 : currentYear;
    const firstDayPrevQuarter = new Date(prevQuarterYear, prevQuarterStartMonth < 0 ? 12 + prevQuarterStartMonth : prevQuarterStartMonth, 1).toISOString().split('T')[0];
    const lastDayPrevQuarter = new Date(currentYear, quarterStartMonth, 0).toISOString().split('T')[0];

    // Get first day of current year
    const firstDayYear = new Date(currentYear, 0, 1).toISOString().split('T')[0];

    // Get first day of previous year
    const firstDayPrevYear = new Date(currentYear - 1, 0, 1).toISOString().split('T')[0];
    const lastDayPrevYear = new Date(currentYear, 0, 0).toISOString().split('T')[0];

    // Get today
    const todayStr = today.toISOString().split('T')[0];

    return {
      'current-month': { start: firstDayCurrentMonth, end: todayStr, label: 'Текущий месяц' },
      'previous-month': { start: firstDayPrevMonth, end: lastDayPrevMonth, label: 'Прошлый месяц' },
      'current-quarter': { start: firstDayQuarter, end: todayStr, label: 'Текущий квартал' },
      'previous-quarter': { start: firstDayPrevQuarter, end: lastDayPrevQuarter, label: 'Прошлый квартал' },
      'current-year': { start: firstDayYear, end: todayStr, label: 'Текущий год' },
      'previous-year': { start: firstDayPrevYear, end: lastDayPrevYear, label: 'Прошлый год' },
      'all-time': { start: '', end: '', label: 'За все время' },
    };
  };

  const applyPreset = (preset: string) => {
    const presets = getDatePresets();
    const selected = presets[preset as keyof typeof presets];
    if (selected) {
      setStartDate(selected.start);
      setEndDate(selected.end);
    }
  };

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Build query parameters
        const params = new URLSearchParams();
        if (startDate) params.append('startDate', startDate);
        if (endDate) params.append('endDate', endDate);
        
        const queryString = params.toString();
        const url = `${API_BASE_URL}/dashboard${queryString ? `?${queryString}` : ''}`;
        
        // Fetch stats from /dashboard endpoint
        const response = await fetch(url, {
          method: 'GET',
          mode: 'cors',
          credentials: 'omit',
          headers: {
            'Accept': 'application/json',
          },
        });
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        // Validate response structure
        if (!data || !data.totals || !data.teams || !Array.isArray(data.teams)) {
          throw new Error('Invalid response format from /dashboard endpoint');
        }

        setStats(data);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Не удалось загрузить статистику';
        setError(errorMessage);
        console.error('Error fetching backend stats:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [startDate, endDate]);

  // Normalize team name for display
  const normalizeTeamForDisplay = (name: string): string => {
    return name.trim()
      .replace(/А/g, 'A')
      .replace(/С/g, 'C')
      .toUpperCase();
  };

  // Get team color
  const getTeamColor = (teamName: string): string => {
    const normalized = normalizeTeamForDisplay(teamName);
    return COLORS[normalized as keyof typeof COLORS] || '#94A3B8';
  };

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
        <p className="text-slate-400 text-xs mt-2">
          Убедитесь, что бэкенд имеет эндпоинт /stats, /analytics или /dashboard
        </p>
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

  // Calculate margin percentage
  const calculateMargin = (revenue: number, profit: number): number => {
    if (revenue === 0) return 0;
    return parseFloat(((profit / revenue) * 100).toFixed(1));
  };

  const presets = getDatePresets();

  return (
    <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
      {/* Header with Date Filters */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
          <h2 className="text-2xl font-bold text-slate-800">Статистика с бэкенда</h2>
          
          {/* Date Presets */}
          <div className="flex flex-wrap gap-2">
            {Object.entries(presets).map(([key, preset]) => (
              <button
                key={key}
                onClick={() => applyPreset(key)}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                  startDate === preset.start && endDate === preset.end
                    ? 'bg-indigo-600 text-white'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {preset.label}
              </button>
            ))}
          </div>
        </div>

        {/* Date Range Inputs */}
        <div className="flex flex-col sm:flex-row gap-4 pt-4 border-t border-slate-200">
          <div className="flex-1">
            <label className="block text-xs font-medium text-slate-600 mb-1">
              Дата начала
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
            />
          </div>
          <div className="flex-1">
            <label className="block text-xs font-medium text-slate-600 mb-1">
              Дата окончания
            </label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
            />
          </div>
          {(startDate || endDate) && (
            <div className="flex items-end">
              <button
                onClick={() => {
                  setStartDate('');
                  setEndDate('');
                }}
                className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-800 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
              >
                Сбросить
              </button>
            </div>
          )}
        </div>

        {/* Period Display */}
        <div className="mt-4 pt-4 border-t border-slate-200">
          <p className="text-sm text-slate-500">
            Период:{' '}
            <span className="font-medium text-slate-700">
              {startDate ? new Date(startDate).toLocaleDateString('ru-RU') : 'С начала'}
              {' - '}
              {endDate ? new Date(endDate).toLocaleDateString('ru-RU') : 'Сейчас'}
            </span>
          </p>
        </div>
      </div>

      {/* Total KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <p className="text-sm text-slate-500 mb-2">Всего операций</p>
          <p className="text-3xl font-bold text-slate-800">{stats.totals.operations}</p>
        </div>

        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <p className="text-sm text-slate-500 mb-2">Выручка (всего)</p>
          <p className="text-3xl font-bold text-indigo-600">{formatEUR(stats.totals.revenue)}</p>
        </div>

        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <p className="text-sm text-slate-500 mb-2">Чистая прибыль</p>
          <p className={`text-3xl font-bold ${stats.totals.profit >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
            {formatEUR(stats.totals.profit)}
          </p>
          <p className="text-xs text-slate-400 mt-1">
            Маржа: {calculateMargin(stats.totals.revenue, stats.totals.profit)}%
          </p>
        </div>

        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <p className="text-sm text-slate-500 mb-2">Расходы</p>
          <p className="text-3xl font-bold text-amber-600">{formatEUR(stats.totals.expenses)}</p>
        </div>
      </div>

      {/* Teams Performance */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <h3 className="text-lg font-bold text-slate-800 mb-6">Производительность команд</h3>
        
        <div className="space-y-4">
          {stats.teams.map((team, index) => {
            const normalizedName = normalizeTeamForDisplay(team.name);
            const teamColor = getTeamColor(team.name);
            const margin = calculateMargin(team.revenue, team.profit);
            
            return (
              <div key={index} className="border border-slate-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-3 h-3 rounded-full" 
                      style={{ backgroundColor: teamColor }}
                    ></div>
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

                {/* Progress bar for revenue */}
                <div className="mt-4">
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div 
                      className="h-full transition-all duration-500"
                      style={{
                        width: `${(team.revenue / stats.totals.revenue) * 100}%`,
                        backgroundColor: teamColor,
                      }}
                    ></div>
                  </div>
                  <p className="text-xs text-slate-400 mt-1">
                    {(team.revenue / stats.totals.revenue * 100).toFixed(1)}% от общей выручки
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Teams Chart */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <h3 className="text-lg font-bold text-slate-800 mb-6">Выручка по командам</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={stats.teams.map(team => ({
            name: normalizeTeamForDisplay(team.name),
            revenue: team.revenue,
            profit: team.profit,
            color: getTeamColor(team.name),
          }))}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0"/>
            <XAxis 
              dataKey="name" 
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#64748B', fontSize: 12 }}
            />
            <YAxis 
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#64748B', fontSize: 12 }}
              tickFormatter={(val) => `€${(val/1000).toFixed(0)}k`}
            />
            <Tooltip 
              contentStyle={{borderRadius:'8px', border:'none', boxShadow:'0 10px 15px -3px rgb(0 0 0 / 0.1)'}}
              formatter={(value: number) => formatEUR(value)}
            />
            <Bar dataKey="revenue" fill="#4F46E5" radius={[4,4,0,0]} name="Выручка" />
            <Bar dataKey="profit" fill="#10B981" radius={[4,4,0,0]} name="Прибыль" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

// ============================================

// PAGE: OPERATIONS / PROJECTS LIST

// ============================================

const Operations = ({ refreshTrigger }: { refreshTrigger?: number }) => {
    const [operations, setOperations] = useState<Operation[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchOperations = async () => {
            try {
                setLoading(true);
                setError(null);
                
                // Direct backend call
                const response = await fetch(`${API_BASE_URL}/operations`, {
                    method: 'GET',
                    mode: 'cors',
                    credentials: 'omit',
                    headers: {
                        'Accept': 'application/json',
                    },
                });
                
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                
                const data = await response.json();
                setOperations(data);
                setError(null);
            } catch (err) {
                const errorMessage = err instanceof Error 
                    ? err.message 
                    : 'Failed to load operations';
                
                // More user-friendly error messages
                let userMessage = 'Не удалось загрузить операции';
                if (errorMessage.includes('Failed to fetch') || errorMessage.includes('NetworkError')) {
                    userMessage = 'Не удалось подключиться к серверу. Проверьте настройки API.';
                } else if (errorMessage.includes('HTTP error')) {
                    userMessage = `Ошибка сервера: ${errorMessage}`;
                }
                
                setError(userMessage);
                console.error('Error fetching operations:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchOperations();
    }, [refreshTrigger]);

    // Helper function to format date
    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('ru-RU', { year: 'numeric', month: '2-digit', day: '2-digit' });
    };

    // Calculate margin percentage
    const calculateMargin = (revenue: number, profit: number): number => {
        if (revenue === 0) return 0;
        return parseFloat(((profit / revenue) * 100).toFixed(1));
    };

    // Get team color or default
    const getTeamColor = (team: string | null) => {
        if (!team) return '#94A3B8'; // Default gray
        return COLORS[team as keyof typeof COLORS] || '#94A3B8';
    };

    return (

        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden animate-in fade-in">

            <div className="px-6 py-4 border-b border-slate-200 flex flex-col sm:flex-row justify-between items-center gap-4">

                <div className="flex items-center gap-2">

                    <button className="px-3 py-1.5 text-xs font-bold bg-slate-800 text-white rounded-lg shadow-sm">Все</button>

                    <button className="px-3 py-1.5 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-lg">Неоплаченные</button>

                    <button className="px-3 py-1.5 text-xs font-bold text-rose-600 hover:bg-rose-50 rounded-lg border border-transparent hover:border-rose-100 flex items-center gap-1"><AlertCircle size={12}/> Проблемные</button>

                </div>

                <div className="flex gap-2">

                    <button className="p-2 text-slate-400 hover:bg-slate-50 rounded-lg border border-slate-200"><Filter size={16}/></button>

                    <button className="p-2 text-slate-400 hover:bg-slate-50 rounded-lg border border-slate-200"><Download size={16}/></button>

                </div>

            </div>

            {loading && (
                <div className="p-12 text-center">
                    <Loader2 className="animate-spin mx-auto mb-4 text-indigo-600" size={32} />
                    <p className="text-slate-500">Загрузка операций...</p>
                </div>
            )}

            {error && (
                <div className="p-6 text-center">
                    <div className="bg-rose-50 border border-rose-200 rounded-lg p-4 inline-block">
                        <AlertCircle className="text-rose-600 mx-auto mb-2" size={24} />
                        <p className="text-rose-700 font-medium">Ошибка загрузки</p>
                        <p className="text-rose-600 text-sm mt-1">{error}</p>
                    </div>
                </div>
            )}

            {!loading && !error && (
                <div className="overflow-x-auto">

                    <table className="w-full text-sm">

                        <thead className="bg-slate-50 text-slate-500 uppercase text-xs font-bold">

                            <tr>

                                <th className="px-6 py-3 text-left">Статус</th>

                                <th className="px-6 py-3 text-left">Проект / Дата</th>

                                <th className="px-6 py-3 text-left">Команда</th>

                                <th className="px-6 py-3 text-right">Выручка</th>

                                <th className="px-6 py-3 text-right">Прибыль</th>

                                <th className="px-6 py-3 text-right">Маржа</th>

                                <th className="px-6 py-3"></th>

                            </tr>

                        </thead>

                        <tbody className="divide-y divide-slate-100">

                            {operations.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="px-6 py-12 text-center text-slate-500">
                                        Нет операций для отображения
                                    </td>
                                </tr>
                            ) : (
                                operations.map(op => {
                                    const margin = calculateMargin(op.revenue, op.profit);
                                    return (
                                        <tr key={op.id} className="hover:bg-slate-50 transition-colors group">

                                            <td className="px-6 py-4"><StatusTag status={op.isPaid ? 'paid' : 'pending'} /></td>

                                            <td className="px-6 py-4">

                                                <div className="font-bold text-slate-800">{op.invoiceNumber}</div>

                                                <div className="flex items-center gap-2 mt-1">

                                                    <span className="text-xs text-slate-400">{formatDate(op.date)}</span>

                                                </div>

                                            </td>

                                            <td className="px-6 py-4">

                                                {op.team ? (
                                                    <span className="flex items-center gap-1.5 text-xs font-bold text-slate-600">

                                                        <span className="w-2 h-2 rounded-full" style={{backgroundColor: getTeamColor(op.team)}}></span>

                                                        {op.team}

                                                    </span>
                                                ) : (
                                                    <span className="text-xs text-slate-400">{op.members || '—'}</span>
                                                )}

                                            </td>

                                            <td className="px-6 py-4 text-right font-medium tabular-nums">{formatEUR(op.revenue)}</td>

                                            <td className={`px-6 py-4 text-right font-bold tabular-nums ${op.profit > 0 ? 'text-emerald-600' : 'text-rose-600'}`}>

                                                {formatEUR(op.profit)}

                                            </td>

                                            <td className="px-6 py-4 text-right">

                                                <span className={`text-xs font-bold px-2 py-1 rounded ${margin > 20 ? 'bg-emerald-50 text-emerald-700' : margin > 0 ? 'bg-amber-50 text-amber-700' : 'bg-rose-50 text-rose-700'}`}>

                                                    {margin}%

                                                </span>

                                            </td>

                                            <td className="px-6 py-4 text-center">

                                                <button className="text-slate-300 hover:text-slate-600"><MoreHorizontal size={16}/></button>

                                            </td>

                                        </tr>
                                    );
                                })
                            )}

                        </tbody>

                    </table>

                </div>
            )}

        </div>

    )

}

// ============================================

// PAGE: INVOICES (With Data)

// ============================================

const Invoices = () => {

  const [view, setView] = useState<'list' | 'create'>('list');

  const [selectedClient, setSelectedClient] = useState<any>(null);

  const [selectedTemplate, setSelectedTemplate] = useState<any>(null);

  const [isSending, setIsSending] = useState(false);

  // CREATE INVOICE VIEW

  if (view === 'create' && selectedClient) {

    const handleSend = () => {

      setIsSending(true);

      setTimeout(() => { setIsSending(false); setView('list'); }, 1500);

    };

    return (

      <div className="animate-in slide-in-from-right duration-300 max-w-5xl mx-auto">

        <div className="flex items-center gap-4 mb-6">

          <button onClick={() => setView('list')} className="p-2 hover:bg-white rounded-lg transition-colors text-slate-500"><ChevronLeft size={24} /></button>

          <div><h2 className="text-2xl font-bold text-slate-800">Создать счет</h2><p className="text-slate-500">для {selectedClient.client}</p></div>

        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          <div className="lg:col-span-2 space-y-6">

             <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">

                <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2"><Layers size={18} className="text-indigo-600"/> 1. Тип работ</h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

                  {JOB_TEMPLATES.map(tpl => {

                    const Icon = tpl.icon;

                    return (

                    <div key={tpl.id} onClick={() => setSelectedTemplate(tpl)} className={`p-4 rounded-xl border-2 cursor-pointer transition-all flex items-start gap-4 ${selectedTemplate?.id === tpl.id ? 'border-indigo-600 bg-indigo-50/50 ring-2 ring-indigo-100' : 'border-slate-100 hover:border-indigo-200 hover:bg-slate-50'}`}>

                      <div className={`p-3 rounded-lg ${selectedTemplate?.id === tpl.id ? 'bg-indigo-600 text-white' : 'bg-white text-slate-500 shadow-sm'}`}><Icon size={24} /></div>

                      <div><h4 className={`font-bold ${selectedTemplate?.id === tpl.id ? 'text-indigo-900' : 'text-slate-800'}`}>{tpl.name}</h4><p className="text-sm font-bold text-slate-900 mt-2">€ {tpl.price}</p></div>

                      {selectedTemplate?.id === tpl.id && <div className="ml-auto text-indigo-600"><Check size={20}/></div>}

                    </div>

                  )})}

                </div>

             </div>

          </div>

          <div className="space-y-6">

             <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-lg sticky top-6">

                <h3 className="font-bold text-slate-400 uppercase text-xs tracking-wider mb-6">Предпросмотр</h3>

                <div className="space-y-4 mb-8">

                  <div className="flex justify-between border-b border-slate-50 pb-2"><span className="text-slate-500 text-sm">Клиент</span><span className="font-bold text-slate-800 text-right">{selectedClient.client}<br/><span className="text-xs font-normal text-slate-400">{selectedClient.address}</span></span></div>

                  <div className="flex justify-between border-b border-slate-50 pb-2"><span className="text-slate-500 text-sm">Работа</span><span className="font-medium text-slate-800">{selectedTemplate ? selectedTemplate.name : '-'}</span></div>

                  <div className="flex justify-between items-center pt-2"><span className="text-slate-800 font-bold">Итого (Netto)</span><span className="text-2xl font-black text-indigo-600">€ {selectedTemplate ? selectedTemplate.price : 0}</span></div>

                </div>

                <button disabled={!selectedTemplate || isSending} onClick={handleSend} className={`w-full py-4 rounded-xl font-bold text-white shadow-lg flex items-center justify-center gap-2 transition-all ${!selectedTemplate ? 'bg-slate-300 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700'}`}>{isSending ? (<><Loader2 className="animate-spin" /> Отправка...</>) : (<><Send size={18} /> Отправить в LexOffice</>)}</button>

             </div>

          </div>

        </div>

      </div>

    );

  }

  // INVOICE LIST

  return (

    <div className="space-y-6 animate-in fade-in duration-500">

      <div className="flex flex-col md:flex-row justify-between items-end md:items-center gap-4">

        <div className="flex gap-2 bg-white p-1 rounded-lg border border-slate-200">

           <button className="px-4 py-2 text-sm font-bold bg-slate-100 text-slate-800 rounded-md">Все</button>

           <button className="px-4 py-2 text-sm font-medium text-slate-500 hover:bg-slate-50 rounded-md">Готовы к счету</button>

        </div>

        <button className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 shadow-sm transition-colors"><Plus size={16}/> Добавить клиента</button>

      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">

        <table className="w-full text-sm text-left">

          <thead className="bg-slate-50 text-slate-500 uppercase font-bold text-xs border-b border-slate-200">

            <tr>

              <th className="px-6 py-4">Клиент</th>

              <th className="px-6 py-4">Адрес объекта</th>

              <th className="px-6 py-4">План монтажа</th>

              <th className="px-6 py-4">Тип</th>

              <th className="px-6 py-4">Статус</th>

              <th className="px-6 py-4 text-right">Действие</th>

            </tr>

          </thead>

          <tbody className="divide-y divide-slate-100">

            {MOCK_INVOICE_QUEUE.map((item) => (

              <tr key={item.id} className="hover:bg-slate-50 transition-colors group">

                <td className="px-6 py-4 font-bold text-slate-800">{item.client}</td>

                <td className="px-6 py-4 text-slate-600">{item.address}</td>

                <td className="px-6 py-4 font-medium text-slate-800">{item.planDate}</td>

                <td className="px-6 py-4"><TypeTag type={item.type}/></td>

                <td className="px-6 py-4"><StatusTag status={item.status} /></td>

                <td className="px-6 py-4 text-right">

                  {item.status === 'ready' ? (

                    <button onClick={() => { setSelectedClient(item); setView('create'); setSelectedTemplate(null); }} className="inline-flex items-center gap-2 px-3 py-1.5 bg-indigo-50 text-indigo-700 font-bold rounded-lg hover:bg-indigo-100 transition-colors border border-indigo-200"><FileText size={14}/> Счет</button>

                  ) : (<span className="text-slate-400 text-xs flex items-center justify-end gap-1"><Check size={14}/> Готово</span>)}

                </td>

              </tr>

            ))}

          </tbody>

        </table>

      </div>

    </div>

  );

};

// ============================================

// APP SHELL

// ============================================

export default function SolarSaaS() {

  const location = useLocation();
  const navigate = useNavigate();
  
  // Redirect root to dashboard
  useEffect(() => {
    if (location.pathname === '/') {
      navigate('/dashboard', { replace: true });
    }
  }, [location.pathname, navigate]);
  
  // Get active tab from URL path
  const getActiveTab = () => {
    const path = location.pathname;
    if (path === '/' || path === '/dashboard') return 'dashboard';
    if (path === '/stats') return 'backend-dashboard';
    if (path === '/operations') return 'operations';
    if (path === '/teams') return 'teams';
    if (path === '/warehouse') return 'warehouse';
    if (path === '/invoices') return 'invoices';
    return 'dashboard';
  };
  
  const activeTab = getActiveTab();

  const [isModalOpen, setIsModalOpen] = useState(false);

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  // Form state for new operation
  const [newOperation, setNewOperation] = useState({
    invoiceNumber: '',
    team: '',
    members: '',
    date: new Date().toISOString().split('T')[0],
    revenue: '',
    materialCost: '',
    fuelCost: '',
    isPaid: false,
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const NavItem = ({ id, icon: Icon, label, path }: { id: string; icon: any; label: string; path: string }) => {

    const handleClick = () => {
      navigate(path);
      setIsMobileMenuOpen(false);
    };

    return (
      <button 
        onClick={handleClick}
        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium ${activeTab === id ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200' : 'text-slate-500 hover:bg-white hover:text-slate-800'}`}
      >
        <Icon size={20} />
        {label}
      </button>
    );
  };

  return (

    <div className="flex h-screen bg-[#F5F6FA] font-sans text-slate-900 overflow-hidden">

      

      {/* SIDEBAR */}

      <aside className={`fixed inset-y-0 left-0 z-40 w-64 bg-[#F5F6FA] border-r border-slate-200 transform transition-transform duration-300 md:translate-x-0 ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} md:static md:flex flex-col`}>

        <div className="p-6 flex items-center gap-3">

          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white shadow-lg shadow-indigo-400/50">

            <Zap size={20} fill="currentColor"/>

          </div>

          <span className="font-bold text-xl tracking-tight text-slate-800">Solar<span className="text-indigo-600">SaaS</span></span>

        </div>

        <nav className="flex-1 px-4 space-y-1 py-4">

            <p className="px-4 text-xs font-bold text-slate-400 uppercase mb-2">Основное</p>

            <NavItem id="dashboard" path="/dashboard" icon={LayoutGrid} label="Дашборд" />
            
            <NavItem id="backend-dashboard" path="/stats" icon={TrendingUp} label="Статистика" />

{/* 
            <NavItem id="teams" path="/teams" icon={Users} label="Команды" /> */}

            <NavItem id="operations" path="/operations" icon={Layers} label="Операции" />

            {/* <NavItem id="warehouse" icon={Box} label="Склад" /> */}
{/* 
            <p className="px-4 text-xs font-bold text-slate-400 uppercase mb-2 mt-6">Финансы</p>

            <NavItem id="invoices" icon={FileText} label="Счета" /> */}

        </nav>

      </aside>

      {/* MAIN CONTENT */}

      <main className="flex-1 flex flex-col overflow-hidden relative">

        <header className="h-16 flex items-center justify-between px-6 bg-[#F5F6FA]/80 backdrop-blur-md sticky top-0 z-30">

           <div className="flex items-center gap-4">

               <button className="md:hidden p-2 bg-white rounded-lg shadow-sm" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>

                   <LayoutGrid size={20}/>

               </button>

               <h1 className="text-xl font-bold text-slate-800 capitalize">

                   {location.pathname === '/invoices' ? 'Управление счетами' 
                    : location.pathname === '/dashboard' || location.pathname === '/' ? 'Обзор компании' 
                    : location.pathname === '/stats' ? 'Статистика'
                    : location.pathname === '/operations' ? 'Операции'
                    : location.pathname.slice(1)}

               </h1>

           </div>

           

           <button onClick={() => setIsModalOpen(true)} className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 shadow-lg shadow-indigo-200 transition-all hover:scale-105 active:scale-95">

                <Plus size={18} />

                <span className="hidden sm:inline">Операция</span>

            </button>

        </header>

        <div className="flex-1 overflow-auto p-4 md:p-8">

            <div className="max-w-7xl mx-auto">

                {(location.pathname === '/' || location.pathname === '/dashboard') && <Dashboard />}

                {location.pathname === '/stats' && <BackendDashboard />}

                {location.pathname === '/teams' && <Teams />}

                {location.pathname === '/warehouse' && <Warehouse />}

                {location.pathname === '/operations' && <Operations refreshTrigger={refreshTrigger} />}

                {location.pathname === '/invoices' && <Invoices />}

            </div>

        </div>

        {/* Modal for Add Operation */}

        {isModalOpen && (

            <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setIsModalOpen(false)}>

                <div className="bg-white rounded-2xl p-6 shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>

                    <h2 className="text-xl font-bold mb-6">Добавить операцию</h2>

                    {submitError && (
                        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                            {submitError}
                        </div>
                    )}

                    <form onSubmit={async (e) => {
                        e.preventDefault();
                        setIsSubmitting(true);
                        setSubmitError(null);

                        try {
                            const profit = parseFloat(newOperation.revenue.toString()) 
                                - parseFloat(newOperation.materialCost.toString()) 
                                - parseFloat(newOperation.fuelCost.toString());

                            // Normalize team to uppercase and trim
                            const normalizedTeam = newOperation.team ? newOperation.team.trim().toUpperCase() : null;
                            
                            const operationData = {
                                invoiceNumber: newOperation.invoiceNumber,
                                team: normalizedTeam,
                                members: newOperation.members,
                                date: newOperation.date,
                                revenue: parseFloat(newOperation.revenue.toString()),
                                materialCost: parseFloat(newOperation.materialCost.toString()),
                                fuelCost: parseFloat(newOperation.fuelCost.toString()),
                                isPaid: newOperation.isPaid,
                                profit: profit,
                            };

                            const response = await fetch(`${API_BASE_URL}/operations`, {
                                method: 'POST',
                                mode: 'cors',
                                credentials: 'omit',
                                headers: {
                                    'Content-Type': 'application/json',
                                    'Accept': 'application/json',
                                },
                                body: JSON.stringify(operationData),
                            });

                            if (!response.ok) {
                                const errorText = await response.text();
                                throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
                            }

                            // Reset form
                            setNewOperation({
                                invoiceNumber: '',
                                team: '',
                                members: '',
                                date: new Date().toISOString().split('T')[0],
                                revenue: '',
                                materialCost: '',
                                fuelCost: '',
                                isPaid: false,
                            });

                            // Close modal and refresh operations list
                            setIsModalOpen(false);
                            setRefreshTrigger(prev => prev + 1);
                        } catch (err) {
                            const errorMessage = err instanceof Error ? err.message : 'Не удалось создать операцию';
                            setSubmitError(errorMessage);
                            console.error('Error creating operation:', err);
                        } finally {
                            setIsSubmitting(false);
                        }
                    }} className="space-y-4">

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">
                                    Номер счета *
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={newOperation.invoiceNumber}
                                    onChange={(e) => setNewOperation({ ...newOperation, invoiceNumber: e.target.value })}
                                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    placeholder="INV-001"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">
                                    Команда
                                </label>
                                <select
                                    value={newOperation.team}
                                    onChange={(e) => setNewOperation({ ...newOperation, team: e.target.value })}
                                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                >
                                    <option value="">Не выбрано</option>
                                    <option value="AC01">AC01</option>
                                    <option value="AC02">AC02</option>
                                    <option value="AC03">AC03</option>
                                    <option value="AC04">AC04</option>
                                </select>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">
                                Участники *
                            </label>
                            <input
                                type="text"
                                required
                                value={newOperation.members}
                                onChange={(e) => setNewOperation({ ...newOperation, members: e.target.value })}
                                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                placeholder="Alex + Dima"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">
                                Дата *
                            </label>
                            <input
                                type="date"
                                required
                                value={newOperation.date}
                                onChange={(e) => setNewOperation({ ...newOperation, date: e.target.value })}
                                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            />
                        </div>

                        <div className="grid grid-cols-3 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">
                                    Выручка (€) *
                                </label>
                                <input
                                    type="number"
                                    required
                                    step="0.01"
                                    min="0"
                                    value={newOperation.revenue}
                                    onChange={(e) => setNewOperation({ ...newOperation, revenue: e.target.value })}
                                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    placeholder="0.00"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">
                                    Материалы (€) *
                                </label>
                                <input
                                    type="number"
                                    required
                                    step="0.01"
                                    min="0"
                                    value={newOperation.materialCost}
                                    onChange={(e) => setNewOperation({ ...newOperation, materialCost: e.target.value })}
                                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    placeholder="0.00"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">
                                    Топливо (€) *
                                </label>
                                <input
                                    type="number"
                                    required
                                    step="0.01"
                                    min="0"
                                    value={newOperation.fuelCost}
                                    onChange={(e) => setNewOperation({ ...newOperation, fuelCost: e.target.value })}
                                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    placeholder="0.00"
                                />
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            <input
                                type="checkbox"
                                id="isPaid"
                                checked={newOperation.isPaid}
                                onChange={(e) => setNewOperation({ ...newOperation, isPaid: e.target.checked })}
                                className="w-4 h-4 text-indigo-600 border-slate-300 rounded focus:ring-indigo-500"
                            />
                            <label htmlFor="isPaid" className="text-sm font-medium text-slate-700">
                                Оплачено
                            </label>
                        </div>

                        {newOperation.revenue && newOperation.materialCost && newOperation.fuelCost && (
                            <div className="p-3 bg-slate-50 rounded-lg">
                                <p className="text-sm text-slate-600">
                                    <strong>Прибыль:</strong>{' '}
                                    <span className={parseFloat(newOperation.revenue.toString()) - parseFloat(newOperation.materialCost.toString()) - parseFloat(newOperation.fuelCost.toString()) >= 0 ? 'text-emerald-600' : 'text-red-600'}>
                                        {formatEUR(parseFloat(newOperation.revenue.toString()) - parseFloat(newOperation.materialCost.toString()) - parseFloat(newOperation.fuelCost.toString()))}
                                    </span>
                                </p>
                            </div>
                        )}

                        <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
                            <button
                                type="button"
                                onClick={() => {
                                    setIsModalOpen(false);
                                    setSubmitError(null);
                                }}
                                className="px-4 py-2 font-bold text-slate-500 hover:text-slate-700"
                                disabled={isSubmitting}
                            >
                                Отмена
                            </button>
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="px-4 py-2 bg-indigo-600 text-white rounded-lg font-bold hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                            >
                                {isSubmitting ? (
                                    <>
                                        <Loader2 size={16} className="animate-spin" />
                                        Сохранение...
                                    </>
                                ) : (
                                    'Создать операцию'
                                )}
                            </button>
                        </div>

                    </form>

                </div>

            </div>

        )}

      </main>

      

      {isMobileMenuOpen && <div className="fixed inset-0 bg-black/20 z-30 md:hidden" onClick={() => setIsMobileMenuOpen(false)}></div>}

    </div>

  );

}

