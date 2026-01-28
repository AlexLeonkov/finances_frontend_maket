import { useEffect, useState } from 'react';

import type { Lead } from '../types';
import {
  LEAD_CATEGORY_LABELS,
  LEAD_PRIORITY_LABELS,
  LEAD_SOURCE_LABELS,
  LEAD_STATUS_LABELS,
} from '../constants';

type LeadDrawerProps = {
  lead: Lead | null;
  isOpen: boolean;
  isNew: boolean;
  onClose: () => void;
  onSave: (lead: Lead) => void;
  onDelete: (id: string) => void;
};

const toDateInputValue = (value?: string | null) =>
  value ? value.slice(0, 10) : '';

export const LeadDrawer = ({
  lead,
  isOpen,
  isNew,
  onClose,
  onSave,
  onDelete,
}: LeadDrawerProps) => {
  const [draft, setDraft] = useState<Lead | null>(lead);
  const [tagsInput, setTagsInput] = useState('');

  useEffect(() => {
    setDraft(lead);
    setTagsInput(lead?.tags.join(', ') ?? '');
  }, [lead]);

  if (!isOpen || !draft) {
    return null;
  }

  const handleChange = <K extends keyof Lead>(key: K, value: Lead[K]) => {
    setDraft((prev) => (prev ? { ...prev, [key]: value } : prev));
  };

  const handleSave = () => {
    const normalizedTags = tagsInput
      .split(',')
      .map((tag) => tag.trim())
      .filter(Boolean);

    onSave({
      ...draft,
      phone: draft.phone?.trim() || null,
      email: draft.email?.trim() || null,
      assignee: draft.assignee?.trim() || null,
      lastContactAt: draft.lastContactAt || null,
      tags: normalizedTags,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex">
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />
      <div className="relative ml-auto w-full max-w-xl h-full bg-white shadow-xl overflow-y-auto">
        <div className="p-6 border-b border-slate-200 flex items-center justify-between">
          <div>
            <p className="text-xs uppercase text-slate-400 font-semibold tracking-wide">
              {isNew ? 'New Lead' : 'Edit Lead'}
            </p>
            <h2 className="text-xl font-semibold text-slate-800">
              {draft.customerName || 'Unnamed Lead'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="px-3 py-1.5 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-100"
          >
            Close
          </button>
        </div>

        <div className="p-6 space-y-5">
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
              Status
              <select
                className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-slate-800"
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
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <label className="text-sm font-medium text-slate-600">
              Estimated Value (EUR)
              <input
                type="number"
                className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-slate-800"
                value={draft.estimatedValueEUR}
                onChange={(event) =>
                  handleChange('estimatedValueEUR', Number(event.target.value))
                }
              />
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

        <div className="p-6 border-t border-slate-200 flex items-center justify-between">
          {!isNew && (
            <button
              onClick={() => onDelete(draft.id)}
              className="text-sm font-semibold text-red-600 hover:text-red-700"
            >
              Delete Lead
            </button>
          )}
          <div className="ml-auto flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-100"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-2 rounded-lg bg-indigo-600 text-white text-sm font-semibold shadow-sm hover:bg-indigo-700"
            >
              Save Lead
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
