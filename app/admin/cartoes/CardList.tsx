"use client";

import { useState } from "react";
import { 
  UserCircle, 
  Eye, 
  MessageCircle, 
  ExternalLink,
  Search,
  ArrowUpRight,
  UserCheck
} from "lucide-react";

interface CardListProps {
  cards: any[];
}

export default function CardList({ cards: initialCards }: CardListProps) {
  const [cards] = useState(initialCards);
  const [searchQuery, setSearchQuery] = useState("");

  const filteredCards = cards?.filter(card => 
    card.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) || 
    card.slug?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Barra de Pesquisa */}
      <div className="relative max-w-md">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--dash-text-muted)]" size={18} />
        <input 
          type="text"
          placeholder="Buscar por nome ou slug..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-12 pr-4 py-3 rounded-2xl border outline-none text-sm shadow-sm transition-all focus:ring-2 focus:ring-primary/20"
          style={{ background: "var(--dash-surface)", borderColor: "var(--dash-border)", color: "var(--dash-text-primary)" }}
        />
      </div>

      {/* Grid de Cartões */}
      <div className="grid gap-4">
        {filteredCards?.map((card) => (
          <div 
            key={card.id} 
            className="group flex flex-col md:flex-row items-center gap-6 rounded-3xl border p-5 transition-all hover:bg-[var(--dash-hover-bg)]" 
            style={{ background: "var(--dash-surface)", borderColor: "var(--dash-border)" }}
          >
            {/* Avatar */}
            <div className="h-16 w-16 rounded-2xl overflow-hidden bg-[var(--dash-bg)] border border-[var(--dash-border)] flex-shrink-0">
              {card.avatar_url ? (
                <img src={card.avatar_url} alt="" className="h-full w-full object-cover" />
              ) : (
                <div className="h-full w-full flex items-center justify-center text-primary font-bold bg-primary/5">
                  {card.full_name?.charAt(0) || "U"}
                </div>
              )}
            </div>

            {/* Info Principal */}
            <div className="flex-1 min-w-0 text-center md:text-left">
              <div className="flex items-center justify-center md:justify-start gap-2 mb-1">
                <h3 className="font-bold text-lg truncate" style={{ color: "var(--dash-text-primary)" }}>
                  {card.full_name || "Sem Nome"}
                </h3>
                {card.role === 'superadmin' && <UserCheck size={14} className="text-primary" />}
              </div>
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-x-4 gap-y-1 text-xs font-medium" style={{ color: "var(--dash-text-muted)" }}>
                <span className="flex items-center gap-1">
                  <ExternalLink size={12} /> /{card.slug}
                </span>
                <span className="flex items-center gap-1 uppercase tracking-tighter">
                  <UserCircle size={12} /> {card.organizations?.name || "Empresa"}
                </span>
              </div>
            </div>

            {/* Métricas Rápidas */}
            <div className="flex items-center gap-8 px-6 md:border-l border-[var(--dash-border)]">
              <div className="text-center">
                <div className="flex items-center justify-center gap-1 text-[var(--dash-text-muted)] mb-1">
                  <Eye size={14} />
                  <span className="text-[10px] font-bold uppercase">Visitas</span>
                </div>
                <p className="text-xl font-black" style={{ color: "var(--dash-text-primary)" }}>
                  {card.viewCount || 0}
                </p>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center gap-1 text-[var(--dash-text-muted)] mb-1">
                  <MessageCircle size={14} />
                  <span className="text-[10px] font-bold uppercase">Leads</span>
                </div>
                <p className="text-xl font-black text-emerald-500">
                  {card.clickCount || 0}
                </p>
              </div>
            </div>

            {/* Ação */}
            <button 
              onClick={() => window.open(`/${card.slug}`, '_blank')}
              className="px-4 py-2 rounded-xl text-xs font-bold border transition-all hover:bg-primary hover:text-white hover:border-primary"
              style={{ borderColor: "var(--dash-border)", color: "var(--dash-text-secondary)" }}
            >
              Ver Link
            </button>
          </div>
        ))}
      </div>

      {filteredCards?.length === 0 && (
        <div className="text-center py-20 bg-[var(--dash-surface)] rounded-3xl border border-dashed" style={{ borderColor: "var(--dash-border)" }}>
          <p style={{ color: "var(--dash-text-muted)" }}>Nenhum cartão encontrado.</p>
        </div>
      )}
    </div>
  );
}
