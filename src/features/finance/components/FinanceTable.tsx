import {
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  type ColumnDef,
  type SortingState,
  useReactTable,
} from '@tanstack/react-table';
import { useMemo, useState } from 'react';

import type { FinanceRow } from '../types';
import { formatEUR } from '../../../shared/lib/format';

type FinanceTableProps = {
  rows: FinanceRow[];
};

const formatDate = (value: string) =>
  new Date(value).toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit' });

export const FinanceTable = ({ rows }: FinanceTableProps) => {
  const [sorting, setSorting] = useState<SortingState>([]);

  const columns = useMemo<ColumnDef<FinanceRow>[]>(
    () => [
      {
        accessorKey: 'date',
        header: 'Дата',
        cell: ({ getValue }) => formatDate(String(getValue())),
      },
      {
        accessorKey: 'openingBalance',
        header: 'Открытие',
        cell: ({ getValue }) => formatEUR(Number(getValue())),
      },
      {
        id: 'income',
        header: 'Доход',
        cell: ({ row }) =>
          formatEUR(row.original.incomeBills + row.original.otherIncome),
      },
      {
        accessorKey: 'materials',
        header: 'Материалы',
        cell: ({ getValue }) => formatEUR(Number(getValue())),
      },
      {
        accessorKey: 'salaryPaid',
        header: 'Зарплаты',
        cell: ({ getValue }) => formatEUR(Number(getValue())),
      },
      {
        accessorKey: 'totalExpenses',
        header: 'Расходы всего',
        cell: ({ getValue }) => formatEUR(Number(getValue())),
      },
      {
        accessorKey: 'closingBalance',
        header: 'Закрытие',
        cell: ({ getValue }) => formatEUR(Number(getValue())),
      },
    ],
    []
  );

  const table = useReactTable({
    data: rows,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  return (
    <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
      <div className="max-h-[460px] overflow-auto">
        <table className="w-full text-sm">
          <thead className="sticky top-0 bg-slate-50 text-slate-500 uppercase text-xs">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    className="px-4 py-3 text-left font-semibold tracking-wide cursor-pointer select-none"
                    onClick={header.column.getToggleSortingHandler()}
                  >
                    <div className="flex items-center gap-2">
                      {flexRender(header.column.columnDef.header, header.getContext())}
                      {header.column.getIsSorted() === 'asc' && '↑'}
                      {header.column.getIsSorted() === 'desc' && '↓'}
                    </div>
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.map((row) => {
              const income = row.original.incomeBills + row.original.otherIncome;
              const isNegative = row.original.totalExpenses > income;
              return (
                <tr
                  key={row.id}
                  className={`border-t border-slate-100 ${
                    isNegative ? 'bg-rose-50 text-rose-700' : 'hover:bg-slate-50'
                  }`}
                >
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} className="px-4 py-3 align-top">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
