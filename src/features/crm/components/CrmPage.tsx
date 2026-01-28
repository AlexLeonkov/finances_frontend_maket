import { useMemo, useState } from 'react';

import type { Lead, LeadCategory, LeadSource, LeadStatus } from '../types';
import {
  LEAD_CATEGORY_LABELS,
  LEAD_SOURCE_LABELS,
  LEAD_STATUS_LABELS,
  LEAD_STATUS_ORDER,
} from '../constants';
import { useLeads } from '../hooks/useLeads';
import { CrmKanbanBoard } from './CrmKanbanBoard';
import { CrmLeadDetailPage } from './CrmLeadDetailPage';
import { CrmTableView } from './CrmTableView';
import { formatEUR } from '../../../shared/lib/format';

type ViewMode = 'kanban' | 'table';
type TimeRange = '7d' | '30d' | '90d' | 'ytd' | 'all';

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
  const [timeRange, setTimeRange] = useState<TimeRange>('30d');
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

  const statsLeads = useMemo(() => {
    if (timeRange === 'all') {
      return leads;
    }
    const now = new Date();
    const start = new Date(now);
    if (timeRange === '7d') {
      start.setDate(now.getDate() - 7);
    } else if (timeRange === '30d') {
      start.setDate(now.getDate() - 30);
    } else if (timeRange === '90d') {
      start.setDate(now.getDate() - 90);
    } else if (timeRange === 'ytd') {
      start.setMonth(0, 1);
      start.setHours(0, 0, 0, 0);
    }
    return leads.filter((lead) => new Date(lead.createdAt) >= start);
  }, [leads, timeRange]);

  const stats = useMemo(() => {
    const total = statsLeads.length;
    const wonLeads = statsLeads.filter((lead) => lead.status === 'won');
    const won = wonLeads.length;
    const activeLeads = statsLeads.filter(
      (lead) => lead.status !== 'won' && lead.status !== 'lost'
    );
    const pipelineValue = activeLeads.reduce(
      (sum, lead) => sum + (lead.estimatedValueEUR ?? 0),
      0
    );
    const avgDeal =
      total > 0
        ? statsLeads.reduce((sum, lead) => sum + (lead.estimatedValueEUR ?? 0), 0) /
          total
        : 0;
    const openTasks = statsLeads.reduce(
      (sum, lead) => sum + (lead.tasks?.filter((task) => task.status === 'open').length ?? 0),
      0
    );
    const winRate = total > 0 ? Math.round((won / total) * 100) : 0;
    const commercial = statsLeads.filter((lead) =>
      ['commercial', 'industrial'].includes(lead.propertyType ?? '')
    ).length;

    return {
      total,
      active: activeLeads.length,
      pipelineValue,
      avgDeal,
      winRate,
      openTasks,
      wonValue: wonLeads.reduce(
        (sum, lead) => sum + (lead.estimatedValueEUR ?? 0),
        0
      ),
      commercial,
    };
  }, [statsLeads]);

  const statusBreakdown = useMemo(() => {
    return LEAD_STATUS_ORDER.map((status) => {
      const rows = statsLeads.filter((lead) => lead.status === status);
      const value = rows.reduce((sum, lead) => sum + (lead.estimatedValueEUR ?? 0), 0);
      return {
        status,
        count: rows.length,
        value,
      };
    });
  }, [statsLeads]);

  const categoryBreakdown = useMemo(() => {
    return Object.keys(LEAD_CATEGORY_LABELS).map((key) => {
      const category = key as LeadCategory;
      const rows = statsLeads.filter((lead) => lead.category === category);
      const won = rows.filter((lead) => lead.status === 'won').length;
      const total = rows.length;
      const pipeline = rows
        .filter((lead) => !['won', 'lost'].includes(lead.status))
        .reduce((sum, lead) => sum + (lead.estimatedValueEUR ?? 0), 0);
      return {
        category,
        count: total,
        pipeline,
        winRate: total > 0 ? Math.round((won / total) * 100) : 0,
      };
    });
  }, [statsLeads]);

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
      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-slate-800">CRM Performance</h2>
          <p className="text-sm text-slate-500">
            {timeRange === 'all' ? 'All time' : `Last ${timeRange.replace('d', ' days')}`}
          </p>
        </div>
        <div className="-mx-1 flex gap-2 overflow-x-auto px-1 sm:mx-0 sm:flex-wrap sm:overflow-visible">
          <div className="flex gap-2 whitespace-nowrap sm:flex-wrap">
            {(['7d', '30d', '90d', 'ytd', 'all'] as TimeRange[]).map((range) => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`px-3 py-1.5 rounded-lg text-sm font-semibold ${
                  timeRange === range
                    ? 'bg-indigo-600 text-white shadow'
                    : 'text-slate-500 hover:bg-slate-100'
                }`}
              >
                {range === 'ytd' ? 'YTD' : range.toUpperCase()}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
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

      <div className="grid grid-cols-1 xl:grid-cols-[1.4fr_1fr] gap-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-slate-700">Pipeline by Stage</p>
            <span className="text-xs text-slate-400">
              {formatEUR(stats.pipelineValue)} active
            </span>
          </div>
          <div className="mt-4 space-y-3">
            {statusBreakdown.map((row) => {
              const width =
                stats.total > 0 ? Math.max(4, Math.round((row.count / stats.total) * 100)) : 0;
              return (
                <div key={row.status} className="space-y-1">
                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <span>{LEAD_STATUS_LABELS[row.status]}</span>
                    <span>
                      {row.count} · {formatEUR(row.value)}
                    </span>
                  </div>
                  <div className="h-2 rounded-full bg-slate-100">
                    <div
                      className="h-2 rounded-full bg-indigo-500"
                      style={{ width: `${width}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-3">
          <p className="text-sm font-semibold text-slate-700">Business Mix</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
            <div className="rounded-xl border border-slate-100 bg-slate-50/60 p-3">
              <p className="text-xs text-slate-400 uppercase">Commercial Leads</p>
              <p className="mt-2 text-lg font-semibold text-slate-800">{stats.commercial}</p>
            </div>
            <div className="rounded-xl border border-slate-100 bg-slate-50/60 p-3">
              <p className="text-xs text-slate-400 uppercase">Won Value</p>
              <p className="mt-2 text-lg font-semibold text-slate-800">
                {formatEUR(stats.wonValue)}
              </p>
            </div>
          </div>
          <div className="space-y-2">
            {categoryBreakdown.map((row) => {
              const width =
                stats.total > 0 ? Math.max(4, Math.round((row.count / stats.total) * 100)) : 0;
              return (
                <div key={row.category} className="space-y-1">
                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <span>{LEAD_CATEGORY_LABELS[row.category]}</span>
                    <span>
                      {row.count} · {row.winRate}% win · {formatEUR(row.pipeline)}
                    </span>
                  </div>
                  <div className="h-2 rounded-full bg-slate-100">
                    <div
                      className="h-2 rounded-full bg-emerald-500"
                      style={{ width: `${width}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
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

          <div className="flex flex-1 flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center lg:justify-end">
            <input
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Search leads..."
              className="w-full sm:w-60 rounded-lg border border-slate-200 px-3 py-2 text-sm"
            />
            <select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value as LeadStatus | 'all')}
              className="w-full sm:w-44 rounded-lg border border-slate-200 px-3 py-2 text-sm"
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
              className="w-full sm:w-44 rounded-lg border border-slate-200 px-3 py-2 text-sm"
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
              className="w-full sm:w-44 rounded-lg border border-slate-200 px-3 py-2 text-sm"
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
              className="w-full sm:w-auto sm:ml-auto lg:ml-0 px-4 py-2 rounded-lg bg-indigo-600 text-white text-sm font-semibold shadow-sm hover:bg-indigo-700"
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
