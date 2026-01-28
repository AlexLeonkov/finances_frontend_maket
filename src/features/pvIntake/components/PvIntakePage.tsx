import { useMemo, useState } from 'react';

import type { PvIntakeStatus } from '../types';
import { NETZBETREIBER_LABELS, PV_STATUS_LABELS, PV_STATUS_ORDER } from '../constants';
import { getMissingRequiredItems, usePvIntakeStore } from '../store/usePvIntakeStore';
import { PvCaseDetails } from './PvCaseDetails';
import { PvCaseList } from './PvCaseList';

export const PvIntakePage = () => {
  const {
    cases,
    selectedCase,
    selectedCaseId,
    aiRunningIds,
    selectCase,
    createCase,
    updateCase,
    updateExtractedData,
    toggleChecklistItem,
    runAiStructuring,
  } = usePvIntakeStore();

  const [searchTerm, setSearchTerm] = useState('');
  const [netzbetreiberFilter, setNetzbetreiberFilter] = useState<'all' | 'stromnetz_berlin' | 'edis'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | PvIntakeStatus>('all');

  const filteredCases = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();
    return cases.filter((pvCase) => {
      if (netzbetreiberFilter !== 'all' && pvCase.netzbetreiber !== netzbetreiberFilter) {
        return false;
      }
      if (statusFilter !== 'all' && pvCase.status !== statusFilter) {
        return false;
      }
      if (query) {
        const haystack = `${pvCase.customerName} ${pvCase.address}`.toLowerCase();
        if (!haystack.includes(query)) {
          return false;
        }
      }
      return true;
    });
  }, [cases, searchTerm, netzbetreiberFilter, statusFilter]);

  const missingCounts = useMemo(
    () =>
      Object.fromEntries(
        cases.map((pvCase) => [pvCase.id, getMissingRequiredItems(pvCase).length])
      ),
    [cases]
  );

  return (
    <div className="space-y-6">
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-3">
            <input
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Search cases..."
              className="w-full md:w-64 rounded-lg border border-slate-200 px-3 py-2 text-sm"
            />
            <select
              value={netzbetreiberFilter}
              onChange={(event) =>
                setNetzbetreiberFilter(event.target.value as 'all' | 'stromnetz_berlin' | 'edis')
              }
              className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
            >
              <option value="all">All netzbetreiber</option>
              {Object.entries(NETZBETREIBER_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
            <select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value as 'all' | PvIntakeStatus)}
              className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
            >
              <option value="all">All statuses</option>
              {PV_STATUS_ORDER.map((status) => (
                <option key={status} value={status}>
                  {PV_STATUS_LABELS[status]}
                </option>
              ))}
            </select>
          </div>
          <button
            onClick={() =>
              createCase({
                customerName: 'New PV Case',
                address: '',
                status: 'build_done',
                netzbetreiber: 'stromnetz_berlin',
              })
            }
            className="px-4 py-2 rounded-lg bg-indigo-600 text-white text-sm font-semibold shadow-sm hover:bg-indigo-700"
          >
            New Case
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[320px_minmax(0,1fr)]">
        <PvCaseList
          cases={filteredCases}
          selectedCaseId={selectedCaseId}
          missingCounts={missingCounts}
          onSelect={selectCase}
        />

        {selectedCase ? (
          <PvCaseDetails
            pvCase={selectedCase}
            aiRunning={aiRunningIds.includes(selectedCase.id)}
            onRunAi={() => runAiStructuring(selectedCase.id)}
            onUpdateExtracted={(patch) => updateExtractedData(selectedCase.id, patch)}
            onUpdateCase={(patch) => updateCase(selectedCase.id, patch)}
            onToggleChecklist={(itemId) => toggleChecklistItem(selectedCase.id, itemId)}
          />
        ) : (
          <div className="rounded-2xl border border-dashed border-slate-200 bg-white px-6 py-12 text-center text-sm text-slate-400">
            Select a case to see details.
          </div>
        )}
      </div>
    </div>
  );
};
