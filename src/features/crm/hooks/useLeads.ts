import { useCallback, useEffect, useState } from 'react';

import type {
  Lead,
  LeadActivity,
  LeadActivityType,
  LeadOfferStatus,
  LeadStatus,
} from '../types';
import { mockLeads } from '../mock/leadsMock';

const STORAGE_KEY = 'crm_leads_v1';
const DEFAULT_SCORE = 70;
const DEFAULT_SYSTEM_KWP = 8.5;

const STATUS_PROBABILITY: Record<LeadStatus, number> = {
  new: 15,
  contacted: 30,
  site_visit: 45,
  offer_sent: 60,
  negotiation: 75,
  won: 100,
  lost: 0,
};

const STATUS_NEXT_STEP: Record<LeadStatus, string> = {
  new: 'Initial outreach',
  contacted: 'Schedule discovery call',
  site_visit: 'Confirm site visit',
  offer_sent: 'Review offer details',
  negotiation: 'Finalize terms',
  won: 'Coordinate installation',
  lost: 'Archive + learnings',
};

const addDays = (value: string, days: number) => {
  const date = new Date(value);
  date.setDate(date.getDate() + days);
  return date.toISOString();
};

const createActivity = (
  lead: Lead,
  type: LeadActivityType,
  message: string,
  createdAt?: string
): LeadActivity => ({
  id: `act-${lead.id}-${Math.random().toString(16).slice(2)}`,
  type,
  message,
  createdAt: createdAt ?? new Date().toISOString(),
  author: lead.assignee ?? 'System',
});

const nextContactFromStatus = (lead: Lead) => {
  if (lead.status === 'won' || lead.status === 'lost') {
    return null;
  }
  const baseDate = lead.lastContactAt ?? lead.createdAt;
  const offset = lead.status === 'new' ? 2 : lead.status === 'offer_sent' ? 5 : 3;
  return addDays(baseDate, offset);
};

const offerStatusFromLead = (lead: Lead): LeadOfferStatus => {
  if (lead.status === 'won') {
    return 'signed';
  }
  if (lead.status === 'offer_sent' || lead.status === 'negotiation') {
    return 'sent';
  }
  if (lead.status === 'site_visit') {
    return 'draft';
  }
  return 'none';
};

const normalizeLead = (lead: Lead): Lead => {
  const companyFallback = lead.companyName ?? `${lead.customerName} Household`;
  const scoreFallback =
    lead.priority === 'high' ? 85 : lead.priority === 'low' ? 55 : DEFAULT_SCORE;
  const probabilityFallback = STATUS_PROBABILITY[lead.status];
  const expectedCloseFallback =
    lead.status === 'won' || lead.status === 'lost'
      ? lead.lastContactAt ?? lead.createdAt
      : addDays(lead.createdAt, 30);
  const sizeFallback =
    lead.category === 'pv'
      ? DEFAULT_SYSTEM_KWP
      : lead.category === 'pv_plus_wp'
        ? 12
        : null;
  const financingFallback = lead.tags?.includes('needs_financing') ? 'loan' : 'cash';
  const defaultActivity = createActivity(
    lead,
    'note',
    'Lead created',
    lead.createdAt
  );
  const activitiesFallback =
    lead.activities && lead.activities.length > 0 ? lead.activities : [defaultActivity];

  return {
    ...lead,
    companyName: companyFallback,
    jobTitle: lead.jobTitle ?? 'Homeowner',
    website: lead.website ?? null,
    leadScore: lead.leadScore ?? scoreFallback,
    dealProbability: lead.dealProbability ?? probabilityFallback,
    expectedCloseDate: lead.expectedCloseDate ?? expectedCloseFallback,
    nextContactAt: lead.nextContactAt ?? nextContactFromStatus(lead),
    nextStep: lead.nextStep ?? STATUS_NEXT_STEP[lead.status],
    propertyType: lead.propertyType ?? (lead.category === 'elektro' ? 'commercial' : 'single_family'),
    systemSizeKwp: lead.systemSizeKwp ?? sizeFallback,
    financing: lead.financing ?? financingFallback,
    activities: activitiesFallback,
    tasks: lead.tasks ?? [],
    files: lead.files ?? [],
    offerStatus: lead.offerStatus ?? offerStatusFromLead(lead),
    lastOfferAt: lead.lastOfferAt ?? null,
  };
};

const createId = () =>
  typeof crypto !== 'undefined' && crypto.randomUUID
    ? crypto.randomUUID()
    : `lead-${Date.now()}-${Math.random().toString(16).slice(2)}`;

const loadLeads = (): Lead[] => {
  if (typeof localStorage === 'undefined') {
    return mockLeads;
  }

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      return mockLeads.map(normalizeLead);
    }
    const parsed = JSON.parse(stored) as Lead[];
    const hydrated = Array.isArray(parsed) && parsed.length > 0 ? parsed : mockLeads;
    return hydrated.map(normalizeLead);
  } catch {
    return mockLeads.map(normalizeLead);
  }
};

export const useLeads = () => {
  const [leads, setLeads] = useState<Lead[]>(() => loadLeads());

  useEffect(() => {
    if (typeof localStorage === 'undefined') {
      return;
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(leads));
  }, [leads]);

  const updateLead = useCallback((id: string, patch: Partial<Lead>) => {
    setLeads((prev) =>
      prev.map((lead) => {
        if (lead.id !== id) {
          return lead;
        }
        const nextPatch =
          patch.status && patch.status !== lead.status
            ? {
                ...patch,
                dealProbability: patch.dealProbability ?? STATUS_PROBABILITY[patch.status],
                nextStep: patch.nextStep ?? STATUS_NEXT_STEP[patch.status],
                nextContactAt: patch.nextContactAt ?? nextContactFromStatus({ ...lead, ...patch }),
              }
            : patch;
        return normalizeLead({ ...lead, ...nextPatch });
      })
    );
  }, []);

  const createLead = useCallback(
    (newLead: Omit<Lead, 'id'> & { id?: string }) => {
      const lead: Lead = normalizeLead({
        ...newLead,
        id: newLead.id ?? createId(),
        createdAt: newLead.createdAt ?? new Date().toISOString(),
      });
      setLeads((prev) => [lead, ...prev]);
      return lead;
    },
    []
  );

  const deleteLead = useCallback((id: string) => {
    setLeads((prev) => prev.filter((lead) => lead.id !== id));
  }, []);

  return {
    leads,
    updateLead,
    createLead,
    deleteLead,
  };
};
