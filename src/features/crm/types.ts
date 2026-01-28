export type LeadSource =
  | 'google_ads'
  | 'meta_ads'
  | 'referral'
  | 'organic'
  | 'partner'
  | 'other';

export type LeadCategory = 'pv' | 'elektro' | 'waermepumpe' | 'pv_plus_wp';

export type LeadStatus =
  | 'new'
  | 'contacted'
  | 'site_visit'
  | 'offer_sent'
  | 'negotiation'
  | 'won'
  | 'lost';

export type LeadPriority = 'low' | 'medium' | 'high';

export interface Lead {
  id: string;
  createdAt: string;
  customerName: string;
  phone?: string | null;
  email?: string | null;
  address: string;
  source: LeadSource;
  category: LeadCategory;
  status: LeadStatus;
  priority: LeadPriority;
  estimatedValueEUR: number;
  tags: string[];
  notes: string;
  lastContactAt?: string | null;
  assignee?: string | null;
}
