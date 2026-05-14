"use client";

import { 
  TrendingUp, 
  Users, 
  Target, 
  MousePointer2, 
  MessageSquare,
  Building2,
  PieChart,
  Calendar,
  ArrowUpRight
} from "lucide-react";

interface GlobalBIProps {
  stats: {
    totalOrgs: number;
    b2bCount: number;
    b2cCount: number;
    globalFunnel: {
      views: number;
      catalog: number;
      leads: number;
    };
    growthData: { month: string; count: number }[];
  };
}

export default function GlobalBI({ stats }: GlobalBIProps) {
  const funnelRates = {
    engagement: stats.globalFunnel.views > 0 ? (stats.globalFunnel.catalog / stats.globalFunnel.views * 100).toFixed(1) : 0,
    conversion: stats.globalFunnel.catalog > 0 ? (stats.globalFunnel.leads / stats.globalFunnel.catalog * 100).toFixed(1) : 0,
  };

  const maxGrowth = Math.max(...stats.growthData.map(d => d.count), 1);

  return (
    <div className="space-y-10">
      {/* 1. Funil de Conversão Global */}
      <div className="rounded-3xl border bg-[var(--dash-surface)] border-[var(--dash-border)] p-8 shadow-sm">
        <div className="flex items-center gap-3 mb-8">
          <Target className="text-primary" size={24} />
          <h3 className="font-bold text-lg" style={{ color: "var(--dash-text-primary)" }}>Funil de Conversão Global (SaaS)</h3>
        </div>

        <div className="grid gap-4 md:grid-cols-3 relative">
          <div className="p-6 rounded-2xl bg-[var(--dash-bg)] border border-[var(--dash-border)] text-center relative overflow-hidden group">
            <div className="absolute top-0 left-0 w-1 h-full bg-blue-500" />
            <p className="text-[10px] font-bold text-[var(--dash-text-muted)] uppercase tracking-widest mb-1">Total de Visitas</p>
            <p className="text-3xl font-black" style={{ color: "var(--dash-text-primary)" }}>{stats.globalFunnel.views}</p>
          </div>

          <div className="p-6 rounded-2xl bg-[var(--dash-bg)] border border-[var(--dash-border)] text-center relative overflow-hidden group">
            <div className="absolute top-0 left-0 w-1 h-full bg-indigo-500" />
            <p className="text-[10px] font-bold text-[var(--dash-text-muted)] uppercase tracking-widest mb-1">Visualizações de Catálogo</p>
            <p className="text-3xl font-black" style={{ color: "var(--dash-text-primary)" }}>{stats.globalFunnel.catalog}</p>
            <div className="mt-2 text-[10px] font-bold text-indigo-500 bg-indigo-500/10 px-2 py-0.5 rounded-full inline-block">
              {funnelRates.engagement}% Engajamento
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-[var(--dash-bg)] border border-[var(--dash-border)] text-center relative overflow-hidden group">
            <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500" />
            <p className="text-[10px] font-bold text-[var(--dash-text-muted)] uppercase tracking-widest mb-1">Leads (WhatsApp)</p>
            <p className="text-3xl font-black text-emerald-500">{stats.globalFunnel.leads}</p>
            <div className="mt-2 text-[10px] font-bold text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-full inline-block">
              {funnelRates.conversion}% Conversão
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        {/* 2. Crescimento de Usuários */}
        <div className="rounded-3xl border bg-[var(--dash-surface)] border-[var(--dash-border)] p-8 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <TrendingUp className="text-primary" size={24} />
              <h3 className="font-bold text-lg" style={{ color: "var(--dash-text-primary)" }}>Crescimento de Contas</h3>
            </div>
            <Calendar className="text-[var(--dash-text-muted)]" size={18} />
          </div>

          <div className="flex items-end justify-between h-48 gap-2 px-4">
            {stats.growthData.map((d, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-3 group">
                <div 
                  className="w-full bg-primary/10 border-t-2 border-primary rounded-t-lg transition-all hover:bg-primary/20 relative"
                  style={{ height: `${(d.count / maxGrowth) * 100}%`, minHeight: '4px' }}
                >
                  <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-[10px] font-bold opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                    {d.count} contas
                  </div>
                </div>
                <span className="text-[9px] font-bold uppercase tracking-tighter text-[var(--dash-text-muted)]">{d.month}</span>
              </div>
            ))}
          </div>
        </div>

        {/* 3. Distribuição de Modelo de Negócio */}
        <div className="rounded-3xl border bg-[var(--dash-surface)] border-[var(--dash-border)] p-8 shadow-sm">
          <div className="flex items-center gap-3 mb-8">
            <PieChart className="text-primary" size={24} />
            <h3 className="font-bold text-lg" style={{ color: "var(--dash-text-primary)" }}>Market Share (B2B vs B2C)</h3>
          </div>

          <div className="space-y-8">
            <div className="space-y-3">
              <div className="flex justify-between items-end">
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-blue-500" />
                  <span className="text-sm font-bold" style={{ color: "var(--dash-text-primary)" }}>B2B (Empresas/Gestores)</span>
                </div>
                <span className="text-sm font-black">{stats.b2bCount}</span>
              </div>
              <div className="h-3 w-full bg-[var(--dash-bg)] rounded-full overflow-hidden border border-[var(--dash-border)]">
                <div 
                  className="h-full bg-blue-500 transition-all duration-1000" 
                  style={{ width: `${(stats.b2bCount / stats.totalOrgs) * 100}%` }} 
                />
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between items-end">
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-emerald-500" />
                  <span className="text-sm font-bold" style={{ color: "var(--dash-text-primary)" }}>B2C (Autônomos/Varejo)</span>
                </div>
                <span className="text-sm font-black">{stats.b2cCount}</span>
              </div>
              <div className="h-3 w-full bg-[var(--dash-bg)] rounded-full overflow-hidden border border-[var(--dash-border)]">
                <div 
                  className="h-full bg-emerald-500 transition-all duration-1000" 
                  style={{ width: `${(stats.b2cCount / stats.totalOrgs) * 100}%` }} 
                />
              </div>
            </div>

            <div className="pt-4 border-t border-[var(--dash-border)]">
              <div className="flex items-center justify-between text-xs font-bold uppercase tracking-widest text-[var(--dash-text-muted)]">
                <span>Dominância B2B</span>
                <span className="text-primary">{((stats.b2bCount / stats.totalOrgs) * 100).toFixed(0)}%</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
