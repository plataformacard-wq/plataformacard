"use client";

import { useState } from "react";
import { 
  Building2, 
  ExternalLink, 
  Search,
  Filter,
  BadgeDollarSign,
  Settings2
} from "lucide-react";
import ClientDetailModal from "../clientes/ClientDetailModal";
import { getPlanName, PLAN_IDS } from "@/lib/plans";
import { useRouter } from "next/navigation";
import { updateOrganizationPlan } from "@/lib/admin-actions";
import { RefreshCw } from "lucide-react";

interface AssinaturasListProps {
  organizations: any[];
}

export default function AssinaturasList({ organizations }: AssinaturasListProps) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [filterPlan, setFilterPlan] = useState<"ALL" | "STARTER" | "PRO" | "SALES_TEAM" | "ENTERPRISE">("ALL");
  
  // Modal & Update State
  const [selectedOrg, setSelectedOrg] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const handlePlanChange = async (orgId: string, newPlanId: string) => {
    if (!newPlanId) return;
    setUpdatingId(orgId);
    const result = await updateOrganizationPlan(orgId, newPlanId);
    if (result.success) {
      router.refresh();
    } else {
      alert("Erro ao mudar plano: " + result.error);
    }
    setUpdatingId(null);
  };

  const getPlanIdByFilter = (filter: string) => {
    switch (filter) {
      case "STARTER": return PLAN_IDS.STARTER;
      case "PRO": return PLAN_IDS.PRO;
      case "SALES_TEAM": return PLAN_IDS.SALES_TEAM;
      case "ENTERPRISE": return PLAN_IDS.ENTERPRISE;
      default: return null;
    }
  };

  const filteredOrgs = organizations?.filter(org => {
    const matchesSearch = org.name?.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          org.internal_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         org.slug?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const planIdFilter = getPlanIdByFilter(filterPlan);
    const matchesFilter = filterPlan === "ALL" || org.plan_id === planIdFilter;
    
    return matchesSearch && matchesFilter;
  });

  const handleOpenDetails = (org: any) => {
    setSelectedOrg(org);
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Modal de Gestão Individual (Raio-X / Troca de Plano) */}
      <ClientDetailModal 
        isOpen={isModalOpen} 
        onClose={() => {
          setIsModalOpen(false);
          router.refresh();
        }} 
        organization={selectedOrg} 
      />

      {/* Toolbar */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-[var(--dash-surface)] p-4 rounded-xl border border-[var(--dash-border)] shadow-sm">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--dash-text-muted)]" size={18} />
          <input 
            type="text"
            placeholder="Buscar empresa ou slug..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-2.5 rounded-lg border outline-none text-sm transition-all focus:ring-2 focus:ring-amber-500/20"
            style={{ background: "var(--dash-bg)", borderColor: "var(--dash-border)", color: "var(--dash-text-primary)" }}
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter size={16} className="text-[var(--dash-text-muted)]" />
          <div className="flex bg-[var(--dash-bg)] p-1 rounded-lg border border-[var(--dash-border)] overflow-x-auto custom-scrollbar">
            {(["ALL", "STARTER", "PRO", "SALES_TEAM", "ENTERPRISE"] as const).map((plan) => (
              <button
                key={plan}
                onClick={() => setFilterPlan(plan)}
                className={`px-4 py-1.5 rounded-md text-xs font-bold transition-all whitespace-nowrap ${
                  filterPlan === plan 
                    ? "bg-amber-500 text-white shadow-sm" 
                    : "text-[var(--dash-text-secondary)] hover:text-amber-500"
                }`}
              >
                {plan === "ALL" ? "Todos os Planos" : plan === "STARTER" ? "Starter" : plan === "PRO" ? "PRO" : plan === "SALES_TEAM" ? "Sales Team" : "All Service"}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Lista de Assinaturas */}
      <div className="space-y-4">
        {filteredOrgs?.map((org) => {
          const isEnterprise = org.plan_id === "d35c09c2-51a0-4f38-b5d9-dcc3526e7d26";
          const isBasic = org.plan_id === "6f3dfe4e-905c-486e-923f-2cfb6e5d3e62";

          return (
            <div 
              key={org.id} 
              className="group relative flex flex-col md:flex-row items-center gap-6 p-4 md:p-6 rounded-xl border transition-all hover:shadow-2xl hover:border-amber-500/30" 
              style={{ background: "var(--dash-surface)", borderColor: "var(--dash-border)" }}
            >
              {/* Identidade da Empresa */}
              <div className="flex items-center gap-5 md:w-80 shrink-0">
                <div className={`h-16 w-16 rounded-lg flex items-center justify-center text-white shadow-xl shrink-0 ${isEnterprise ? 'bg-purple-600' : isBasic ? 'bg-blue-600' : 'bg-slate-500'}`}>
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

              {/* Status Financeiro */}
              <div className="flex-1 flex flex-wrap items-center justify-between px-4 md:px-8 border-y md:border-y-0 md:border-x border-dashed py-6 md:py-0 w-full md:w-auto gap-4 md:gap-6" style={{ borderColor: "var(--dash-border)" }}>
                <div className="flex flex-col items-center md:items-start min-w-[80px]">
                  <p className="text-[9px] font-bold uppercase tracking-widest text-[var(--dash-text-muted)] mb-1">Status de Fatura</p>
                  <div className="flex items-center gap-1.5">
                    <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    <p className="text-sm font-black text-emerald-500 uppercase">Em dia</p>
                  </div>
                </div>

                <div className="flex flex-col items-center min-w-[100px]">
                  <p className="text-[9px] font-bold uppercase tracking-widest text-[var(--dash-text-muted)] mb-1">Adesão</p>
                  <p className="text-sm font-black" style={{ color: "var(--dash-text-primary)" }}>
                    {new Date(org.created_at).toLocaleDateString("pt-BR", { month: 'short', year: 'numeric' })}
                  </p>
                </div>

                <div className="flex flex-col items-center md:items-end min-w-[140px] relative">
                  <p className="text-[9px] font-bold uppercase tracking-widest text-[var(--dash-text-muted)] mb-1">Plano Vigente</p>
                  
                  <div className="relative group/plan">
                    {updatingId === org.id && (
                      <div className="absolute inset-0 bg-black/10 backdrop-blur-[1px] rounded-xl z-10 flex items-center justify-center">
                        <RefreshCw size={12} className="animate-spin text-amber-500" />
                      </div>
                    )}
                    <select 
                      value={org.plan_id || ''}
                      disabled={updatingId === org.id}
                      onChange={(e) => handlePlanChange(org.id, e.target.value)}
                      className={`dash-select text-[10px] font-black uppercase tracking-widest pl-4 pr-10 py-1.5 rounded-md border outline-none cursor-pointer transition-all disabled:opacity-50 ${
                        isEnterprise ? 'border-purple-500/30 text-purple-500 bg-purple-500/10 hover:bg-purple-500/20' :
                        isBasic ? 'border-blue-500/30 text-blue-500 bg-blue-500/10 hover:bg-blue-500/20' :
                        org.plan_id ? 'border-slate-500/30 text-slate-500 bg-slate-500/10 hover:bg-slate-500/20' :
                        'border-[var(--dash-border)] text-[var(--dash-text-muted)] bg-[var(--dash-bg)] hover:bg-[var(--dash-surface)]'
                      }`}
                    >
                      <option value="">SEM PLANO</option>
                      <option value={PLAN_IDS.STARTER}>STARTER</option>
                      <option value={PLAN_IDS.PRO}>PRO</option>
                      <option value={PLAN_IDS.SALES_TEAM}>SALES TEAM</option>
                      <option value={PLAN_IDS.ENTERPRISE}>ALL SERVICE</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Ações */}
              <div className="flex items-center gap-3 md:w-56 justify-end shrink-0 w-full md:w-auto">
                 <button 
                  onClick={() => handleOpenDetails(org)}
                  className="flex-1 flex items-center justify-center gap-2 px-6 py-4 rounded-md text-xs font-black bg-amber-500 text-white shadow-lg shadow-amber-500/20 transition-all hover:bg-amber-600 active:scale-95"
                 >
                   <Settings2 size={16} />
                   GERENCIAR
                 </button>
              </div>
            </div>
          );
        })}
      </div>

      {filteredOrgs?.length === 0 && (
        <div className="text-center py-20 bg-[var(--dash-surface)] rounded-xl border border-dashed" style={{ borderColor: "var(--dash-border)" }}>
          <p style={{ color: "var(--dash-text-muted)" }}>Nenhuma assinatura encontrada com os filtros aplicados.</p>
        </div>
      )}
    </div>
  );
}
