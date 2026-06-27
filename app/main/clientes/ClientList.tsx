"use client";

import { useState } from "react";
import { 
  Building2, 
  ExternalLink, 
  Search,
  Filter,
  RefreshCw
} from "lucide-react";
import ClientDetailModal from "./ClientDetailModal";
import { updateOrganizationModel } from "@/lib/admin-actions";
import { getPlanName } from "@/lib/plans";

interface ClientListProps {
  organizations: any[];
}

export default function ClientList({ organizations: initialOrgs }: ClientListProps) {
  const [organizations, setOrganizations] = useState(initialOrgs);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterModel, setFilterModel] = useState<"ALL" | "B2B" | "B2C" | "CaaS" | "ALL_SERVICE">("ALL");
  
  // Modal State
  const [selectedOrg, setSelectedOrg] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const filteredOrgs = organizations?.filter(org => {
    const matchesSearch = org.name?.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          org.internal_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          org.slug?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterModel === "ALL" || org.business_model === filterModel;
    return matchesSearch && matchesFilter;
  });

  const handleOpenDetails = (org: any) => {
    setSelectedOrg(org);
    setIsModalOpen(true);
  };

  const handleModelChange = async (orgId: string, newModel: 'B2B' | 'B2C' | 'CaaS' | 'ALL_SERVICE') => {
    if (updatingId === orgId) return;
    setUpdatingId(orgId);
    
    // Optimistic Update
    const oldOrganizations = [...organizations];
    setOrganizations(prev => prev.map(org => org.id === orgId ? { ...org, business_model: newModel } : org));
    
    const result = await updateOrganizationModel(orgId, newModel);
    if (!result.success) {
      alert("Erro ao mudar modelo: " + result.error);
      // Revert on failure
      setOrganizations(oldOrganizations);
    }
    setUpdatingId(null);
  };

  return (
    <div className="space-y-6">
      {/* Modal Raio-X */}
      <ClientDetailModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        organization={selectedOrg} 
      />

      {/* Toolbar */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-[var(--dash-surface)] p-4 rounded-xl border border-[var(--dash-border)] shadow-sm">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--dash-text-muted)]" size={18} />
          <input 
            type="text"
            placeholder="Buscar por nome ou slug..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-2.5 rounded-lg border outline-none text-sm transition-all focus:ring-2 focus:ring-primary/20"
            style={{ background: "var(--dash-bg)", borderColor: "var(--dash-border)", color: "var(--dash-text-primary)" }}
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter size={16} className="text-[var(--dash-text-muted)]" />
          <div className="flex bg-[var(--dash-bg)] p-1 rounded-lg border border-[var(--dash-border)]">
            {(["ALL", "B2B", "B2C", "CaaS", "ALL_SERVICE"] as const).map((model) => (
              <button
                key={model}
                onClick={() => setFilterModel(model)}
                className={`px-4 py-1.5 rounded-md text-xs font-bold transition-all ${
                  filterModel === model 
                    ? "bg-[var(--dash-text-primary)] text-[var(--dash-bg)] shadow-sm" 
                    : "text-[var(--dash-text-secondary)] hover:text-[var(--dash-text-primary)]"
                }`}
              >
                {model === "ALL" ? "Todos" : model === "ALL_SERVICE" ? "All Service" : model}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Lista de Cards Premium (Padrão Horizontal Vendedores) */}
      <div className="space-y-4">
        {filteredOrgs?.map((org) => {
          return (
            <div 
              key={org.id} 
              className="group relative flex flex-col md:flex-row items-center gap-6 p-6 rounded-[32px] border transition-all hover:shadow-2xl hover:border-primary/30" 
              style={{ background: "var(--dash-surface)", borderColor: "var(--dash-border)" }}
            >
              {/* 1. Identidade da Empresa (Esquerda) */}
              <div className="flex items-center gap-5 md:w-72 shrink-0">
                <div className={`h-16 w-16 rounded-lg flex items-center justify-center text-white shadow-2xl shrink-0 ${org.business_model === 'B2B' ? 'bg-blue-600' : org.business_model === 'CaaS' ? 'bg-purple-600' : org.business_model === 'ALL_SERVICE' ? 'bg-zinc-900' : 'bg-emerald-600'}`}>
                  <Building2 size={32} />
                </div>
                <div className="min-w-0">
                  <h3 className="text-lg font-black truncate leading-tight" style={{ color: "var(--dash-text-primary)" }}>
                    {org.internal_name || org.name || "Sem Nome"}
                  </h3>
                  {org.internal_name && (
                    <p className="text-[10px] text-[var(--dash-text-muted)] mt-1">Original: {org.name}</p>
                  )}
                  <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--dash-text-muted)] truncate max-w-[150px] mt-1">
                    /{org.slug}
                  </p>
                </div>
              </div>

              {/* 2. Dados Analíticos / Saúde (Centro - Bordas Tracejadas) */}
              <div className="flex-1 flex flex-wrap items-center justify-between px-4 md:px-8 border-y md:border-y-0 md:border-x border-dashed py-6 md:py-0 w-full md:w-auto gap-4 md:gap-6" style={{ borderColor: "var(--dash-border)" }}>
                <div className="flex flex-col items-center md:items-start min-w-[60px]">
                  <p className="text-[9px] font-bold uppercase tracking-widest text-[var(--dash-text-muted)] mb-1">Desde</p>
                  <p className="text-sm font-black" style={{ color: "var(--dash-text-primary)" }}>
                    {new Date(org.created_at).toLocaleDateString("pt-BR", { month: 'short', year: 'numeric' })}
                  </p>
                </div>
                
                <div className="flex flex-col items-center min-w-[60px]">
                  <p className="text-[9px] font-bold uppercase tracking-widest text-[var(--dash-text-muted)] mb-1">Status</p>
                  <div className="flex items-center gap-1.5">
                    <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    <p className="text-sm font-black text-emerald-500 uppercase">Ativo</p>
                  </div>
                </div>

                {/* SELETOR B2B / B2C ULTRA EVIDENTE */}
                <div className="flex flex-col items-center min-w-[120px]">
                  <p className="text-[9px] font-bold uppercase tracking-widest text-[var(--dash-text-muted)] mb-2">Modelo de Operação</p>
                  <div className="flex p-1 bg-[var(--dash-bg)] rounded-lg border border-[var(--dash-border)] relative scale-90 md:scale-100">
                    {updatingId === org.id && (
                      <div className="absolute inset-0 bg-black/20 backdrop-blur-[1px] rounded-lg z-10 flex items-center justify-center">
                        <RefreshCw size={12} className="animate-spin text-white" />
                      </div>
                    )}
                    <button 
                      onClick={() => org.business_model !== 'CaaS' && handleModelChange(org.id, 'CaaS')}
                      className={`px-4 py-1.5 rounded-md text-[10px] font-black transition-all ${
                        org.business_model === 'CaaS' 
                          ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/20' 
                          : 'text-[var(--dash-text-muted)] hover:text-purple-500'
                      }`}
                    >
                      CaaS
                    </button>
                    <button 
                      onClick={() => org.business_model !== 'B2C' && handleModelChange(org.id, 'B2C')}
                      className={`px-4 py-1.5 rounded-md text-[10px] font-black transition-all ${
                        org.business_model === 'B2C' 
                          ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/20' 
                          : 'text-[var(--dash-text-muted)] hover:text-emerald-500'
                      }`}
                    >
                      B2C
                    </button>
                    <button 
                      onClick={() => org.business_model !== 'B2B' && handleModelChange(org.id, 'B2B')}
                      className={`px-4 py-1.5 rounded-md text-[10px] font-black transition-all ${
                        org.business_model === 'B2B' 
                          ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' 
                          : 'text-[var(--dash-text-muted)] hover:text-blue-500'
                      }`}
                    >
                      B2B
                    </button>
                    <button 
                      onClick={() => org.business_model !== 'ALL_SERVICE' && handleModelChange(org.id, 'ALL_SERVICE')}
                      className={`px-4 py-1.5 rounded-md text-[10px] font-black transition-all ${
                        org.business_model === 'ALL_SERVICE' 
                          ? 'bg-zinc-900 text-white shadow-lg shadow-zinc-900/20' 
                          : 'text-[var(--dash-text-muted)] hover:text-zinc-600'
                      }`}
                    >
                      ALL SERVICE
                    </button>
                  </div>
                </div>

                <div className="flex flex-col items-center md:items-end min-w-[80px]">
                  <p className="text-[9px] font-bold uppercase tracking-widest text-[var(--dash-text-muted)] mb-1">Plano</p>
                  <p className="text-sm font-black text-amber-500 uppercase text-right">
                    {getPlanName(org.plan_id)}
                  </p>
                </div>
              </div>

              {/* 3. Ações Rápidas (Direita) */}
              <div className="flex items-center gap-3 md:w-64 justify-end shrink-0 w-full md:w-auto">
                 <button 
                  onClick={() => handleOpenDetails(org)}
                  className="flex-1 flex items-center justify-center gap-2 px-6 py-4 rounded-lg text-xs font-black bg-[var(--dash-bg)] border transition-all hover:bg-primary/10 hover:border-primary/30 active:scale-95"
                  style={{ borderColor: "var(--dash-border)", color: "var(--dash-text-primary)" }}
                 >
                   VER RAIO-X
                 </button>
                 <a 
                  href={`/${org.slug}`}
                  target="_blank"
                  className="p-4 rounded-lg bg-[var(--dash-bg)] border text-[var(--dash-text-muted)] hover:text-primary transition-all flex-shrink-0"
                  style={{ borderColor: "var(--dash-border)" }}
                 >
                   <ExternalLink size={18} />
                 </a>
              </div>
            </div>
          );
        })}
      </div>

      {filteredOrgs?.length === 0 && (
        <div className="text-center py-20 bg-[var(--dash-surface)] rounded-[32px] border border-dashed" style={{ borderColor: "var(--dash-border)" }}>
          <p style={{ color: "var(--dash-text-muted)" }}>Nenhum cliente encontrado com os filtros aplicados.</p>
        </div>
      )}
    </div>
  );
}
