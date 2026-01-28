import { useEffect, useMemo, useState } from 'react';

import { BalanceChart } from './BalanceChart';
import { ExpenseBreakdownChart } from './ExpenseBreakdownChart';
import { FinanceSummaryCards } from './FinanceSummaryCards';
import { FinanceTable } from './FinanceTable';
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

export const FinanceDashboardPage = () => {
  const [apiRows, setApiRows] = useState<FinanceLedgerRow[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

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
          setLoadError('Unable to load finance data.');
        }
      } finally {
        setIsLoading(false);
      }
    };
    load();
    return () => controller.abort();
  }, []);

  const monthRows = useMemo(() => {
    const rows =
      financeLedgerData.length > 0
        ? mapLedgerToFinanceRows(financeLedgerData)
        : apiRows.length > 0
          ? mapLedgerToFinanceRows(apiRows)
          : financeData;
    return getLatestMonthRows(rows);
  }, [apiRows]);

  return (
    <div className="space-y-6">
      {(isLoading || loadError) && (
        <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-500">
          {isLoading ? 'Loading finance data…' : loadError}
        </div>
      )}
      <FinanceSummaryCards rows={monthRows} />
      <div className="grid gap-6 lg:grid-cols-2">
        <BalanceChart rows={monthRows} />
        <ExpenseBreakdownChart rows={monthRows} />
      </div>
      <div className="space-y-3">
        <div>
          <p className="text-xs uppercase tracking-wide text-slate-400 font-semibold">
            Detailed cashflow
          </p>
          <p className="text-lg font-semibold text-slate-800">Daily ledger</p>
        </div>
        <FinanceTable rows={monthRows} />
      </div>
    </div>
  );
};
