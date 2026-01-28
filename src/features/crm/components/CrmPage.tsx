import { useMemo, useState } from 'react';

import type { Lead, LeadCategory, LeadSource, LeadStatus } from '../types';
import {
  LEAD_CATEGORY_LABELS,
  LEAD_SOURCE_LABELS,
  LEAD_STATUS_LABELS,
} from '../constants';
import { useLeads } from '../hooks/useLeads';
import { CrmKanbanBoard } from './CrmKanbanBoard';
import { CrmLeadDetailPage } from './CrmLeadDetailPage';
import { CrmTableView } from './CrmTableView';
import { formatEUR } from '../../../shared/lib/format';

type ViewMode = 'kanban' | 'table';

const createEmptyLead = (): Lead => ({
  id: '',
  createdAt: new Date().toISOString(),
  customerName: '',
  companyName: '',
  jobTitle: '',
  website: '',
  phone: '',
  email: '',
  address: '',
  source: 'other',
  category: 'pv',
  status: 'new',
  priority: 'medium',
  estimatedValueEUR: 15000,
  leadScore: 65,
  dealProbability: 20,
  expectedCloseDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30).toISOString(),
  nextContactAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 2).toISOString(),
  nextStep: 'Initial outreach',
  propertyType: 'single_family',
  systemSizeKwp: 8.5,
  financing: 'unknown',
  activities: [],
  tasks: [],
  files: [],
  offerStatus: 'none',
  lastOfferAt: null,
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

  const [selectedLeadId, setSelectedLeadId] = useState<string | null>(null);
  const [creatingLead, setCreatingLead] = useState<Lead | null>(null);

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
      [
        lead.customerName,
        lead.companyName ?? '',
        lead.jobTitle ?? '',
        lead.website ?? '',
        lead.address,
        lead.email ?? '',
        lead.phone ?? '',
      ]
        .join(' ')
        .toLowerCase()
        .includes(query)
    );
  }, [filteredLeads, searchTerm]);

  const stats = useMemo(() => {
    const total = leads.length;
    const won = leads.filter((lead) => lead.status === 'won').length;
    const activeLeads = leads.filter(
      (lead) => lead.status !== 'won' && lead.status !== 'lost'
    );
    const pipelineValue = activeLeads.reduce(
      (sum, lead) => sum + (lead.estimatedValueEUR ?? 0),
      0
    );
    const avgDeal =
      total > 0
        ? leads.reduce((sum, lead) => sum + (lead.estimatedValueEUR ?? 0), 0) / total
        : 0;
    const openTasks = leads.reduce(
      (sum, lead) => sum + (lead.tasks?.filter((task) => task.status === 'open').length ?? 0),
      0
    );
    const winRate = total > 0 ? Math.round((won / total) * 100) : 0;

    return {
      total,
      active: activeLeads.length,
      pipelineValue,
      avgDeal,
      winRate,
      openTasks,
    };
  }, [leads]);

  const openLead = (lead: Lead) => {
    setSelectedLeadId(lead.id);
    setCreatingLead(null);
  };

  const openNewLead = () => {
    setCreatingLead(createEmptyLead());
    setSelectedLeadId(null);
  };

  const handleSave = (lead: Lead) => {
    if (creatingLead) {
      createLead({ ...lead, id: undefined });
    } else {
      updateLead(lead.id, lead);
    }
    setSelectedLeadId(null);
    setCreatingLead(null);
  };

  const handleDelete = (id: string) => {
    deleteLead(id);
    setSelectedLeadId(null);
    setCreatingLead(null);
  };

  const activeLead = creatingLead ?? leads.find((lead) => lead.id === selectedLeadId) ?? null;
  const isDetailView = Boolean(creatingLead || selectedLeadId);

  if (isDetailView) {
    return (
      <CrmLeadDetailPage
        lead={activeLead}
        isNew={Boolean(creatingLead)}
        onBack={() => {
          setSelectedLeadId(null);
          setCreatingLead(null);
        }}
        onSave={handleSave}
        onDelete={handleDelete}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-6 gap-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-xs text-slate-400 uppercase">Total Leads</p>
          <p className="mt-2 text-2xl font-semibold text-slate-800">{stats.total}</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-xs text-slate-400 uppercase">Active</p>
          <p className="mt-2 text-2xl font-semibold text-slate-800">{stats.active}</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-xs text-slate-400 uppercase">Pipeline Value</p>
          <p className="mt-2 text-2xl font-semibold text-slate-800">
            {formatEUR(stats.pipelineValue)}
          </p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-xs text-slate-400 uppercase">Avg Deal</p>
          <p className="mt-2 text-2xl font-semibold text-slate-800">
            {formatEUR(stats.avgDeal)}
          </p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-xs text-slate-400 uppercase">Win Rate</p>
          <p className="mt-2 text-2xl font-semibold text-slate-800">{stats.winRate}%</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-xs text-slate-400 uppercase">Open Tasks</p>
          <p className="mt-2 text-2xl font-semibold text-slate-800">{stats.openTasks}</p>
        </div>
      </div>
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

    </div>
  );
};
