"use client";

import { Search, Building2, ChevronDown, ToggleLeft, ToggleRight, ExternalLink, Users2 } from "lucide-react";

interface Organization {
  id: string;
  name: string;
  slug: string;
  business_model: string;
  assigned_catalog_id?: string | null;
  allow_caas_detachment?: boolean;
  internal_name?: string | null;
}

interface MasterCatalog {
  id: string;
  name: string;
  description: string | null;
  type?: "product" | "service" | "hybrid" | null;
  whatsapp_template?: string | null;
  hide_cta?: boolean | null;
  deleted_at?: string | null;
}

interface CaasOrgDistributionProps {
  filteredOrgs: Organization[];
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  loadingId: string | null;
  masterCatalogs: MasterCatalog[];
  handleAssign: (orgId: string, catalogId: string | null) => Promise<void>;
  handleToggleDetachment: (orgId: string, currentValue: boolean) => Promise<void>;
}

export default function CaasOrgDistribution({
  filteredOrgs,
  searchTerm,
  setSearchTerm,
  loadingId,
  masterCatalogs,
  handleAssign,
  handleToggleDetachment
}: CaasOrgDistributionProps) {
  return (
    <div className="space-y-6 pt-10 border-t border-[var(--dash-border)]">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 px-2">
        <div>
          <h2 className="text-2xl font-bold" style={{ color: "var(--dash-text-primary)" }}>Distribuição por Empresa</h2>
          <p className="text-xs font-bold" style={{ color: "var(--dash-text-secondary)" }}>Vincule as organizações aos catálogos master para herança de estoque.</p>
        </div>
        
        <div className="flex items-center gap-4 bg-[var(--dash-surface)] px-4 py-2.5 rounded-lg border border-[var(--dash-border)]">
          <Search className="text-[var(--dash-text-muted)]" size={18} />
          <input 
            type="text" 
            placeholder="Buscar organização..."
            className="bg-transparent border-none outline-none w-48 text-xs font-bold"
            style={{ color: "var(--dash-text-primary)" }}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="grid gap-4">
        {filteredOrgs.map(org => {
          return (
            <div 
              key={org.id}
              className="bg-[var(--dash-surface)] border border-[var(--dash-border)] p-6 rounded-[24px] flex items-center justify-between group hover:border-purple-500/30 transition-all"
            >
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-lg bg-purple-500/10 flex items-center justify-center text-purple-500">
                  <Building2 size={24} />
                </div>
                <div>
                  <h3 className="font-bold text-lg flex items-center gap-2" style={{ color: "var(--dash-text-primary)" }}>
                    {org.internal_name || org.name}
                  </h3>
                  {org.internal_name && (
                    <p className="text-[10px] text-[var(--dash-text-muted)] mt-1">Original: {org.name}</p>
                  )}
                    {org.business_model === "CaaS" && (
                      <span className="text-[10px] font-black uppercase tracking-widest bg-purple-500/10 text-purple-500 px-2 py-0.5 rounded-full">CaaS</span>
                    )}
                  <p className="text-xs font-medium" style={{ color: "var(--dash-text-secondary)" }}>
                    /{org.slug}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-6">
                {/* Seletor de Catálogo Master */}
                <div className="relative group/select">
                  <select 
                    disabled={loadingId === org.id}
                    className="appearance-none bg-[var(--dash-bg)] border border-[var(--dash-border)] rounded-lg px-4 py-2.5 pr-10 text-xs font-bold focus:outline-none focus:ring-2 ring-purple-500/20 disabled:opacity-50 transition-all"
                    style={{ color: "var(--dash-text-primary)" }}
                    value={org.assigned_catalog_id || ""}
                    onChange={(e) => handleAssign(org.id, e.target.value || null)}
                  >
                    <option value="">Nenhum Catálogo Master</option>
                    {masterCatalogs.map(cat => (
                      <option key={cat.id} value={cat.id}>
                        Master: {cat.name}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-[var(--dash-text-muted)]" size={14} />
                </div>

                {/* Toggle de Permissão CaaS (só exibe se tiver catálogo) */}
                {org.assigned_catalog_id && (
                  <div className="flex flex-col items-center gap-1 border-l border-[var(--dash-border)] pl-4">
                    <span className="text-[8px] font-black uppercase tracking-widest text-[var(--dash-text-muted)] text-center">Permitir<br/>Desvincular</span>
                    <button 
                      type="button"
                      onClick={() => handleToggleDetachment(org.id, !!org.allow_caas_detachment)}
                      disabled={loadingId === `toggle-${org.id}`}
                      className="transition-transform hover:scale-110 active:scale-95 disabled:opacity-50 cursor-pointer"
                      title="Permite que este inquilino desvincule (clone) e edite totalmente produtos CaaS"
                    >
                      {org.allow_caas_detachment ? (
                        <ToggleRight size={28} className="text-emerald-500" />
                      ) : (
                        <ToggleLeft size={28} className="text-[var(--dash-text-muted)]" />
                      )}
                    </button>
                  </div>
                )}

                {/* Link para Visualização */}
                <a 
                  href={`/${org.slug}/catalogo`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="h-10 w-10 rounded-lg bg-[var(--dash-bg)] border border-[var(--dash-border)] flex items-center justify-center text-[var(--dash-text-secondary)] hover:text-purple-500 hover:border-purple-500/50 transition-all"
                  title="Ver Vitrine"
                >
                  <ExternalLink size={18} />
                </a>
              </div>
            </div>
          );
        })}
        {filteredOrgs.length === 0 && (
          <div className="py-20 text-center opacity-30">
            <Users2 className="mx-auto mb-4" size={48} />
            <p className="font-bold">Nenhuma organização encontrada.</p>
          </div>
        )}
      </div>
    </div>
  );
}
