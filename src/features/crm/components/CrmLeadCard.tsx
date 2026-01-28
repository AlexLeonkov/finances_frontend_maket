import { CSS } from '@dnd-kit/utilities';
import { useSortable } from '@dnd-kit/sortable';

import type { Lead } from '../types';
import { formatEUR } from '../../../shared/lib/format';
import { LEAD_CATEGORY_LABELS, LEAD_OFFER_STATUS_LABELS, LEAD_PRIORITY_LABELS } from '../constants';

type CrmLeadCardProps = {
  lead: Lead;
  onOpen: (lead: Lead) => void;
};

export const CrmLeadCard = ({ lead, onOpen }: CrmLeadCardProps) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: lead.id,
    data: { status: lead.status },
  });

  const style = {
    transform: CSS.Translate.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      onClick={() => {
        if (!isDragging) {
          onOpen(lead);
        }
      }}
      className={`rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition-shadow touch-none cursor-grab ${
        isDragging ? 'opacity-60' : 'hover:shadow-md'
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-semibold text-slate-800">{lead.customerName}</p>
          <p className="text-xs text-slate-500">
            {lead.companyName ? `${lead.companyName} • ${lead.address}` : lead.address}
          </p>
        </div>
        <span className="text-xs font-semibold text-indigo-600">
          {formatEUR(lead.estimatedValueEUR)}
        </span>
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-slate-500">
        <span className="rounded-full bg-slate-100 px-2 py-0.5">
          {LEAD_CATEGORY_LABELS[lead.category]}
        </span>
        <span className="rounded-full bg-slate-100 px-2 py-0.5">
          {LEAD_PRIORITY_LABELS[lead.priority]}
        </span>
        {typeof lead.leadScore === 'number' && (
          <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-emerald-700">
            Score {lead.leadScore}
          </span>
        )}
        {typeof lead.dealProbability === 'number' && (
          <span className="rounded-full bg-amber-50 px-2 py-0.5 text-amber-700">
            {lead.dealProbability}% prob
          </span>
        )}
        {lead.offerStatus && lead.offerStatus !== 'none' && (
          <span className="rounded-full bg-sky-50 px-2 py-0.5 text-sky-700">
            {LEAD_OFFER_STATUS_LABELS[lead.offerStatus]}
          </span>
        )}
        {lead.tags.slice(0, 2).map((tag) => (
          <span key={tag} className="rounded-full bg-indigo-50 px-2 py-0.5 text-indigo-600">
            {tag}
          </span>
        ))}
      </div>
      {lead.nextStep && (
        <p className="mt-2 text-xs text-slate-400">Next: {lead.nextStep}</p>
      )}
    </div>
  );
};
