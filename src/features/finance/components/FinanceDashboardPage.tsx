import { useEffect, useMemo, useState } from 'react';

import { BalanceChart } from './BalanceChart';
import { ExpenseBreakdownChart } from './ExpenseBreakdownChart';
import { FinanceSummaryCards } from './FinanceSummaryCards';
import { FinanceTable } from './FinanceTable';
import { AddOperationModal } from './AddOperationModal';
import { MaterialsPanel } from './MaterialsPanel';
import { MonthlyComparisonChart } from './MonthlyComparisonChart';
import { financeData } from '../mock/financeMock';
import { financeLedgerData } from '../data/ledgerData';
import { mapLedgerToFinanceRows } from '../lib/ledgerAdapter';
import { API_BASE_URL } from '../../../shared/api/baseUrl';
import type { FinanceLedgerRow } from '../types';

const getLatestMonthRows = (rows: typeof financeData) => {
  if (rows.length === 0) {
    return [];
  }
  const lastDate = new Date(rows[rows.length - 1].date);
  const targetMonth = lastDate.getMonth();
  const targetYear = lastDate.getFullYear();
  return rows.filter((row) => {
    const date = new Date(row.date);
    return date.getMonth() === targetMonth && date.getFullYear() === targetYear;
  });
};

const SkeletonCard = () => (
  <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
    <div className="h-3 w-24 rounded-full bg-slate-100" />
    <div className="mt-3 h-6 w-32 rounded-full bg-slate-100" />
  </div>
);

const SkeletonBlock = ({ height = 'h-64' }: { height?: string }) => (
  <div className={`rounded-2xl border border-slate-200 bg-white p-5 shadow-sm ${height}`}>
    <div className="h-3 w-32 rounded-full bg-slate-100" />
    <div className="mt-4 h-full rounded-xl bg-slate-100" />
  </div>
);

type FinanceDashboardPageProps = {
  view?: 'finance' | 'materials';
};

export const FinanceDashboardPage = ({ view = 'finance' }: FinanceDashboardPageProps) => {
  const [apiRows, setApiRows] = useState<FinanceLedgerRow[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [chartScope, setChartScope] = useState<'current' | 'all'>('all');

  useEffect(() => {
    if (financeLedgerData.length > 0) {
      return;
    }
    const controller = new AbortController();
    const load = async () => {
      try {
        setIsLoading(true);
        setLoadError(null);
        const response = await fetch(`${API_BASE_URL}/finance-daily-ledger?limit=180`, {
          signal: controller.signal,
        });
        if (!response.ok) {
          throw new Error(`Request failed (${response.status})`);
        }
        const data = (await response.json()) as FinanceLedgerRow[];
        setApiRows(data);
      } catch (error) {
        if ((error as Error).name !== 'AbortError') {
          setLoadError('Не удалось загрузить финансовые данные.');
        }
      } finally {
        setIsLoading(false);
      }
    };
    load();
    return () => controller.abort();
  }, []);

  const allRows = useMemo(() => {
    if (financeLedgerData.length > 0) {
      return mapLedgerToFinanceRows(financeLedgerData);
    }
    if (apiRows.length > 0) {
      return mapLedgerToFinanceRows(apiRows);
    }
    return [];
  }, [apiRows]);

  const monthRows = useMemo(() => getLatestMonthRows(allRows), [allRows]);
  const chartRows = chartScope === 'current' ? monthRows : allRows;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs uppercase tracking-wide text-slate-400 font-semibold">
            {view === 'materials' ? 'Материалы' : 'Финансы'}
          </p>
          <p className="text-lg font-semibold text-slate-800">
            {view === 'materials' ? 'Справочник' : 'Главная страница'}
          </p>
        </div>
        {view === 'finance' && (
          <button
            onClick={() => setIsModalOpen(true)}
            className="w-full rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700 sm:w-auto"
          >
            Добавить операцию
          </button>
        )}
      </div>

      {view === 'materials' ? (
        <MaterialsPanel />
      ) : (
        <>
      {isLoading && monthRows.length === 0 ? (
        <>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </div>
          <div className="grid gap-6 lg:grid-cols-2">
            <SkeletonBlock />
            <SkeletonBlock />
          </div>
          <SkeletonBlock height="h-72" />
        </>
      ) : (
        <>
          {loadError && monthRows.length === 0 && (
            <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-500">
              {loadError}
            </div>
          )}
          <FinanceSummaryCards rows={monthRows} />
          <div className="grid gap-6 lg:grid-cols-2">
            <BalanceChart rows={monthRows} />
            <ExpenseBreakdownChart rows={monthRows} />
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-xs uppercase tracking-wide text-slate-400 font-semibold">
                  Сравнение месяцев
                </p>
                <p className="text-lg font-semibold text-slate-800">Доходы vs расходы</p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setChartScope('current')}
                  className={`px-3 py-1.5 rounded-lg text-sm font-semibold ${
                    chartScope === 'current'
                      ? 'bg-indigo-600 text-white shadow'
                      : 'text-slate-500 hover:bg-slate-100'
                  }`}
                >
                  Текущий месяц
                </button>
                <button
                  onClick={() => setChartScope('all')}
                  className={`px-3 py-1.5 rounded-lg text-sm font-semibold ${
                    chartScope === 'all'
                      ? 'bg-indigo-600 text-white shadow'
                      : 'text-slate-500 hover:bg-slate-100'
                  }`}
                >
                  Все месяцы
                </button>
              </div>
            </div>
            <div className="mt-4">
              <MonthlyComparisonChart rows={chartRows} />
            </div>
          </div>
        </>
      )}
      <div className="space-y-3">
        <div>
          <p className="text-xs uppercase tracking-wide text-slate-400 font-semibold">
            Детальный денежный поток
          </p>
          <p className="text-lg font-semibold text-slate-800">Дневной журнал</p>
        </div>
        {isLoading && monthRows.length === 0 ? (
          <SkeletonBlock height="h-80" />
        ) : (
          <FinanceTable rows={monthRows} />
        )}
      </div>
        </>
      )}
      {view === 'finance' && (
        <AddOperationModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
      )}
    </div>
  );
};
