import { MonthOption } from '../types';

type DashboardFiltersBarProps = {
  selectedMonth: string | null;
  availableMonths: MonthOption[];
  onMonthChange: (value: string | null) => void;
};

export const DashboardFiltersBar = ({ selectedMonth, availableMonths, onMonthChange }: DashboardFiltersBarProps) => (
  <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
    <div className="flex items-center gap-3">
      <span className="text-sm font-bold text-slate-600">Период:</span>
      <select
        value={selectedMonth || ''}
        onChange={(e) => onMonthChange(e.target.value || null)}
        className="px-4 py-2 border border-slate-300 rounded-lg text-sm font-medium text-slate-700 bg-white hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
      >
        <option value="">Все периоды</option>
        {availableMonths.map((month) => (
          <option key={month.key} value={month.key}>
            {month.label}
          </option>
        ))}
      </select>
      {selectedMonth && (
        <button onClick={() => onMonthChange(null)} className="text-xs text-slate-500 hover:text-slate-700 underline">
          Сбросить
        </button>
      )}
    </div>
    {selectedMonth && (
      <div className="text-sm text-slate-500">Показано: {availableMonths.find((m) => m.key === selectedMonth)?.label}</div>
    )}
  </div>
);
