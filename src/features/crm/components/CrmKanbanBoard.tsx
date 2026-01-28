import { DndContext, type DragEndEvent, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';

import type { Lead, LeadStatus } from '../types';
import { LEAD_STATUS_ORDER } from '../constants';
import { CrmKanbanColumn } from './CrmKanbanColumn';

type CrmKanbanBoardProps = {
  leads: Lead[];
  onMove: (id: string, status: LeadStatus) => void;
  onOpen: (lead: Lead) => void;
};

export const CrmKanbanBoard = ({ leads, onMove, onOpen }: CrmKanbanBoardProps) => {
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }));

  const handleDragEnd = (event: DragEndEvent) => {
    const leadId = event.active.id as string;
    const overId = event.over?.id as LeadStatus | undefined;
    if (overId && leadId) {
      const lead = leads.find((item) => item.id === leadId);
      if (lead && lead.status !== overId) {
        onMove(leadId, overId);
      }
    }
  };

  return (
    <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
      <div className="flex gap-4 overflow-x-auto pb-4">
        {LEAD_STATUS_ORDER.map((status) => (
          <CrmKanbanColumn
            key={status}
            status={status}
            leads={leads.filter((lead) => lead.status === status)}
            onOpen={onOpen}
          />
        ))}
      </div>
    </DndContext>
  );
};
