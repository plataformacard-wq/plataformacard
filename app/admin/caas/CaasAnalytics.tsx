"use client";

import { useState, useEffect } from "react";
import { BarChart3, TrendingUp, Users, MessageCircle, Loader2 } from "lucide-react";
import { getMasterCatalogAnalytics } from "./actions";

interface AnalyticsData {
  slug: string;
  count: number;
}

interface CaasAnalyticsProps {
  catalogId: string;
  catalogName: string;
}

export default function CaasAnalytics({ catalogId, catalogName }: CaasAnalyticsProps) {
  const [data, setData] = useState<AnalyticsData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const stats = await getMasterCatalogAnalytics(catalogId);
        setData(stats);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [catalogId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="animate-spin text-purple-500" size={32} />
      </div>
    );
  }

  const totalLeads = data.reduce((acc, curr) => acc + curr.count, 0);

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-black flex items-center gap-2 text-dash-text-primary">
            <BarChart3 className="text-purple-500" size={20} />
            BI: {catalogName}
          </h3>
          <p className="text-xs font-bold text-dash-text-secondary">Distribuição de Leads (WhatsApp) por vendedor.</p>
        </div>
        <div className="bg-purple-500/10 border border-purple-500/20 px-4 py-2 rounded-lg text-center">
          <p className="text-[10px] font-black text-purple-500 uppercase tracking-widest">Total de Leads</p>
          <p className="text-xl font-black text-dash-text-primary">{totalLeads}</p>
        </div>
      </div>

      <div className="grid gap-3">
        {data.length > 0 ? data.map((item, idx) => (
          <div 
            key={item.slug} 
            className="bg-dash-bg border border-border p-4 rounded-lg flex items-center justify-between group hover:border-purple-500/30 transition-all"
          >
            <div className="flex items-center gap-4">
              <span className="text-xs font-black w-4 text-dash-text-muted">{item.slug === "unknown" ? "?" : idx + 1}.</span>
              <div className="h-10 w-10 rounded-lg bg-zinc-500/10 flex items-center justify-center text-zinc-500">
                <Users size={18} />
              </div>
              <div>
                <p className="font-bold text-sm text-dash-text-primary">/{item.slug}</p>
                <p className="text-[10px] font-black uppercase tracking-wider text-dash-text-muted">Organização Parceira</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex flex-col items-end">
                <div className="flex items-center gap-2">
                  <MessageCircle size={14} className="text-emerald-500" />
                  <span className="text-lg font-black text-dash-text-primary">{item.count}</span>
                </div>
                <div className="h-1 w-24 bg-border rounded-full mt-1 overflow-hidden">
                  <div 
                    className="h-full bg-purple-500 rounded-full" 
                    style={{ width: `${(item.count / (totalLeads || 1)) * 100}%` }} 
                  />
                </div>
              </div>
              <TrendingUp size={16} className="text-purple-500 opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          </div>
        )) : (
          <div className="py-10 text-center border-2 border-dashed border-[var(--dash-border)] rounded-xl">
            <p className="text-sm font-bold text-[var(--dash-text-muted)]">Nenhum lead registrado para este catálogo ainda.</p>
          </div>
        )}
      </div>
    </div>
  );
}
