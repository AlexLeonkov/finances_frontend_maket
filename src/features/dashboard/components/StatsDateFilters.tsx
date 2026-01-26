import { DatePreset } from '../types';

type StatsDateFiltersProps = {
  presets: Record<string, DatePreset>;
  startDate: string;
  endDate: string;
  onApplyPreset: (preset: string) => void;
  onStartDateChange: (value: string) => void;
  onEndDateChange: (value: string) => void;
  onReset: () => void;
  onApply: () => void;
  canApply: boolean;
};

export const StatsDateFilters = ({
  presets,
  startDate,
  endDate,
  onApplyPreset,
  onStartDateChange,
  onEndDateChange,
  onReset,
  onApply,
  canApply,
}: StatsDateFiltersProps) => (
  <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
      <h2 className="text-2xl font-bold text-slate-800">Статистика</h2>
      <div className="flex flex-wrap gap-2">
        {Object.entries(presets).map(([key, preset]) => (
          <button
            key={key}
            onClick={() => onApplyPreset(key)}
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

    <div className="flex flex-col sm:flex-row gap-4 pt-4 border-t border-slate-200">
      <div className="flex-1">
        <label className="block text-xs font-medium text-slate-600 mb-1">Дата начала</label>
        <input
          type="date"
          value={startDate}
          onChange={(e) => onStartDateChange(e.target.value)}
          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
        />
      </div>
      <div className="flex-1">
        <label className="block text-xs font-medium text-slate-600 mb-1">Дата окончания</label>
        <input
          type="date"
          value={endDate}
          onChange={(e) => onEndDateChange(e.target.value)}
          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
        />
      </div>
      <div className="flex items-end gap-2">
        {(startDate || endDate) && (
          <button
            onClick={onReset}
            className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-800 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
          >
            Сбросить
          </button>
        )}
        <button
          onClick={onApply}
          disabled={!canApply}
          className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Применить
        </button>
      </div>
    </div>

    <div className="mt-4 pt-4 border-t border-slate-200">
      <p className="text-sm text-slate-500">
        Период:{' '}
        <span className="font-medium text-slate-700">
          {startDate ? new Date(startDate).toLocaleDateString('ru-RU') : 'С начала'} -{' '}
          {endDate ? new Date(endDate).toLocaleDateString('ru-RU') : 'Сейчас'}
        </span>
      </p>
    </div>
  </div>
);
