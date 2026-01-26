import { DailyProfitPoint, TeamTypePerformanceRow, TypeBreakdownRow } from '../types';

export const marginByTypeTeams = ['AC01', 'AC02', 'AC03', 'AC04'];

export const marginByTypeData = [
  { type: 'Retrofit', AC01: 24000, AC02: 18000, AC03: 11000, AC04: 7000 },
  { type: 'Vilor', AC01: 21000, AC02: 16000, AC03: 9000, AC04: 5000 },
  { type: 'Enpal', AC01: 12000, AC02: 14000, AC03: 8000, AC04: 4000 },
  { type: 'Commercial', AC01: 18000, AC02: 15000, AC03: 10000, AC04: 6000 },
];

export const typeBreakdownRows: TypeBreakdownRow[] = [
  { type: 'Retrofit', fuelCost: 8400, materialCost: 27600, profit: 52000, profitPct: 0.34 },
  { type: 'Vilor', fuelCost: 7200, materialCost: 21400, profit: 41000, profitPct: 0.32 },
  { type: 'Enpal', fuelCost: 4800, materialCost: 16900, profit: 30000, profitPct: 0.29 },
  { type: 'Commercial', fuelCost: 6100, materialCost: 19200, profit: 36000, profitPct: 0.31 },
];

export const dailyProfitData: DailyProfitPoint[] = [
  { date: '01 Jan', profit: 2200 },
  { date: '02 Jan', profit: 3100 },
  { date: '03 Jan', profit: 1800 },
  { date: '04 Jan', profit: 4200 },
  { date: '05 Jan', profit: 2600 },
  { date: '06 Jan', profit: 3900 },
  { date: '07 Jan', profit: 3300 },
  { date: '08 Jan', profit: 2500 },
  { date: '09 Jan', profit: 4700 },
  { date: '10 Jan', profit: 2800 },
  { date: '11 Jan', profit: 3600 },
  { date: '12 Jan', profit: 4100 },
  { date: '13 Jan', profit: 2900 },
  { date: '14 Jan', profit: 5300 },
];

export const teamTypePerformanceRows: TeamTypePerformanceRow[] = [
  { team: 'AC01', type: 'Retrofit', revenue: 86000, profit: 24000, profitPct: 0.28, operations: 22 },
  { team: 'AC01', type: 'Vilor', revenue: 74000, profit: 21000, profitPct: 0.28, operations: 18 },
  { team: 'AC01', type: 'Enpal', revenue: 52000, profit: 12000, profitPct: 0.23, operations: 12 },
  { team: 'AC02', type: 'Retrofit', revenue: 69000, profit: 18000, profitPct: 0.26, operations: 19 },
  { team: 'AC02', type: 'Vilor', revenue: 61000, profit: 16000, profitPct: 0.26, operations: 16 },
  { team: 'AC02', type: 'Commercial', revenue: 54000, profit: 15000, profitPct: 0.28, operations: 11 },
  { team: 'AC03', type: 'Retrofit', revenue: 43000, profit: 11000, profitPct: 0.26, operations: 10 },
  { team: 'AC03', type: 'Commercial', revenue: 48000, profit: 10000, profitPct: 0.21, operations: 9 },
  { team: 'AC04', type: 'Vilor', revenue: 39000, profit: 9000, profitPct: 0.23, operations: 8 },
  { team: 'AC04', type: 'Enpal', revenue: 36000, profit: 8000, profitPct: 0.22, operations: 7 },
];
