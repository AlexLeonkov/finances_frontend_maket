import type { PvIntakeStatus } from './types';

export const PV_STATUS_ORDER: PvIntakeStatus[] = [
  'build_done',
  'whatsapp_intake_open',
  'ai_structuring',
  'review_missing_data',
  'pre_registration_and_mastr',
  'final_notification',
  'closed',
];

export const PV_STATUS_LABELS: Record<PvIntakeStatus, string> = {
  build_done: 'Build done',
  whatsapp_intake_open: 'WhatsApp intake open',
  ai_structuring: 'AI structuring',
  review_missing_data: 'Review & missing data',
  pre_registration_and_mastr: 'Pre-reg + MaStR',
  final_notification: 'Final notification',
  closed: 'Closed',
};

export const NETZBETREIBER_LABELS: Record<'stromnetz_berlin' | 'edis', string> = {
  stromnetz_berlin: 'Stromnetz Berlin',
  edis: 'E.DIS',
};
