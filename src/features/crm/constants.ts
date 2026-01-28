import type {
  LeadCategory,
  LeadOfferStatus,
  LeadFinancing,
  LeadPriority,
  LeadPropertyType,
  LeadSource,
  LeadStatus,
} from './types';

export const LEAD_STATUS_ORDER: LeadStatus[] = [
  'new',
  'contacted',
  'site_visit',
  'offer_sent',
  'negotiation',
  'won',
  'lost',
];

export const LEAD_STATUS_LABELS: Record<LeadStatus, string> = {
  new: 'New',
  contacted: 'Contacted',
  site_visit: 'Site Visit',
  offer_sent: 'Offer Sent',
  negotiation: 'Negotiation',
  won: 'Won',
  lost: 'Lost',
};

export const LEAD_CATEGORY_LABELS: Record<LeadCategory, string> = {
  pv: 'PV',
  elektro: 'Elektro',
  waermepumpe: 'Wärmepumpe',
  pv_plus_wp: 'PV + WP',
};

export const LEAD_SOURCE_LABELS: Record<LeadSource, string> = {
  google_ads: 'Google Ads',
  meta_ads: 'Meta Ads',
  referral: 'Referral',
  organic: 'Organic',
  partner: 'Partner',
  other: 'Other',
};

export const LEAD_PRIORITY_LABELS: Record<LeadPriority, string> = {
  low: 'Low',
  medium: 'Medium',
  high: 'High',
};

export const LEAD_PROPERTY_TYPE_LABELS: Record<LeadPropertyType, string> = {
  single_family: 'Single Family',
  multi_family: 'Multi Family',
  commercial: 'Commercial',
  industrial: 'Industrial',
};

export const LEAD_FINANCING_LABELS: Record<LeadFinancing, string> = {
  unknown: 'Unknown',
  cash: 'Cash',
  loan: 'Loan',
  lease: 'Lease',
  subsidy: 'Subsidy',
};

export const LEAD_OFFER_STATUS_LABELS: Record<LeadOfferStatus, string> = {
  none: 'No offer',
  draft: 'Draft',
  requested: 'Requested',
  sent: 'Sent',
  signed: 'Signed',
};
