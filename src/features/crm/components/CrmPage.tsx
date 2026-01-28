import { useMemo, useState } from 'react';

import type { Lead, LeadCategory, LeadSource, LeadStatus } from '../types';
import {
  LEAD_CATEGORY_LABELS,
  LEAD_SOURCE_LABELS,
  LEAD_STATUS_LABELS,
} from '../constants';
import { useLeads } from '../hooks/useLeads';
import { CrmKanbanBoard } from './CrmKanbanBoard';
import { CrmTableView } from './CrmTableView';
import { LeadDrawer } from './LeadDrawer';

type ViewMode = 'kanban' | 'table';

const createEmptyLead = (): Lead => ({
  id: '',
  createdAt: new Date().toISOString(),
  customerName: '',
  phone: '',
  email: '',
  address: '',
  source: 'other',
  category: 'pv',
  status: 'new',
  priority: 'medium',
  estimatedValueEUR: 15000,
  tags: [],
  notes: '',
  lastContactAt: null,
  assignee: '',
});

export const CrmPage = () => {
  const { leads, updateLead, createLead, deleteLead } = useLeads();

  const [viewMode, setViewMode] = useState<ViewMode>('kanban');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<LeadStatus | 'all'>('all');
  const [categoryFilter, setCategoryFilter] = useState<LeadCategory | 'all'>('all');
  const [sourceFilter, setSourceFilter] = useState<LeadSource | 'all'>('all');

  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [editingLead, setEditingLead] = useState<Lead | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  const filteredLeads = useMemo(() => {
    return leads.filter((lead) => {
      if (statusFilter !== 'all' && lead.status !== statusFilter) {
        return false;
      }
      if (categoryFilter !== 'all' && lead.category !== categoryFilter) {
        return false;
      }
      if (sourceFilter !== 'all' && lead.source !== sourceFilter) {
        return false;
      }
      return true;
    });
  }, [leads, statusFilter, categoryFilter, sourceFilter]);

  const searchFilteredLeads = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();
    if (!query) {
      return filteredLeads;
    }
    return filteredLeads.filter((lead) =>
      [lead.customerName, lead.address, lead.email ?? '', lead.phone ?? '']
        .join(' ')
        .toLowerCase()
        .includes(query)
    );
  }, [filteredLeads, searchTerm]);

  const openLead = (lead: Lead) => {
    setEditingLead(lead);
    setIsCreating(false);
    setIsDrawerOpen(true);
  };

  const openNewLead = () => {
    setEditingLead(createEmptyLead());
    setIsCreating(true);
    setIsDrawerOpen(true);
  };

  const handleSave = (lead: Lead) => {
    if (isCreating) {
      createLead({ ...lead, id: undefined });
    } else {
      updateLead(lead.id, lead);
    }
    setIsDrawerOpen(false);
  };

  const handleDelete = (id: string) => {
    deleteLead(id);
    setIsDrawerOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setViewMode('kanban')}
              className={`px-3 py-1.5 rounded-lg text-sm font-semibold ${
                viewMode === 'kanban'
                  ? 'bg-indigo-600 text-white shadow'
                  : 'text-slate-500 hover:bg-slate-100'
              }`}
            >
              Kanban
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`px-3 py-1.5 rounded-lg text-sm font-semibold ${
                viewMode === 'table'
                  ? 'bg-indigo-600 text-white shadow'
                  : 'text-slate-500 hover:bg-slate-100'
              }`}
            >
              Table
            </button>
          </div>

          <div className="flex flex-1 flex-wrap items-center gap-3 lg:justify-end">
            <input
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Search leads..."
              className="w-full md:w-56 rounded-lg border border-slate-200 px-3 py-2 text-sm"
            />
            <select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value as LeadStatus | 'all')}
              className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
            >
              <option value="all">All statuses</option>
              {Object.entries(LEAD_STATUS_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
            <select
              value={categoryFilter}
              onChange={(event) => setCategoryFilter(event.target.value as LeadCategory | 'all')}
              className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
            >
              <option value="all">All categories</option>
              {Object.entries(LEAD_CATEGORY_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
            <select
              value={sourceFilter}
              onChange={(event) => setSourceFilter(event.target.value as LeadSource | 'all')}
              className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
            >
              <option value="all">All sources</option>
              {Object.entries(LEAD_SOURCE_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
            <button
              onClick={openNewLead}
              className="ml-auto lg:ml-0 px-4 py-2 rounded-lg bg-indigo-600 text-white text-sm font-semibold shadow-sm hover:bg-indigo-700"
            >
              New Lead
            </button>
          </div>
        </div>
      </div>

      {viewMode === 'kanban' ? (
        <CrmKanbanBoard
          leads={searchFilteredLeads}
          onMove={(id, status) => updateLead(id, { status })}
          onOpen={openLead}
        />
      ) : (
        <CrmTableView
          leads={filteredLeads}
          searchTerm={searchTerm}
          onStatusChange={(id, status) => updateLead(id, { status })}
          onOpen={openLead}
        />
      )}

      <LeadDrawer
        lead={editingLead}
        isOpen={isDrawerOpen}
        isNew={isCreating}
        onClose={() => setIsDrawerOpen(false)}
        onSave={handleSave}
        onDelete={handleDelete}
      />
    </div>
  );
};
