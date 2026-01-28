import { useCallback, useEffect, useState } from 'react';

import type { Lead } from '../types';
import { mockLeads } from '../mock/leadsMock';

const STORAGE_KEY = 'crm_leads_v1';

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
      return mockLeads;
    }
    const parsed = JSON.parse(stored) as Lead[];
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : mockLeads;
  } catch {
    return mockLeads;
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
      prev.map((lead) => (lead.id === id ? { ...lead, ...patch } : lead))
    );
  }, []);

  const createLead = useCallback(
    (newLead: Omit<Lead, 'id'> & { id?: string }) => {
      const lead: Lead = {
        ...newLead,
        id: newLead.id ?? createId(),
        createdAt: newLead.createdAt ?? new Date().toISOString(),
      };
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
