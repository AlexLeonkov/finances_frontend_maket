import { useMemo } from 'react';

import { BalanceChart } from './BalanceChart';
import { ExpenseBreakdownChart } from './ExpenseBreakdownChart';
import { FinanceSummaryCards } from './FinanceSummaryCards';
import { FinanceTable } from './FinanceTable';
import { financeData } from '../mock/financeMock';

const getLatestMonthRows = () => {
  if (financeData.length === 0) {
    return [];
  }
  const lastDate = new Date(financeData[financeData.length - 1].date);
  const targetMonth = lastDate.getMonth();
  const targetYear = lastDate.getFullYear();
  return financeData.filter((row) => {
    const date = new Date(row.date);
    return date.getMonth() === targetMonth && date.getFullYear() === targetYear;
  });
};

export const FinanceDashboardPage = () => {
  const monthRows = useMemo(() => getLatestMonthRows(), []);

  return (
    <div className="space-y-6">
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
