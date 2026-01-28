export type FinanceRow = {
  date: string;
  openingBalance: number;
  incomeBills: number;
  otherIncome: number;
  materials: number;
  car: number;
  rent: number;
  salaryPaid: number;
  otherExpenses: number;
  marketing: number;
  food: number;
  insurance: number;
  totalExpenses: number;
  closingBalance: number;
};

export type FinanceLedgerRow = {
  id: string;
  account_id: string;
  ledger_date: string;
  opening_balance: number | null;
  income_invoices: number | null;
  income_other: number | null;
  expense_materials: number | null;
  expense_car: number | null;
  expense_rent: number | null;
  expense_salaries: number | null;
  expense_other: number | null;
  expense_marketing: number | null;
  expense_hamburg: number | null;
  expense_insurance: number | null;
  total_expenses: number | null;
  closing_balance: number | null;
  source?: string | null;
  source_row_id?: string | null;
  created_at?: string | null;
};
