"use client";

import { useState } from "react";
import { 
  Building2, 
  ExternalLink, 
  Package, 
  Calendar, 
  TrendingUp,
  Search,
  Filter
} from "lucide-react";
import ClientDetailModal from "./ClientDetailModal";

interface ClientListProps {
  organizations: any[];
}

export default function ClientList({ organizations: initialOrgs }: ClientListProps) {
  const [organizations] = useState(initialOrgs);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterModel, setFilterModel] = useState<"ALL" | "B2B" | "B2C">("ALL");
  
  // Modal State
  const [selectedOrg, setSelectedOrg] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const filteredOrgs = organizations?.filter(org => {
    const matchesSearch = org.name?.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         org.slug?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterModel === "ALL" || org.business_model === filterModel;
    return matchesSearch && matchesFilter;
  });

  const handleOpenDetails = (org: any) => {
    setSelectedOrg(org);
    setIsModalOpen(true);
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
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-[var(--dash-surface)] p-4 rounded-3xl border border-[var(--dash-border)] shadow-sm">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--dash-text-muted)]" size={18} />
          <input 
            type="text"
            placeholder="Buscar por nome ou slug..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-2.5 rounded-2xl border outline-none text-sm transition-all focus:ring-2 focus:ring-primary/20"
            style={{ background: "var(--dash-bg)", borderColor: "var(--dash-border)", color: "var(--dash-text-primary)" }}
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter size={16} className="text-[var(--dash-text-muted)]" />
          <div className="flex bg-[var(--dash-bg)] p-1 rounded-xl border border-[var(--dash-border)]">
            {(["ALL", "B2B", "B2C"] as const).map((model) => (
              <button
                key={model}
                onClick={() => setFilterModel(model)}
                className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  filterModel === model 
                    ? "bg-[var(--dash-text-primary)] text-[var(--dash-bg)] shadow-sm" 
                    : "text-[var(--dash-text-secondary)] hover:text-[var(--dash-text-primary)]"
                }`}
              >
                {model === "ALL" ? "Todos" : model}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Grid de Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredOrgs?.map((org) => (
          <div 
            key={org.id} 
            onClick={() => handleOpenDetails(org)}
            className="group relative rounded-3xl border p-6 transition-all hover:shadow-xl hover:border-primary/30 cursor-pointer" 
            style={{ background: "var(--dash-surface)", borderColor: "var(--dash-border)" }}
          >
            <div className="flex items-start justify-between mb-6">
              <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary transition-transform group-hover:scale-110">
                <Building2 size={28} />
              </div>
              <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                org.business_model === 'B2B' 
                  ? 'bg-blue-500/10 text-blue-500' 
                  : 'bg-emerald-500/10 text-emerald-500'
              }`}>
                {org.business_model || 'B2B'}
              </span>
            </div>

            <div className="space-y-1">
              <h3 className="text-xl font-bold truncate" style={{ color: "var(--dash-text-primary)" }}>
                {org.name || "Sem Nome"}
              </h3>
              <p className="text-sm font-medium flex items-center gap-1" style={{ color: "var(--dash-text-muted)" }}>
                /{org.slug}
                <ExternalLink size={12} className="opacity-0 group-hover:opacity-100 transition-opacity" />
              </p>
            </div>

            <div className="mt-8 pt-6 border-t grid grid-cols-2 gap-4" style={{ borderColor: "var(--dash-border)" }}>
              <div className="space-y-1">
                <p className="text-[10px] font-bold text-[var(--dash-text-muted)] uppercase tracking-wider flex items-center gap-1">
                  <Calendar size={12} /> Desde
                </p>
                <p className="text-xs font-semibold" style={{ color: "var(--dash-text-secondary)" }}>
                  {new Date(org.created_at).toLocaleDateString("pt-BR", { month: 'short', year: 'numeric' })}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-bold text-[var(--dash-text-muted)] uppercase tracking-wider flex items-center gap-1">
                  <TrendingUp size={12} /> Performance
                </p>
                <p className="text-xs font-bold text-emerald-500">Alta</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredOrgs?.length === 0 && (
        <div className="text-center py-20 bg-[var(--dash-surface)] rounded-3xl border border-dashed" style={{ borderColor: "var(--dash-border)" }}>
          <p style={{ color: "var(--dash-text-muted)" }}>Nenhum cliente encontrado com os filtros aplicados.</p>
        </div>
      )}
    </div>
  );
}
