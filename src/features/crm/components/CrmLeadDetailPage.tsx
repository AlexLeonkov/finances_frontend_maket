import { useEffect, useMemo, useState } from 'react';

import type { Lead, LeadActivityType, LeadTaskPriority, LeadTaskStatus } from '../types';
import {
  LEAD_CATEGORY_LABELS,
  LEAD_FINANCING_LABELS,
  LEAD_OFFER_STATUS_LABELS,
  LEAD_PRIORITY_LABELS,
  LEAD_PROPERTY_TYPE_LABELS,
  LEAD_SOURCE_LABELS,
  LEAD_STATUS_LABELS,
} from '../constants';
import { formatEUR } from '../../../shared/lib/format';

type CrmLeadDetailPageProps = {
  lead: Lead | null;
  isNew: boolean;
  onBack: () => void;
  onSave: (lead: Lead) => void;
  onDelete: (id: string) => void;
};

const toDateInputValue = (value?: string | null) =>
  value ? value.slice(0, 10) : '';

const toNumberValue = (value?: number | null) =>
  typeof value === 'number' && !Number.isNaN(value) ? value : '';

const formatDate = (value?: string | null) =>
  value ? new Date(value).toLocaleDateString('de-DE') : '—';

export const CrmLeadDetailPage = ({
  lead,
  isNew,
  onBack,
  onSave,
  onDelete,
}: CrmLeadDetailPageProps) => {
  const [draft, setDraft] = useState<Lead | null>(lead);
  const [tagsInput, setTagsInput] = useState('');
  const [newMessage, setNewMessage] = useState('');
  const [newActivityType, setNewActivityType] = useState<LeadActivityType>('note');
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskPriority, setNewTaskPriority] = useState<LeadTaskPriority>('medium');
  const [newTaskDueDate, setNewTaskDueDate] = useState('');

  useEffect(() => {
    setDraft(lead);
    setTagsInput(lead?.tags.join(', ') ?? '');
    setNewMessage('');
    setNewActivityType('note');
    setNewTaskTitle('');
    setNewTaskPriority('medium');
    setNewTaskDueDate('');
  }, [lead]);

  const sortedActivities = useMemo(
    () =>
      [...(draft?.activities ?? [])].sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      ),
    [draft?.activities]
  );

  if (!draft) {
    return (
      <div className="space-y-6">
        <button
          onClick={onBack}
          className="text-sm font-semibold text-slate-500 hover:text-slate-700"
        >
          ← Back to CRM
        </button>
        <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-sm text-slate-400">
          Lead not found.
        </div>
      </div>
    );
  }

  const handleChange = <K extends keyof Lead>(key: K, value: Lead[K]) => {
    setDraft((prev) => (prev ? { ...prev, [key]: value } : prev));
  };

  const addActivity = (type: LeadActivityType, message: string) => {
    const trimmed = message.trim();
    if (!trimmed) {
      return;
    }
    const entry = {
      id: `act-${draft.id}-${Math.random().toString(16).slice(2)}`,
      type,
      message: trimmed,
      createdAt: new Date().toISOString(),
      author: draft.assignee ?? 'Sales',
    };
    handleChange('activities', [...(draft.activities ?? []), entry]);
    setNewMessage('');
  };

  const addTask = () => {
    const trimmed = newTaskTitle.trim();
    if (!trimmed) {
      return;
    }
    const entry = {
      id: `task-${draft.id}-${Math.random().toString(16).slice(2)}`,
      title: trimmed,
      dueDate: newTaskDueDate ? new Date(newTaskDueDate).toISOString() : null,
      status: 'open' as const,
      priority: newTaskPriority,
      owner: draft.assignee ?? null,
    };
    handleChange('tasks', [...(draft.tasks ?? []), entry]);
    setNewTaskTitle('');
    setNewTaskPriority('medium');
    setNewTaskDueDate('');
  };

  const toggleTaskStatus = (taskId: string) => {
    const nextTasks =
      draft.tasks?.map((task) => {
        if (task.id !== taskId) {
          return task;
        }
        const nextStatus: LeadTaskStatus = task.status === 'done' ? 'open' : 'done';
        return { ...task, status: nextStatus };
      }) ?? [];
    handleChange('tasks', nextTasks);
  };

  const handleFilesSelected = (files: FileList | null) => {
    if (!files || files.length === 0) {
      return;
    }
    const mapped = Array.from(files).map((file) => ({
      id: `file-${draft.id}-${Math.random().toString(16).slice(2)}`,
      name: file.name,
      size: file.size,
      uploadedAt: new Date().toISOString(),
    }));
    handleChange('files', [...(draft.files ?? []), ...mapped]);
  };

  const requestOffer = () => {
    const now = new Date().toISOString();
    handleChange('offerStatus', 'requested');
    handleChange('lastOfferAt', now);
    handleChange('activities', [
      ...(draft.activities ?? []),
      {
        id: `act-${draft.id}-${Math.random().toString(16).slice(2)}`,
        type: 'offer',
        message: 'Offer requested (Lexware)',
        createdAt: now,
        author: draft.assignee ?? 'Sales',
      },
    ]);
  };

  const handleSave = () => {
    const normalizedTags = tagsInput
      .split(',')
      .map((tag) => tag.trim())
      .filter(Boolean);

    onSave({
      ...draft,
      companyName: draft.companyName?.trim() || null,
      jobTitle: draft.jobTitle?.trim() || null,
      website: draft.website?.trim() || null,
      phone: draft.phone?.trim() || null,
      email: draft.email?.trim() || null,
      assignee: draft.assignee?.trim() || null,
      lastContactAt: draft.lastContactAt || null,
      nextStep: draft.nextStep?.trim() || null,
      activities: draft.activities ?? [],
      tasks: draft.tasks ?? [],
      files: draft.files ?? [],
      tags: normalizedTags,
    });
  };

  return (
    <div className="space-y-6">
      <button
        onClick={onBack}
        className="text-sm font-semibold text-slate-500 hover:text-slate-700"
      >
        ← Back to CRM
      </button>

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-start sm:justify-between">
          <div>
            <p className="text-xs uppercase text-slate-400 font-semibold tracking-wide">
              {isNew ? 'New Lead' : 'Lead Profile'}
            </p>
            <h2 className="text-2xl font-semibold text-slate-800">
              {draft.customerName || 'Unnamed Lead'}
            </h2>
            <p className="text-sm text-slate-500">
              {draft.companyName ?? '—'}
              {draft.jobTitle ? ` · ${draft.jobTitle}` : ''}
            </p>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
            <select
              className="w-full sm:w-auto rounded-lg border border-slate-200 px-3 py-2 text-sm"
              value={draft.status}
              onChange={(event) =>
                handleChange('status', event.target.value as Lead['status'])
              }
            >
              {Object.entries(LEAD_STATUS_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
            <button
              onClick={handleSave}
              className="w-full sm:w-auto px-4 py-2 rounded-lg bg-indigo-600 text-white text-sm font-semibold shadow-sm hover:bg-indigo-700"
            >
              Save Lead
            </button>
            {!isNew && (
              <button
                onClick={() => onDelete(draft.id)}
                className="w-full sm:w-auto px-4 py-2 rounded-lg text-sm font-semibold text-red-600 hover:bg-red-50"
              >
                Delete
              </button>
            )}
          </div>
        </div>

        <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="rounded-xl border border-slate-100 bg-slate-50/60 p-4">
            <p className="text-xs text-slate-400 uppercase">Deal Value</p>
            <p className="text-lg font-semibold text-slate-800">
              {formatEUR(draft.estimatedValueEUR)}
            </p>
            <p className="text-xs text-slate-400">Expected close {formatDate(draft.expectedCloseDate)}</p>
          </div>
          <div className="rounded-xl border border-slate-100 bg-slate-50/60 p-4">
            <p className="text-xs text-slate-400 uppercase">Health</p>
            <p className="text-lg font-semibold text-slate-800">
              {draft.leadScore ?? '—'} score · {draft.dealProbability ?? '—'}%
            </p>
            <p className="text-xs text-slate-400">
              Next contact {formatDate(draft.nextContactAt)}
            </p>
          </div>
          <div className="rounded-xl border border-slate-100 bg-slate-50/60 p-4">
            <p className="text-xs text-slate-400 uppercase">Offer</p>
            <p className="text-lg font-semibold text-slate-800">
              {LEAD_OFFER_STATUS_LABELS[draft.offerStatus ?? 'none']}
            </p>
            <p className="text-xs text-slate-400">
              Last sent {formatDate(draft.lastOfferAt)}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[2fr_1fr] gap-6">
        <div className="space-y-6">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-5">
            <div className="grid grid-cols-1 gap-4">
              <label className="text-sm font-medium text-slate-600">
                Customer Name
                <input
                  className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-slate-800"
                  value={draft.customerName}
                  onChange={(event) =>
                    handleChange('customerName', event.target.value)
                  }
                />
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <label className="text-sm font-medium text-slate-600">
                  Company
                  <input
                    className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-slate-800"
                    value={draft.companyName ?? ''}
                    onChange={(event) =>
                      handleChange('companyName', event.target.value)
                    }
                  />
                </label>
                <label className="text-sm font-medium text-slate-600">
                  Job Title
                  <input
                    className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-slate-800"
                    value={draft.jobTitle ?? ''}
                    onChange={(event) =>
                      handleChange('jobTitle', event.target.value)
                    }
                  />
                </label>
              </div>
              <label className="text-sm font-medium text-slate-600">
                Website
                <input
                  className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-slate-800"
                  value={draft.website ?? ''}
                  onChange={(event) => handleChange('website', event.target.value)}
                />
              </label>
              <label className="text-sm font-medium text-slate-600">
                Address
                <input
                  className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-slate-800"
                  value={draft.address}
                  onChange={(event) => handleChange('address', event.target.value)}
                />
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <label className="text-sm font-medium text-slate-600">
                  Phone
                  <input
                    className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-slate-800"
                    value={draft.phone ?? ''}
                    onChange={(event) =>
                      handleChange('phone', event.target.value)
                    }
                  />
                </label>
                <label className="text-sm font-medium text-slate-600">
                  Email
                  <input
                    className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-slate-800"
                    value={draft.email ?? ''}
                    onChange={(event) =>
                      handleChange('email', event.target.value)
                    }
                  />
                </label>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <label className="text-sm font-medium text-slate-600">
                Source
                <select
                  className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-slate-800"
                  value={draft.source}
                  onChange={(event) =>
                    handleChange('source', event.target.value as Lead['source'])
                  }
                >
                  {Object.entries(LEAD_SOURCE_LABELS).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </label>
              <label className="text-sm font-medium text-slate-600">
                Category
                <select
                  className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-slate-800"
                  value={draft.category}
                  onChange={(event) =>
                    handleChange('category', event.target.value as Lead['category'])
                  }
                >
                  {Object.entries(LEAD_CATEGORY_LABELS).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </label>
              <label className="text-sm font-medium text-slate-600">
                Priority
                <select
                  className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-slate-800"
                  value={draft.priority}
                  onChange={(event) =>
                    handleChange('priority', event.target.value as Lead['priority'])
                  }
                >
                  {Object.entries(LEAD_PRIORITY_LABELS).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </label>
              <label className="text-sm font-medium text-slate-600">
                Assignee
                <input
                  className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-slate-800"
                  value={draft.assignee ?? ''}
                  onChange={(event) =>
                    handleChange('assignee', event.target.value)
                  }
                />
              </label>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <label className="text-sm font-medium text-slate-600">
                Estimated Value (EUR)
                <input
                  type="number"
                  min={0}
                  className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-slate-800"
                  value={draft.estimatedValueEUR}
                  onChange={(event) =>
                    handleChange('estimatedValueEUR', Number(event.target.value))
                  }
                />
              </label>
              <label className="text-sm font-medium text-slate-600">
                Financing
                <select
                  className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-slate-800"
                  value={draft.financing ?? 'unknown'}
                  onChange={(event) =>
                    handleChange('financing', event.target.value as Lead['financing'])
                  }
                >
                  {Object.entries(LEAD_FINANCING_LABELS).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <label className="text-sm font-medium text-slate-600">
                Lead Score
                <input
                  type="number"
                  min={0}
                  max={100}
                  className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-slate-800"
                  value={toNumberValue(draft.leadScore)}
                  onChange={(event) =>
                    handleChange(
                      'leadScore',
                      event.target.value === '' ? null : Number(event.target.value)
                    )
                  }
                />
              </label>
              <label className="text-sm font-medium text-slate-600">
                Deal Probability (%)
                <input
                  type="number"
                  min={0}
                  max={100}
                  className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-slate-800"
                  value={toNumberValue(draft.dealProbability)}
                  onChange={(event) =>
                    handleChange(
                      'dealProbability',
                      event.target.value === '' ? null : Number(event.target.value)
                    )
                  }
                />
              </label>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <label className="text-sm font-medium text-slate-600">
                Expected Close
                <input
                  type="date"
                  className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-slate-800"
                  value={toDateInputValue(draft.expectedCloseDate)}
                  onChange={(event) =>
                    handleChange(
                      'expectedCloseDate',
                      event.target.value
                        ? new Date(event.target.value).toISOString()
                        : null
                    )
                  }
                />
              </label>
              <label className="text-sm font-medium text-slate-600">
                Next Contact
                <input
                  type="date"
                  className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-slate-800"
                  value={toDateInputValue(draft.nextContactAt)}
                  onChange={(event) =>
                    handleChange(
                      'nextContactAt',
                      event.target.value
                        ? new Date(event.target.value).toISOString()
                        : null
                    )
                  }
                />
              </label>
            </div>

            <label className="text-sm font-medium text-slate-600 block">
              Next Step
              <input
                className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-slate-800"
                value={draft.nextStep ?? ''}
                onChange={(event) => handleChange('nextStep', event.target.value)}
              />
            </label>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <label className="text-sm font-medium text-slate-600">
                Property Type
                <select
                  className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-slate-800"
                  value={draft.propertyType ?? 'single_family'}
                  onChange={(event) =>
                    handleChange('propertyType', event.target.value as Lead['propertyType'])
                  }
                >
                  {Object.entries(LEAD_PROPERTY_TYPE_LABELS).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </label>
              <label className="text-sm font-medium text-slate-600">
                System Size (kWp)
                <input
                  type="number"
                  min={0}
                  className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-slate-800"
                  value={toNumberValue(draft.systemSizeKwp)}
                  onChange={(event) =>
                    handleChange(
                      'systemSizeKwp',
                      event.target.value === '' ? null : Number(event.target.value)
                    )
                  }
                />
              </label>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <label className="text-sm font-medium text-slate-600">
                Created At
                <input
                  type="date"
                  className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-slate-800"
                  value={toDateInputValue(draft.createdAt)}
                  onChange={(event) =>
                    handleChange(
                      'createdAt',
                      event.target.value
                        ? new Date(event.target.value).toISOString()
                        : draft.createdAt
                    )
                  }
                />
              </label>
              <label className="text-sm font-medium text-slate-600">
                Last Contact
                <input
                  type="date"
                  className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-slate-800"
                  value={toDateInputValue(draft.lastContactAt)}
                  onChange={(event) =>
                    handleChange(
                      'lastContactAt',
                      event.target.value
                        ? new Date(event.target.value).toISOString()
                        : null
                    )
                  }
                />
              </label>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-semibold text-slate-700">Pipeline & Offers</p>
                <p className="text-xs text-slate-400">
                  Status: {LEAD_OFFER_STATUS_LABELS[draft.offerStatus ?? 'none']}
                  {draft.lastOfferAt ? ` · Last: ${toDateInputValue(draft.lastOfferAt)}` : ''}
                </p>
              </div>
              <button
                onClick={requestOffer}
                className="px-3 py-2 rounded-lg bg-indigo-600 text-white text-xs font-semibold shadow-sm hover:bg-indigo-700"
              >
                Generate offer (Lexware)
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <label className="text-sm font-medium text-slate-600">
                Offer Status
                <select
                  className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-slate-800"
                  value={draft.offerStatus ?? 'none'}
                  onChange={(event) =>
                    handleChange('offerStatus', event.target.value as Lead['offerStatus'])
                  }
                >
                  {Object.entries(LEAD_OFFER_STATUS_LABELS).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </label>
              <label className="text-sm font-medium text-slate-600">
                Last Offer Sent
                <input
                  type="date"
                  className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-slate-800"
                  value={toDateInputValue(draft.lastOfferAt)}
                  onChange={(event) =>
                    handleChange(
                      'lastOfferAt',
                      event.target.value ? new Date(event.target.value).toISOString() : null
                    )
                  }
                />
              </label>
            </div>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-slate-700">Activity & Chat</p>
                <span className="text-xs text-slate-400">
                  {sortedActivities.length} entries
                </span>
              </div>
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                <select
                  className="w-full sm:w-auto rounded-lg border border-slate-200 px-2 py-1 text-xs"
                  value={newActivityType}
                  onChange={(event) =>
                    setNewActivityType(event.target.value as LeadActivityType)
                  }
                >
                  <option value="note">Note</option>
                  <option value="call">Call</option>
                  <option value="email">Email</option>
                  <option value="meeting">Meeting</option>
                </select>
                <input
                  className="w-full flex-1 rounded-lg border border-slate-200 px-3 py-2 text-xs"
                  placeholder="Write a chat message or call summary..."
                  value={newMessage}
                  onChange={(event) => setNewMessage(event.target.value)}
                />
                <button
                  onClick={() => addActivity(newActivityType, newMessage)}
                  className="w-full sm:w-auto px-3 py-2 rounded-lg bg-slate-900 text-white text-xs font-semibold"
                >
                  Add
                </button>
              </div>
              <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                {sortedActivities.map((activity) => (
                  <div key={activity.id} className="rounded-lg border border-slate-100 p-3">
                    <p className="text-xs text-slate-500">
                      {activity.type.toUpperCase()} · {formatDate(activity.createdAt)} ·{' '}
                      {activity.author ?? 'Sales'}
                    </p>
                    <p className="text-sm text-slate-700">{activity.message}</p>
                  </div>
                ))}
                {sortedActivities.length === 0 && (
                  <p className="text-xs text-slate-400">No activity yet.</p>
                )}
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-slate-700">Tasks</p>
                <span className="text-xs text-slate-400">
                  {draft.tasks?.length ?? 0} tasks
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-[1fr_140px_120px] gap-2">
                <input
                  className="rounded-lg border border-slate-200 px-3 py-2 text-xs"
                  placeholder="Add task..."
                  value={newTaskTitle}
                  onChange={(event) => setNewTaskTitle(event.target.value)}
                />
                <input
                  type="date"
                  className="rounded-lg border border-slate-200 px-3 py-2 text-xs"
                  value={newTaskDueDate}
                  onChange={(event) => setNewTaskDueDate(event.target.value)}
                />
                <select
                  className="rounded-lg border border-slate-200 px-2 py-2 text-xs"
                  value={newTaskPriority}
                  onChange={(event) =>
                    setNewTaskPriority(event.target.value as LeadTaskPriority)
                  }
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>
              <button
                onClick={addTask}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50"
              >
                Add task
              </button>
              <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                {(draft.tasks ?? []).map((task) => (
                  <div
                    key={task.id}
                    className="flex flex-col gap-2 rounded-lg border border-slate-100 px-3 py-2 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div>
                      <p
                        className={`text-sm ${
                          task.status === 'done' ? 'line-through text-slate-400' : 'text-slate-700'
                        }`}
                      >
                        {task.title}
                      </p>
                      <p className="text-xs text-slate-400">
                        {task.dueDate ? `Due ${formatDate(task.dueDate)}` : 'No due date'} ·{' '}
                        {task.priority}
                      </p>
                    </div>
                    <button
                      onClick={() => toggleTaskStatus(task.id)}
                      className="text-xs font-semibold text-indigo-600 hover:text-indigo-700"
                    >
                      {task.status === 'done' ? 'Reopen' : 'Complete'}
                    </button>
                  </div>
                ))}
                {(draft.tasks ?? []).length === 0 && (
                  <p className="text-xs text-slate-400">No tasks yet.</p>
                )}
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
            <p className="text-sm font-semibold text-slate-700">Files & Photos</p>
            <input
              type="file"
              multiple
              className="block w-full text-xs text-slate-500"
              onChange={(event) => handleFilesSelected(event.target.files)}
            />
            <div className="space-y-2">
              {(draft.files ?? []).map((file) => (
                <div key={file.id} className="flex items-center justify-between text-sm">
                  <div>
                    <p className="text-slate-700">{file.name}</p>
                    <p className="text-xs text-slate-400">
                      {file.size ? `${Math.round(file.size / 1024)} KB` : '—'} ·{' '}
                      {formatDate(file.uploadedAt)}
                    </p>
                  </div>
                  <span className="text-xs text-slate-400">Stored</span>
                </div>
              ))}
              {(draft.files ?? []).length === 0 && (
                <p className="text-xs text-slate-400">No files uploaded.</p>
              )}
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-3">
            <label className="text-sm font-medium text-slate-600 block">
              Tags (comma-separated)
              <input
                className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-slate-800"
                value={tagsInput}
                onChange={(event) => setTagsInput(event.target.value)}
              />
            </label>
            <label className="text-sm font-medium text-slate-600 block">
              Notes
              <textarea
                rows={4}
                className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-slate-800"
                value={draft.notes}
                onChange={(event) => handleChange('notes', event.target.value)}
              />
            </label>
          </div>
        </div>

        <aside className="space-y-6">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-3">
            <p className="text-sm font-semibold text-slate-700">At a glance</p>
            <div className="space-y-2 text-sm text-slate-600">
              <div className="flex justify-between">
                <span>Category</span>
                <span className="font-medium text-slate-800">
                  {LEAD_CATEGORY_LABELS[draft.category]}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Priority</span>
                <span className="font-medium text-slate-800">
                  {LEAD_PRIORITY_LABELS[draft.priority]}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Property</span>
                <span className="font-medium text-slate-800">
                  {draft.propertyType
                    ? LEAD_PROPERTY_TYPE_LABELS[draft.propertyType]
                    : '—'}
                </span>
              </div>
              <div className="flex justify-between">
                <span>System Size</span>
                <span className="font-medium text-slate-800">
                  {draft.systemSizeKwp ? `${draft.systemSizeKwp} kWp` : '—'}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Financing</span>
                <span className="font-medium text-slate-800">
                  {draft.financing ? LEAD_FINANCING_LABELS[draft.financing] : '—'}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Created</span>
                <span className="font-medium text-slate-800">
                  {formatDate(draft.createdAt)}
                </span>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-3">
            <p className="text-sm font-semibold text-slate-700">Contacts</p>
            <div className="space-y-2 text-sm text-slate-600">
              <p>{draft.email ?? 'No email provided'}</p>
              <p>{draft.phone ?? 'No phone provided'}</p>
              <p>{draft.website ?? 'No website'}</p>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
};
