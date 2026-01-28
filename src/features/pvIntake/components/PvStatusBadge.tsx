import type { PvIntakeStatus } from '../types';
import { PV_STATUS_LABELS } from '../constants';

const STATUS_STYLES: Record<PvIntakeStatus, string> = {
  build_done: 'bg-slate-100 text-slate-600',
  whatsapp_intake_open: 'bg-blue-100 text-blue-700',
  ai_structuring: 'bg-indigo-100 text-indigo-700',
  review_missing_data: 'bg-amber-100 text-amber-700',
  pre_registration_and_mastr: 'bg-violet-100 text-violet-700',
  final_notification: 'bg-emerald-100 text-emerald-700',
  closed: 'bg-slate-200 text-slate-600',
};

export const PvStatusBadge = ({ status }: { status: PvIntakeStatus }) => (
  <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${STATUS_STYLES[status]}`}>
    {PV_STATUS_LABELS[status]}
  </span>
);
