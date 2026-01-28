import {
  closestCenter,
  DndContext,
  DragOverlay,
  type DragEndEvent,
  type DragOverEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { arrayMove } from '@dnd-kit/sortable';
import { useEffect, useMemo, useRef, useState } from 'react';

import type { Lead, LeadStatus } from '../types';
import { LEAD_CATEGORY_LABELS, LEAD_PRIORITY_LABELS, LEAD_STATUS_ORDER } from '../constants';
import { CrmKanbanColumn } from './CrmKanbanColumn';

type CrmKanbanBoardProps = {
  leads: Lead[];
  onMove: (id: string, status: LeadStatus) => void;
  onOpen: (lead: Lead) => void;
};

export const CrmKanbanBoard = ({ leads, onMove, onOpen }: CrmKanbanBoardProps) => {
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 4 } }));
  const [activeId, setActiveId] = useState<string | null>(null);
  const [activeOrigin, setActiveOrigin] = useState<LeadStatus | null>(null);
  const lastOverId = useRef<string | null>(null);
  const [columns, setColumns] = useState<Record<LeadStatus, string[]>>(() => {
    const initial: Record<LeadStatus, string[]> = {
      new: [],
      contacted: [],
      site_visit: [],
      offer_sent: [],
      negotiation: [],
      won: [],
      lost: [],
    };
    leads.forEach((lead) => {
      initial[lead.status].push(lead.id);
    });
    return initial;
  });

  const leadsById = useMemo(
    () => Object.fromEntries(leads.map((lead) => [lead.id, lead])),
    [leads]
  );

  const getContainerId = (id: string | null | undefined): LeadStatus | null => {
    if (!id) {
      return null;
    }
    if (LEAD_STATUS_ORDER.includes(id as LeadStatus)) {
      return id as LeadStatus;
    }
    const found = LEAD_STATUS_ORDER.find((status) => columns[status]?.includes(id));
    return found ?? null;
  };

  useEffect(() => {
    setColumns((prev) => {
      const next: Record<LeadStatus, string[]> = {
        new: [],
        contacted: [],
        site_visit: [],
        offer_sent: [],
        negotiation: [],
        won: [],
        lost: [],
      };
      const byStatus: Record<LeadStatus, string[]> = {
        new: [],
        contacted: [],
        site_visit: [],
        offer_sent: [],
        negotiation: [],
        won: [],
        lost: [],
      };
      leads.forEach((lead) => {
        byStatus[lead.status].push(lead.id);
      });
      LEAD_STATUS_ORDER.forEach((status) => {
        const prevIds = prev[status] ?? [];
        const currentIds = byStatus[status] ?? [];
        const currentSet = new Set(currentIds);
        const preserved = prevIds.filter((id) => currentSet.has(id));
        const remaining = currentIds.filter((id) => !preserved.includes(id));
        next[status] = [...preserved, ...remaining];
      });
      return next;
    });
  }, [leads]);

  const handleDragOver = (event: DragOverEvent) => {
    const over = event.over?.id ? String(event.over.id) : null;
    if (over) {
      lastOverId.current = over;
    }

    const activeContainer = getContainerId(String(event.active.id));
    const overContainer = getContainerId(over);
    if (!activeContainer || !overContainer || activeContainer === overContainer) {
      return;
    }

    setColumns((prev) => {
      const activeItems = prev[activeContainer];
      const overItems = prev[overContainer];
      const activeIndex = activeItems.indexOf(String(event.active.id));
      if (activeIndex === -1) {
        return prev;
      }

      const overIndex = over ? overItems.indexOf(over) : -1;
      const insertAt = overIndex >= 0 ? overIndex : overItems.length;
      const nextActive = activeItems.filter((id) => id !== String(event.active.id));
      const nextOver = [
        ...overItems.slice(0, insertAt),
        String(event.active.id),
        ...overItems.slice(insertAt),
      ];

      return {
        ...prev,
        [activeContainer]: nextActive,
        [overContainer]: nextOver,
      };
    });
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const leadId = String(event.active.id);
    const over = event.over?.id ? String(event.over.id) : lastOverId.current;
    const overContainer = getContainerId(over);

    if (activeOrigin && overContainer) {
      if (activeOrigin === overContainer && over) {
        const items = columns[activeOrigin];
        const oldIndex = items.indexOf(leadId);
        const newIndex = items.indexOf(over);
        if (oldIndex !== -1 && newIndex !== -1 && oldIndex !== newIndex) {
          setColumns((prev) => ({
            ...prev,
            [activeOrigin]: arrayMove(prev[activeOrigin], oldIndex, newIndex),
          }));
        }
      } else if (activeOrigin !== overContainer) {
        onMove(leadId, overContainer);
      }
    }

    setActiveId(null);
    setActiveOrigin(null);
    lastOverId.current = null;
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={(event) => {
        const id = String(event.active.id);
        setActiveId(id);
        setActiveOrigin(leadsById[id]?.status ?? null);
      }}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
      onDragCancel={() => {
        setActiveId(null);
        setActiveOrigin(null);
      }}
    >
      <div className="flex gap-4 overflow-x-auto pb-4">
        {LEAD_STATUS_ORDER.map((status) => (
          <CrmKanbanColumn
            key={status}
            status={status}
            itemIds={columns[status] ?? []}
            leadsById={leadsById}
            onOpen={onOpen}
          />
        ))}
      </div>
      <DragOverlay>
        {activeId && leadsById[activeId] ? (
          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-lg w-[240px]">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-semibold text-slate-800">
                  {leadsById[activeId].customerName}
                </p>
                <p className="text-xs text-slate-500">
                  {leadsById[activeId].companyName
                    ? `${leadsById[activeId].companyName} • ${leadsById[activeId].address}`
                    : leadsById[activeId].address}
                </p>
              </div>
              <span className="text-xs font-semibold text-indigo-600">
                €{leadsById[activeId].estimatedValueEUR.toLocaleString('de-DE')}
              </span>
            </div>
            <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-slate-500">
              <span className="rounded-full bg-slate-100 px-2 py-0.5">
                {LEAD_CATEGORY_LABELS[leadsById[activeId].category]}
              </span>
              <span className="rounded-full bg-slate-100 px-2 py-0.5">
                {LEAD_PRIORITY_LABELS[leadsById[activeId].priority]}
              </span>
              {typeof leadsById[activeId].dealProbability === 'number' && (
                <span className="rounded-full bg-amber-50 px-2 py-0.5 text-amber-700">
                  {leadsById[activeId].dealProbability}% prob
                </span>
              )}
            </div>
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
};
