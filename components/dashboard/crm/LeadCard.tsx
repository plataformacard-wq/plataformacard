"use client";

import React from "react";
import { Draggable } from "@hello-pangea/dnd";
import { User, Calendar, ShoppingBag } from "lucide-react";

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

interface LeadCardProps {
  lead: Lead;
  index: number;
  onClick: () => void;
}

export default function LeadCard({ lead, index, onClick }: LeadCardProps) {
  // Pegar data formatada amigável
  const dateFormatted = new Date(lead.created_at).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "short",
  });

  return (
    <Draggable draggableId={lead.id} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          onClick={onClick}
          className={`p-4 bg-[var(--dash-surface)] border rounded-[27px] hover:border-primary/40 hover:shadow-lg transition-all cursor-grab active:cursor-grabbing select-none space-y-3 group ${
            snapshot.isDragging
              ? "border-primary/50 shadow-2xl bg-[var(--dash-hover-bg)] rotate-2 scale-[1.02]"
              : "border-[var(--dash-border)]"
          }`}
        >
          {/* Tag de Data / Identificação */}
          <div className="flex items-center justify-between">
            <span className="text-[9px] font-black uppercase tracking-wider text-[var(--dash-text-muted)] bg-[var(--dash-hover-bg)] px-2 py-0.5 rounded-md border border-[var(--dash-border)]">
              {lead.id.slice(0, 8)}
            </span>
            <span className="text-[9px] font-bold text-[var(--dash-text-muted)] flex items-center gap-1">
              <Calendar size={10} />
              {dateFormatted}
            </span>
          </div>

          {/* Nome do Produto / Serviço */}
          <div className="space-y-1">
            <h4 className="text-sm font-bold text-[var(--dash-text-primary)] group-hover:text-primary transition-colors flex items-start gap-1.5 leading-tight">
              <ShoppingBag size={14} className="shrink-0 mt-0.5 text-primary" />
              <span className="line-clamp-2">{lead.product_name || "Interesse de Compra"}</span>
            </h4>
          </div>

          {/* Informações de Cliente e Vendedor */}
          <div className="pt-2 border-t border-[var(--dash-border)] border-dashed space-y-1.5">
            {lead.client_name ? (
              <div className="flex items-center gap-1.5 text-xs font-bold text-[var(--dash-text-primary)]">
                <User size={12} className="text-[var(--dash-text-muted)]" />
                <span className="truncate">{lead.client_name}</span>
              </div>
            ) : (
              <div className="flex items-center gap-1.5 text-xs text-[var(--dash-text-muted)] font-medium italic">
                <User size={12} />
                <span>Cliente sem identificação</span>
              </div>
            )}
            <div className="text-[10px] font-bold text-[var(--dash-text-muted)] flex items-center gap-1">
              <div className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              <span>Vendedor: {lead.seller_name || "Central"}</span>
            </div>
          </div>
        </div>
      )}
    </Draggable>
  );
}
