import type { FinanceRow } from '../types';
import { formatEUR } from '../../../shared/lib/format';

type FinanceSummaryCardsProps = {
  rows: FinanceRow[];
};

const StatCard = ({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent: 'green' | 'red' | 'indigo';
}) => {
  const accentStyles =
    accent === 'green'
      ? 'text-emerald-600'
      : accent === 'red'
        ? 'text-rose-600'
        : 'text-indigo-600';

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <p className="text-xs uppercase tracking-wide text-slate-400 font-semibold">{label}</p>
      <p className={`mt-2 text-2xl font-semibold ${accentStyles}`}>{value}</p>
    </div>
  );
};

export const FinanceSummaryCards = ({ rows }: FinanceSummaryCardsProps) => {
  const totalIncome = rows.reduce((sum, row) => sum + row.incomeBills + row.otherIncome, 0);
  const totalExpenses = rows.reduce((sum, row) => sum + row.totalExpenses, 0);
  const totalSalaries = rows.reduce((sum, row) => sum + row.salaryPaid, 0);
  const currentBalance = rows.length > 0 ? rows[rows.length - 1].closingBalance : 0;

  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      <StatCard label="Total income" value={formatEUR(totalIncome)} accent="green" />
      <StatCard label="Total expenses" value={formatEUR(totalExpenses)} accent="red" />
      <StatCard label="Salaries paid" value={formatEUR(totalSalaries)} accent="indigo" />
      <StatCard label="Current balance" value={formatEUR(currentBalance)} accent="green" />
    </div>
  );
};
