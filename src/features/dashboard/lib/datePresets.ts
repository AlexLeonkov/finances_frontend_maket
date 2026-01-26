import { DatePreset } from '../types';

export const getDatePresets = (): Record<string, DatePreset> => {
  const today = new Date();
  const currentMonth = today.getMonth();
  const currentYear = today.getFullYear();

  const firstDayCurrentMonth = new Date(currentYear, currentMonth, 1).toISOString().split('T')[0];
  const firstDayPrevMonth = new Date(currentYear, currentMonth - 1, 1).toISOString().split('T')[0];
  const lastDayPrevMonth = new Date(currentYear, currentMonth, 0).toISOString().split('T')[0];

  const quarterStartMonth = Math.floor(currentMonth / 3) * 3;
  const firstDayQuarter = new Date(currentYear, quarterStartMonth, 1).toISOString().split('T')[0];

  const prevQuarterStartMonth = quarterStartMonth - 3;
  const prevQuarterYear = prevQuarterStartMonth < 0 ? currentYear - 1 : currentYear;
  const firstDayPrevQuarter = new Date(
    prevQuarterYear,
    prevQuarterStartMonth < 0 ? 12 + prevQuarterStartMonth : prevQuarterStartMonth,
    1,
  )
    .toISOString()
    .split('T')[0];
  const lastDayPrevQuarter = new Date(currentYear, quarterStartMonth, 0).toISOString().split('T')[0];

  const firstDayYear = new Date(currentYear, 0, 1).toISOString().split('T')[0];
  const firstDayPrevYear = new Date(currentYear - 1, 0, 1).toISOString().split('T')[0];
  const lastDayPrevYear = new Date(currentYear, 0, 0).toISOString().split('T')[0];

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
