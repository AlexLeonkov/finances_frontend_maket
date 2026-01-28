import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';

import type { Lead, LeadStatus } from '../types';
import { LEAD_STATUS_LABELS } from '../constants';
import { formatEUR } from '../../../shared/lib/format';
import { CrmLeadCard } from './CrmLeadCard';

type CrmKanbanColumnProps = {
  status: LeadStatus;
  itemIds: string[];
  leadsById: Record<string, Lead>;
  onOpen: (lead: Lead) => void;
};

export const CrmKanbanColumn = ({
  status,
  itemIds,
  leadsById,
  onOpen,
}: CrmKanbanColumnProps) => {
  const { setNodeRef, isOver } = useDroppable({ id: status });
  const totalValue = itemIds.reduce(
    (sum, id) => sum + (leadsById[id]?.estimatedValueEUR ?? 0),
    0
  );

  return (
    <div className="flex flex-col min-w-[260px] flex-1">
      <div className="flex items-center justify-between px-3 py-2">
        <div>
          <p className="text-sm font-semibold text-slate-700">
            {LEAD_STATUS_LABELS[status]}
          </p>
          <p className="text-xs text-slate-400">
            {itemIds.length} leads · {formatEUR(totalValue)}
          </p>
        </div>
      </div>
      <div
        ref={setNodeRef}
        className={`flex-1 rounded-2xl border border-dashed px-3 py-3 space-y-3 transition ${
          isOver ? 'border-indigo-400 bg-indigo-50/40' : 'border-slate-200'
        }`}
      >
        <SortableContext items={itemIds} strategy={verticalListSortingStrategy}>
          {itemIds.map((id) => {
            const lead = leadsById[id];
            if (!lead) {
              return null;
            }
            return <CrmLeadCard key={lead.id} lead={lead} onOpen={onOpen} />;
          })}
        </SortableContext>
        {itemIds.length === 0 && (
          <div className="rounded-xl border border-dashed border-slate-200 bg-white/60 px-3 py-6 text-xs text-slate-400 text-center">
            Drop leads here
          </div>
        )}
      </div>
    </div>
  );
};
