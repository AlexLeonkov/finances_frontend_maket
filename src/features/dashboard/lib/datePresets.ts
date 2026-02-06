type DatePreset = {
  start: string;
  end: string;
  label: string;
};

const formatLocalYmd = (d: Date): string => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
};

export const getDatePresets = (): Record<string, DatePreset> => {
  const today = new Date();
  const currentMonth = today.getMonth(); // 0..11
  const currentYear = today.getFullYear();

  const firstDayCurrentMonth = formatLocalYmd(new Date(currentYear, currentMonth, 1));
  const firstDayPrevMonth = formatLocalYmd(new Date(currentYear, currentMonth - 1, 1));
  const lastDayPrevMonth = formatLocalYmd(new Date(currentYear, currentMonth, 0));

  const quarterStartMonth = Math.floor(currentMonth / 3) * 3; // 0,3,6,9
  const firstDayQuarter = formatLocalYmd(new Date(currentYear, quarterStartMonth, 1));

  const prevQuarterStartMonth = quarterStartMonth - 3;
  const prevQuarterYear = prevQuarterStartMonth < 0 ? currentYear - 1 : currentYear;
  const normalizedPrevQuarterStartMonth = (prevQuarterStartMonth + 12) % 12;

  const firstDayPrevQuarter = formatLocalYmd(
    new Date(prevQuarterYear, normalizedPrevQuarterStartMonth, 1),
  );

  // last day of previous quarter = day 0 of current quarter start month in currentYear
  const lastDayPrevQuarter = formatLocalYmd(new Date(currentYear, quarterStartMonth, 0));

  const firstDayYear = formatLocalYmd(new Date(currentYear, 0, 1));
  const firstDayPrevYear = formatLocalYmd(new Date(currentYear - 1, 0, 1));
  const lastDayPrevYear = formatLocalYmd(new Date(currentYear, 0, 0));

  const todayStr = formatLocalYmd(today);

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