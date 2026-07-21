"use client";

import React from "react";
import { DragDropContext, Droppable, DropResult } from "@hello-pangea/dnd";
import LeadCard from "./LeadCard";

interface Lead {
  id: string;
  product_name: string | null;
  seller_name: string | null;
  client_name: string | null;
  client_whatsapp: string | null;
  notes: string | null;
  crm_status: "new_lead" | "open" | "negotiating" | "closed";
  created_at: string;
}

interface KanbanBoardProps {
  leads: Lead[];
  onDragEnd: (result: DropResult) => void;
  onLeadClick: (lead: Lead) => void;
}

// Definição das colunas
const COLUMNS: {
  id: Lead["crm_status"];
  title: string;
  colorClass: string;
  bgClass: string;
}[] = [
  {
    id: "new_lead",
    title: "Novos Leads",
    colorClass: "text-blue-500 border-blue-500/20",
    bgClass: "bg-blue-500/[0.02]",
  },
  {
    id: "open",
    title: "Conversa Aberta",
    colorClass: "text-purple-500 border-purple-500/20",
    bgClass: "bg-purple-500/[0.02]",
  },
  {
    id: "negotiating",
    title: "Em Negociação",
    colorClass: "text-amber-500 border-amber-500/20",
    bgClass: "bg-amber-500/[0.02]",
  },
  {
    id: "closed",
    title: "Negócio Fechado",
    colorClass: "text-emerald-500 border-emerald-500/20",
    bgClass: "bg-emerald-500/[0.02]",
  },
];

export default function KanbanBoard({ leads, onDragEnd, onLeadClick }: KanbanBoardProps) {
  // Agrupa os leads por status
  const getLeadsByStatus = (status: Lead["crm_status"]) => {
    return leads.filter((l) => l.crm_status === status);
  };

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-start">
        {COLUMNS.map((col) => {
          const colLeads = getLeadsByStatus(col.id);

          return (
            <div
              key={col.id}
              className={`flex flex-col rounded-[27px] border border-[var(--dash-border)] p-4 min-h-[500px] ${col.bgClass}`}
            >
              {/* Header da Coluna */}
              <div className="flex items-center justify-between pb-4 mb-4 border-b border-[var(--dash-border)]">
                <div className="flex items-center gap-2">
                  <div className={`h-2.5 w-2.5 rounded-full ${col.id === "new_lead" ? "bg-blue-500" : col.id === "open" ? "bg-purple-500" : col.id === "negotiating" ? "bg-amber-500" : "bg-emerald-500"}`} />
                  <h3 className="font-black text-sm uppercase tracking-wider text-[var(--dash-text-primary)]">
                    {col.title}
                  </h3>
                </div>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-[var(--dash-hover-bg)] border border-[var(--dash-border)] text-[var(--dash-text-secondary)]">
                  {colLeads.length}
                </span>
              </div>

              {/* Área Droppable */}
              <Droppable droppableId={col.id}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className={`flex-1 flex flex-col gap-3 min-h-[400px] rounded-[27px] transition-colors ${
                      snapshot.isDraggingOver
                        ? "bg-[var(--dash-hover-bg)]/30 border border-dashed border-primary/20 p-2"
                        : "p-1"
                    }`}
                  >
                    {colLeads.length > 0 ? (
                      colLeads.map((lead, index) => (
                        <LeadCard
                          key={lead.id}
                          lead={lead}
                          index={index}
                          onClick={() => onLeadClick(lead)}
                        />
                      ))
                    ) : (
                      <div className="flex flex-col items-center justify-center flex-1 py-12 text-center text-[var(--dash-text-muted)] italic text-xs font-medium border border-dashed border-[var(--dash-border)] rounded-[27px]">
                        Nenhum lead nesta etapa
                      </div>
                    )}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </div>
          );
        })}
      </div>
    </DragDropContext>
  );
}
