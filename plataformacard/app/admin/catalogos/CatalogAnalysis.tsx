"use client";

import { 
  Package, 
  Tags, 
  BarChart3, 
  PieChart, 
  Layers,
  ArrowUpRight,
  Image as ImageIcon
} from "lucide-react";

interface CatalogAnalysisProps {
  stats: {
    totalProducts: number;
    totalCategories: number;
    topCategories: { name: string; count: number }[];
    recentProducts: any[];
  };
}

export default function CatalogAnalysis({ stats }: CatalogAnalysisProps) {
  return (
    <div className="space-y-10">
      {/* Grid de Métricas Globais */}
      <div className="grid gap-6 md:grid-cols-3">
        <div className="rounded-3xl border p-6 bg-[var(--dash-surface)] border-[var(--dash-border)]">
          <div className="flex items-center gap-3 mb-4 text-[var(--dash-text-muted)]">
            <Package size={20} />
            <span className="text-xs font-bold uppercase tracking-widest">Produtos Totais</span>
          </div>
          <div className="flex items-end justify-between">
            <p className="text-4xl font-black" style={{ color: "var(--dash-text-primary)" }}>
              {stats.totalProducts}
            </p>
            <div className="text-emerald-500 flex items-center gap-1 text-xs font-bold bg-emerald-500/10 px-2 py-1 rounded-full">
              <ArrowUpRight size={14} />
              +8%
            </div>
          </div>
        </div>

        <div className="rounded-3xl border p-6 bg-[var(--dash-surface)] border-[var(--dash-border)]">
          <div className="flex items-center gap-3 mb-4 text-[var(--dash-text-muted)]">
            <Tags size={20} />
            <span className="text-xs font-bold uppercase tracking-widest">Categorias Únicas</span>
          </div>
          <div className="flex items-end justify-between">
            <p className="text-4xl font-black" style={{ color: "var(--dash-text-primary)" }}>
              {stats.totalCategories}
            </p>
          </div>
        </div>

        <div className="rounded-3xl border p-6 bg-primary/5 border-primary/20">
          <div className="flex items-center gap-3 mb-4 text-primary">
            <ImageIcon size={20} />
            <span className="text-xs font-bold uppercase tracking-widest">Média por Catálogo</span>
          </div>
          <div className="flex items-end justify-between">
            <p className="text-4xl font-black text-primary">
              {(stats.totalProducts / (stats.totalCategories || 1)).toFixed(1)}
            </p>
            <span className="text-[10px] font-bold text-primary opacity-60 uppercase">itens / cat</span>
          </div>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        {/* Top Categorias */}
        <div className="rounded-3xl border bg-[var(--dash-surface)] border-[var(--dash-border)] overflow-hidden shadow-sm">
          <div className="px-6 py-5 border-b border-[var(--dash-border)] flex items-center gap-2">
            <PieChart size={18} className="text-primary" />
            <h3 className="font-bold" style={{ color: "var(--dash-text-primary)" }}>Nicho de Mercado (Top Categorias)</h3>
          </div>
          <div className="p-6 space-y-4">
            {stats.topCategories.map((cat, idx) => (
              <div key={idx} className="space-y-2">
                <div className="flex justify-between text-xs font-bold uppercase tracking-tighter">
                  <span style={{ color: "var(--dash-text-secondary)" }}>{cat.name}</span>
                  <span style={{ color: "var(--dash-text-primary)" }}>{cat.count} itens</span>
                </div>
                <div className="h-2 w-full bg-[var(--dash-bg)] rounded-full overflow-hidden border border-[var(--dash-border)]">
                  <div 
                    className="h-full bg-primary rounded-full" 
                    style={{ width: `${Math.min((cat.count / stats.totalProducts) * 100 * 5, 100)}%` }} 
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Atividade de Inventário */}
        <div className="rounded-3xl border bg-[var(--dash-surface)] border-[var(--dash-border)] overflow-hidden shadow-sm">
          <div className="px-6 py-5 border-b border-[var(--dash-border)] flex items-center gap-2">
            <Layers size={18} className="text-primary" />
            <h3 className="font-bold" style={{ color: "var(--dash-text-primary)" }}>Últimos Itens Cadastrados</h3>
          </div>
          <div className="p-0">
            <div className="divide-y divide-[var(--dash-border)]">
              {stats.recentProducts.map((prod) => (
                <div key={prod.id} className="px-6 py-4 flex items-center justify-between hover:bg-[var(--dash-hover-bg)] transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-[var(--dash-bg)] border border-[var(--dash-border)] flex items-center justify-center text-[var(--dash-text-muted)] overflow-hidden">
                      {prod.image_url ? (
                        <img src={prod.image_url} alt="" className="h-full w-full object-cover" />
                      ) : (
                        <Package size={18} />
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-bold truncate max-w-[200px]" style={{ color: "var(--dash-text-primary)" }}>{prod.name}</p>
                      <p className="text-[10px] text-[var(--dash-text-muted)] uppercase font-bold tracking-widest">
                        {prod.organizations?.name || "Loja"}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-bold" style={{ color: "var(--dash-text-primary)" }}>
                      {prod.price ? `R$ ${prod.price.toFixed(2)}` : "S/ Preço"}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
