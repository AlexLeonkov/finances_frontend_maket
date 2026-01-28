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

export type LeadPropertyType = 'single_family' | 'multi_family' | 'commercial' | 'industrial';

export type LeadFinancing = 'unknown' | 'cash' | 'loan' | 'lease' | 'subsidy';

export type LeadOfferStatus = 'none' | 'draft' | 'requested' | 'sent' | 'signed';

export type LeadActivityType = 'note' | 'call' | 'email' | 'meeting' | 'offer';

export type LeadTaskStatus = 'open' | 'done';

export type LeadTaskPriority = 'low' | 'medium' | 'high';

export interface LeadActivity {
  id: string;
  type: LeadActivityType;
  message: string;
  createdAt: string;
  author?: string | null;
}

export interface LeadTask {
  id: string;
  title: string;
  dueDate?: string | null;
  status: LeadTaskStatus;
  priority: LeadTaskPriority;
  owner?: string | null;
}

export interface LeadFile {
  id: string;
  name: string;
  uploadedAt: string;
  size?: number | null;
}

export interface Lead {
  id: string;
  createdAt: string;
  customerName: string;
  companyName?: string | null;
  jobTitle?: string | null;
  website?: string | null;
  phone?: string | null;
  email?: string | null;
  address: string;
  source: LeadSource;
  category: LeadCategory;
  status: LeadStatus;
  priority: LeadPriority;
  estimatedValueEUR: number;
  leadScore?: number | null;
  dealProbability?: number | null;
  expectedCloseDate?: string | null;
  nextContactAt?: string | null;
  nextStep?: string | null;
  propertyType?: LeadPropertyType | null;
  systemSizeKwp?: number | null;
  financing?: LeadFinancing | null;
  activities?: LeadActivity[];
  tasks?: LeadTask[];
  files?: LeadFile[];
  offerStatus?: LeadOfferStatus | null;
  lastOfferAt?: string | null;
  tags: string[];
  notes: string;
  lastContactAt?: string | null;
  assignee?: string | null;
}
