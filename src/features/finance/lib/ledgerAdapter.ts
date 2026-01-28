import type { FinanceLedgerRow, FinanceRow } from '../types';

const toNumber = (value: unknown) => {
  if (typeof value === 'number') {
    return Number.isNaN(value) ? 0 : value;
  }
  if (typeof value === 'string' && value.trim() !== '') {
    const parsed = Number(value);
    return Number.isNaN(parsed) ? 0 : parsed;
  }
  return 0;
};

const toDateValue = (row: FinanceLedgerRow & Record<string, unknown>) =>
  String(row.ledger_date ?? row.ledgerDate ?? '');

export const mapLedgerToFinanceRows = (
  rows: Array<FinanceLedgerRow | Record<string, unknown>>
): FinanceRow[] => {
  return rows
    .map((row) => {
      const typed = row as FinanceLedgerRow & Record<string, unknown>;
      return {
        date: toDateValue(typed),
        openingBalance: toNumber(typed.opening_balance ?? typed.openingBalance),
        incomeBills: toNumber(typed.income_invoices ?? typed.incomeInvoices),
        otherIncome: toNumber(typed.income_other ?? typed.incomeOther),
        materials: toNumber(typed.expense_materials ?? typed.expenseMaterials),
        car: toNumber(typed.expense_car ?? typed.expenseCar),
        rent: toNumber(typed.expense_rent ?? typed.expenseRent),
        salaryPaid: toNumber(typed.expense_salaries ?? typed.expenseSalaries),
        otherExpenses: toNumber(typed.expense_other ?? typed.expenseOther),
        marketing: toNumber(typed.expense_marketing ?? typed.expenseMarketing),
        food: toNumber(typed.expense_hamburg ?? typed.expenseHamburg),
        insurance: toNumber(typed.expense_insurance ?? typed.expenseInsurance),
        totalExpenses: toNumber(typed.total_expenses ?? typed.totalExpenses),
        closingBalance: toNumber(typed.closing_balance ?? typed.closingBalance),
      };
    })
    .filter((row) => row.date)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
};
