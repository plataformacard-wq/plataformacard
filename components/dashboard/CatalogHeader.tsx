"use client";

import React from "react";
import { motion } from "framer-motion";
import { createClient } from "@/lib/supabase/client";

type Catalog = {
  id: string;
  name: string;
  description: string | null;
  type: "product" | "service" | "hybrid";
};

type CatalogHeaderProps = {
  adminCatalogId?: string | null;
  catalog: Catalog | null;
  catalogType: "product" | "service" | "hybrid";
  setCatalogType: (type: "product" | "service" | "hybrid") => void;
  catalogId: string | null;
  productLimit: number;
  productUsageCount: number;
};

export default function CatalogHeader({
  adminCatalogId,
  catalog,
  catalogType,
  setCatalogType,
  catalogId,
  productLimit,
  productUsageCount
}: CatalogHeaderProps) {
  return (
    <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
      <div>
        <h1 className="text-4xl font-black tracking-tight" style={{ color: "var(--dash-text-primary)" }}>
          {adminCatalogId ? `Master: ${catalog?.name || 'Carregando...'}` : (catalog?.name || 'Gerenciando Catálogo')}
        </h1>
        <p className="text-sm mt-1" style={{ color: "var(--dash-text-secondary)" }}>
          {adminCatalogId 
            ? 'Gerenciamento centralizado de categorias e produtos deste Catálogo Franquias para distribuição para franquias.'
            : `Gerencie as categorias e os ${catalogType === 'service' ? 'serviços' : catalogType === 'hybrid' ? 'produtos e serviços' : 'produtos'} da sua vitrine digital.`}
        </p>

        <div className="mt-4 flex items-center gap-2">
          {[
            { id: 'product', label: '📦 Catálogo de Produtos' },
            { id: 'service', label: '🛠️ Catálogo de Serviços' },
            { id: 'hybrid', label: '🌓 Catálogo Híbrido' }
          ].map((type) => (
            <button
              key={type.id}
              onClick={async () => {
                if (!catalogId) return;
                setCatalogType(type.id as "product" | "service" | "hybrid");
                const supabase = createClient();
                await supabase.from("catalogs").update({ type: type.id }).eq("id", catalogId);
              }}
              className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border ${
                catalogType === type.id 
                  ? "bg-emerald-500 border-emerald-500 text-white shadow-lg shadow-emerald-500/20" 
                  : "bg-transparent border-zinc-200 dark:border-zinc-800 text-zinc-500 hover:border-zinc-300"
              }`}
            >
              {type.label}
            </button>
          ))}
        </div>
      </div>

      {!adminCatalogId ? (
        <div className="flex flex-col gap-3 rounded-[27px] border p-6 min-w-[300px] shadow-sm" style={{ background: "var(--dash-surface)", borderColor: "var(--dash-border)" }}>
          <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-[var(--dash-text-muted)]">
            <span>Limite de Produtos</span>
            <span className={productLimit > 0 && productUsageCount >= productLimit ? "text-red-500" : "text-emerald-500"}>
              {productUsageCount} / {productLimit > 0 ? productLimit : "∞"}
            </span>
          </div>
          <div className="h-2.5 w-full overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${productLimit > 0 ? Math.min((productUsageCount / productLimit) * 100, 100) : 0}%` }}
              className={`h-full rounded-full transition-all duration-1000 ${
                productLimit > 0 && productUsageCount >= productLimit ? "bg-red-500" : "bg-emerald-500"
              }`}
            />
          </div>
          <p className="text-[10px] font-bold text-center" style={{ color: "var(--dash-text-muted)" }}>
            {productLimit > 0 ? Math.round((productUsageCount / productLimit) * 100) : 0}% da sua capacidade utilizada
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-3 rounded-[27px] border p-6 min-w-[300px] shadow-sm bg-purple-500/5 border-purple-500/10" style={{ borderColor: "rgba(168, 85, 247, 0.3)" }}>
          <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-purple-500">
            <span>Status do Estoque Master</span>
            <span className="text-purple-500">Ativo</span>
          </div>
          <p className="text-xl font-black text-purple-500" style={{ color: "rgb(168, 85, 247)" }}>{productUsageCount} Itens Cadastrados</p>
          <p className="text-[10px] font-bold" style={{ color: "var(--dash-text-muted)" }}>
            Catálogo Franquias (Disponível para franquias)
          </p>
        </div>
      )}
    </div>
  );
}
