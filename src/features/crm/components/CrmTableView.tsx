import { useEffect, useMemo, useState } from 'react';
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  type ColumnDef,
  type FilterFn,
  type SortingState,
  useReactTable,
} from '@tanstack/react-table';

import type { Lead } from '../types';
import {
  LEAD_CATEGORY_LABELS,
  LEAD_SOURCE_LABELS,
  LEAD_STATUS_LABELS,
} from '../constants';
import { formatEUR } from '../../../shared/lib/format';

type CrmTableViewProps = {
  leads: Lead[];
  searchTerm: string;
  onStatusChange: (id: string, status: Lead['status']) => void;
  onOpen: (lead: Lead) => void;
};

const globalFilter: FilterFn<Lead> = (row, _columnId, value) => {
  const query = String(value ?? '').trim().toLowerCase();
  if (!query) {
    return true;
  }
  const { customerName, address, email, phone } = row.original;
  return [customerName, address, email ?? '', phone ?? ''].some((field) =>
    field.toLowerCase().includes(query)
  );
};

const formatDate = (value: string) =>
  new Date(value).toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit' });

export const CrmTableView = ({
  leads,
  searchTerm,
  onStatusChange,
  onOpen,
}: CrmTableViewProps) => {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [globalFilterValue, setGlobalFilterValue] = useState(searchTerm);

  useEffect(() => {
    setGlobalFilterValue(searchTerm);
  }, [searchTerm]);

  const columns = useMemo<ColumnDef<Lead>[]>(
    () => [
      {
        accessorKey: 'customerName',
        header: 'Customer',
        cell: ({ row }) => (
          <div>
            <p className="font-semibold text-slate-800">{row.original.customerName}</p>
            <p className="text-xs text-slate-500">{row.original.address}</p>
          </div>
        ),
      },
      {
        accessorKey: 'category',
        header: 'Category',
        cell: ({ getValue }) => LEAD_CATEGORY_LABELS[getValue() as Lead['category']],
      },
      {
        accessorKey: 'status',
        header: 'Status',
        cell: ({ row, getValue }) => (
          <select
            className="rounded-md border border-slate-200 bg-white px-2 py-1 text-xs"
            value={getValue() as Lead['status']}
            onClick={(event) => event.stopPropagation()}
            onChange={(event) =>
              onStatusChange(row.original.id, event.target.value as Lead['status'])
            }
          >
            {Object.entries(LEAD_STATUS_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        ),
      },
      {
        accessorKey: 'source',
        header: 'Source',
        cell: ({ getValue }) => LEAD_SOURCE_LABELS[getValue() as Lead['source']],
      },
      {
        accessorKey: 'estimatedValueEUR',
        header: 'Value',
        cell: ({ getValue }) => (
          <span className="font-semibold text-slate-700">
            {formatEUR(getValue() as number)}
          </span>
        ),
      },
      {
        accessorKey: 'priority',
        header: 'Priority',
        cell: ({ getValue }) => (
          <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs">
            {getValue() as string}
          </span>
        ),
      },
      {
        accessorKey: 'createdAt',
        header: 'Created',
        sortingFn: (a, b) =>
          new Date(a.original.createdAt).getTime() -
          new Date(b.original.createdAt).getTime(),
        cell: ({ getValue }) => formatDate(getValue() as string),
      },
      {
        accessorKey: 'assignee',
        header: 'Assignee',
        cell: ({ getValue }) => (getValue() ? String(getValue()) : '—'),
      },
    ],
    [onStatusChange]
  );

  const table = useReactTable({
    data: leads,
    columns,
    state: {
      sorting,
      globalFilter: globalFilterValue,
    },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilterValue,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    globalFilterFn: globalFilter,
  });

  return (
    <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
      <table className="w-full text-sm">
        <thead className="bg-slate-50 text-slate-500 uppercase text-xs">
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
          {table.getRowModel().rows.map((row) => (
            <tr
              key={row.id}
              className="border-t border-slate-100 hover:bg-slate-50 cursor-pointer"
              onClick={() => onOpen(row.original)}
            >
              {row.getVisibleCells().map((cell) => (
                <td key={cell.id} className="px-4 py-3 align-top">
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      {table.getRowModel().rows.length === 0 && (
        <div className="py-10 text-center text-sm text-slate-400">No leads found.</div>
      )}
    </div>
  );
};
