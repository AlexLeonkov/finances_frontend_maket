import type { PvCase } from '../types';
import { NETZBETREIBER_LABELS } from '../constants';
import { PvStatusBadge } from './PvStatusBadge';

type PvCaseListProps = {
  cases: PvCase[];
  selectedCaseId: string | null;
  missingCounts: Record<string, number>;
  onSelect: (caseId: string) => void;
};

export const PvCaseList = ({
  cases,
  selectedCaseId,
  missingCounts,
  onSelect,
}: PvCaseListProps) => {
  return (
    <div className="space-y-3">
      {cases.map((pvCase) => {
        const missingCount = missingCounts[pvCase.id] ?? 0;
        return (
          <button
            key={pvCase.id}
            onClick={() => onSelect(pvCase.id)}
            className={`w-full text-left rounded-2xl border p-4 transition ${
              selectedCaseId === pvCase.id
                ? 'border-indigo-400 bg-indigo-50/50 shadow-sm'
                : 'border-slate-200 bg-white hover:border-slate-300'
            }`}
          >
            <div className="flex items-center justify-between gap-2">
              <p className="font-semibold text-slate-800">{pvCase.customerName}</p>
              <PvStatusBadge status={pvCase.status} />
            </div>
            <p className="mt-1 text-xs text-slate-500">{pvCase.address}</p>
            <div className="mt-3 flex items-center justify-between text-xs text-slate-500">
              <span>{NETZBETREIBER_LABELS[pvCase.netzbetreiber]}</span>
              <span>{pvCase.messages.length} attachments</span>
              <span className={`${missingCount > 0 ? 'text-amber-600' : 'text-emerald-600'}`}>
                {missingCount} missing
              </span>
            </div>
          </button>
        );
      })}
      {cases.length === 0 && (
        <div className="rounded-2xl border border-dashed border-slate-200 bg-white px-4 py-8 text-center text-sm text-slate-400">
          No cases match the filters.
        </div>
      )}
    </div>
  );
};
