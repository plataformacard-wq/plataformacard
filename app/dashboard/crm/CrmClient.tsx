"use client";

import React, { useState } from "react";
import { DropResult } from "@hello-pangea/dnd";
import { Search, Users, Activity, CheckCircle, RefreshCw } from "lucide-react";
import KanbanBoard from "@/components/dashboard/crm/KanbanBoard";
import LeadDetailModal from "@/components/dashboard/crm/LeadDetailModal";
import { updateLeadStatus } from "@/app/dashboard/crm/actions";

interface Product {
  id: string;
  name: string;
  sku: string | null;
  stock_quantity: number | null;
}

interface Lead {
  id: string;
  product_name: string | null;
  seller_name: string | null;
  client_name: string | null;
  client_whatsapp: string | null;
  notes: string | null;
  crm_status: "new_lead" | "open" | "negotiating" | "closed";
  created_at: string;
  product_id?: string | null;
  stock_deducted?: number | null;
}

interface CrmClientProps {
  initialLeads: Lead[];
  products: Product[];
}

export default function CrmClient({ initialLeads, products }: CrmClientProps) {
  const [leads, setLeads] = useState<Lead[]>(initialLeads);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);

  // Filtro de pesquisa (nome do produto, vendedor ou cliente)
  const filteredLeads = leads.filter((lead) => {
    const query = searchQuery.toLowerCase();
    return (
      (lead.product_name && lead.product_name.toLowerCase().includes(query)) ||
      (lead.seller_name && lead.seller_name.toLowerCase().includes(query)) ||
      (lead.client_name && lead.client_name.toLowerCase().includes(query))
    );
  });

  // Métricas rápidas
  const totalLeads = leads.length;
  const activeNegotiations = leads.filter(
    (l) => l.crm_status === "open" || l.crm_status === "negotiating"
  ).length;
  const closedDeals = leads.filter((l) => l.crm_status === "closed").length;

  // Lógica de drag-and-drop
  const handleDragEnd = async (result: DropResult) => {
    const { destination, source, draggableId } = result;

    // Se saiu do grid ou voltou para a mesma posição
    if (!destination) return;
    if (destination.droppableId === source.droppableId && destination.index === source.index) {
      return;
    }

    const targetStatus = destination.droppableId as Lead["crm_status"];
    
    // Atualizar estado local imediatamente para feedback visual instantâneo
    const updatedLeads = leads.map((l) =>
      l.id === draggableId ? { ...l, crm_status: targetStatus } : l
    );
    setLeads(updatedLeads);

    try {
      const res = await updateLeadStatus(draggableId, targetStatus);
      if (res.success) {
        // Se arrastou para "Negócio Fechado", abre o modal automaticamente para baixar estoque
        if (targetStatus === "closed") {
          const movedLead = updatedLeads.find((l) => l.id === draggableId);
          if (movedLead) {
            setSelectedLead(movedLead);
          }
        }
      } else {
        alert("Erro ao salvar mudança de status: " + res.error);
        // Reverter em caso de falha
        setLeads(leads);
      }
    } catch (err) {
      alert("Falha de conexão.");
      setLeads(leads);
    }
  };

  const handleLeadUpdated = (updatedLead: Lead) => {
    setLeads((prev) => prev.map((l) => (l.id === updatedLead.id ? updatedLead : l)));
  };

  return (
    <div className="space-y-8 pb-20">
      {/* Header Premium do CRM */}
      <div className="relative overflow-hidden bg-[var(--dash-surface)] border border-[var(--dash-border)] rounded-[27px] p-6 md:p-8 shadow-sm group/header">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 blur-[100px] pointer-events-none opacity-50" />
        <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <h1 className="text-4xl font-black tracking-tight text-[var(--dash-text-primary)]">
              CRM de Leads
            </h1>
            <p className="text-[var(--dash-text-muted)] font-medium max-w-xl">
              Monitore o progresso dos leads iniciados pelos seus clientes e converta negociações em vendas.
            </p>
          </div>

          <div className="relative w-full md:w-80 shrink-0">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--dash-text-muted)]" size={18} />
            <input
              type="text"
              placeholder="Buscar por produto, vendedor ou cliente..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-[var(--dash-hover-bg)] border border-[var(--dash-border)] rounded-xl outline-none focus:ring-2 focus:ring-primary transition-all text-sm font-medium text-[var(--dash-text-primary)]"
            />
          </div>
        </div>
      </div>

      {/* Cards de Métricas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-[var(--dash-surface)] border border-[var(--dash-border)] rounded-[27px] p-6 flex items-center gap-4 shadow-sm hover:shadow-md transition-shadow">
          <div className="p-4 rounded-2xl bg-blue-500/10 text-blue-500">
            <Users size={24} />
          </div>
          <div>
            <p className="text-xs font-black uppercase tracking-widest text-[var(--dash-text-muted)]">
              Total de Leads
            </p>
            <p className="text-2xl font-black text-[var(--dash-text-primary)] mt-1">{totalLeads}</p>
          </div>
        </div>

        <div className="bg-[var(--dash-surface)] border border-[var(--dash-border)] rounded-[27px] p-6 flex items-center gap-4 shadow-sm hover:shadow-md transition-shadow">
          <div className="p-4 rounded-2xl bg-amber-500/10 text-amber-500">
            <Activity size={24} />
          </div>
          <div>
            <p className="text-xs font-black uppercase tracking-widest text-[var(--dash-text-muted)]">
              Em Negociação
            </p>
            <p className="text-2xl font-black text-[var(--dash-text-primary)] mt-1">
              {activeNegotiations}
            </p>
          </div>
        </div>

        <div className="bg-[var(--dash-surface)] border border-[var(--dash-border)] rounded-[27px] p-6 flex items-center gap-4 shadow-sm hover:shadow-md transition-shadow">
          <div className="p-4 rounded-2xl bg-emerald-500/10 text-emerald-500">
            <CheckCircle size={24} />
          </div>
          <div>
            <p className="text-xs font-black uppercase tracking-widest text-[var(--dash-text-muted)]">
              Negócios Fechados
            </p>
            <p className="text-2xl font-black text-[var(--dash-text-primary)] mt-1">{closedDeals}</p>
          </div>
        </div>
      </div>

      {/* Kanban Board */}
      <KanbanBoard leads={filteredLeads} onDragEnd={handleDragEnd} onLeadClick={setSelectedLead} />

      {/* Detalhes do Lead Modal */}
      {selectedLead && (
        <LeadDetailModal
          isOpen={!!selectedLead}
          onClose={() => setSelectedLead(null)}
          lead={selectedLead}
          products={products}
          onLeadUpdated={handleLeadUpdated}
        />
      )}
    </div>
  );
}
