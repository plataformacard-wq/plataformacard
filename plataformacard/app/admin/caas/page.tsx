import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import CaasManager from "./CaasManager";
import CatalogAnalysis from "../catalogos/CatalogAnalysis";
import { Globe, ShieldCheck, Zap, BarChart3, Package, Layers } from "lucide-react";
import Link from "next/link";

export const dynamic = "force-dynamic";

interface PageProps {
  searchParams: Promise<{ tab?: string }>;
}

export default async function CaasAdminPage({ searchParams }: PageProps) {
  const resolvedSearchParams = await searchParams;
  const tab = resolvedSearchParams.tab || "distribuicao";

  const supabase = await createClient();
  const admin = createAdminClient();

  // --- DATA FOR CAAS MANAGER ---
  // 1. Fetch Master Catalogs (catalog_type = 'platform')
  const { data: masterCatalogs } = await admin
    .from("catalogs")
    .select("*")
    .eq("catalog_type", "platform")
    .is("deleted_at", null);

  const { data: deletedCatalogs } = await admin
    .from("catalogs")
    .select("*")
    .eq("catalog_type", "platform")
    .not("deleted_at", "is", null);

  // 2. Fetch Organizations
  const { data: organizations } = await admin
    .from("organizations")
    .select("id, name, slug, business_model")
    .neq("name", "Start - Super Admin")
    .order("name", { ascending: true });

  // 3. Fetch Assignments
  const { data: assignments } = await admin
    .from("organization_catalogs")
    .select("organization_id, catalog_id, allow_caas_detachment, catalogs(catalog_type)")
    .eq("is_enabled", true);

  // Map assignments to organizations
  const orgsWithAssignments = (organizations || []).map(org => {
    const assignment = assignments?.find(a => {
      if (a.organization_id !== org.id) return false;
      const cat = Array.isArray(a.catalogs) ? a.catalogs[0] : a.catalogs;
      return cat?.catalog_type === 'platform' || cat?.catalog_type === 'CaaS';
    });
    return {
      ...org,
      assigned_catalog_id: assignment?.catalog_id || null,
      allow_caas_detachment: assignment?.allow_caas_detachment || false
    };
  });

  // --- DATA FOR INVENTORY ANALYSIS ---
  // 1. Total Products
  const { count: totalProducts } = await supabase
    .from("products")
    .select("*", { count: "exact", head: true })
    .is("deleted_at", null);

  // 2. Fetch Categories for aggregation
  const { data: allCategories } = await supabase
    .from("categories")
    .select("name");

  // 3. Aggregate Top Categories (by name)
  const categoryCounts: Record<string, number> = {};
  allCategories?.forEach(cat => {
    const name = cat.name.trim();
    categoryCounts[name] = (categoryCounts[name] || 0) + 1;
  });

  const topCategories = Object.entries(categoryCounts)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  // 4. Recent Products across all catalogs
  const { data: recentProducts } = await supabase
    .from("products")
    .select(`
      id,
      name,
      price,
      image_url,
      created_at,
      organizations (
        name
      )
    `)
    .is("deleted_at", null)
    .order("created_at", { ascending: false })
    .limit(8);

  const stats = {
    totalProducts: totalProducts || 0,
    totalCategories: allCategories?.length || 0,
    topCategories,
    recentProducts: (recentProducts || []) as any[],
  };

  return (
    <div className="space-y-10 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight" style={{ color: "var(--dash-text-primary)" }}>
            Gestão de Catálogos & CaaS
          </h1>
          <p className="mt-2 text-sm" style={{ color: "var(--dash-text-secondary)" }}>
            Controle de Catálogos Master, análise de estoque global e distribuição para parceiros CaaS.
          </p>
        </div>

        <div className="flex items-center gap-3 bg-purple-500/10 border border-purple-500/20 px-5 py-3 rounded-lg">
          <ShieldCheck className="text-purple-500" size={20} />
          <div className="flex flex-col">
            <span className="text-[10px] font-black uppercase tracking-widest text-purple-500">Autoridade Super Admin</span>
            <span className="text-xs font-bold" style={{ color: "var(--dash-text-primary)" }}>Painel Unificado</span>
          </div>
        </div>
      </div>

      {/* Tab Selector Switcher */}
      <div className="flex bg-[var(--dash-hover-bg)] p-1 rounded-lg border border-[var(--dash-border)] w-fit">
        <Link
          href="/admin/caas?tab=distribuicao"
          className={`flex items-center gap-2 px-5 py-3 rounded-lg font-black text-xs uppercase tracking-widest transition-all ${
            tab === "distribuicao" 
              ? "bg-white text-black shadow-sm" 
              : "text-[var(--dash-text-secondary)] hover:text-[var(--dash-text-primary)]"
          }`}
        >
          <Globe size={14} />
          Distribuição & CaaS
        </Link>
        <Link
          href="/admin/caas?tab=analise"
          className={`flex items-center gap-2 px-5 py-3 rounded-lg font-black text-xs uppercase tracking-widest transition-all ${
            tab === "analise" 
              ? "bg-white text-black shadow-sm" 
              : "text-[var(--dash-text-secondary)] hover:text-[var(--dash-text-primary)]"
          }`}
        >
          <BarChart3 size={14} />
          Análise de Inventário
        </Link>
      </div>

      {/* Render selected tab content */}
      {tab === "distribuicao" ? (
        <div className="space-y-10">
          {/* Métricas CaaS */}
          <div className="grid gap-6 md:grid-cols-3">
            <div className="bg-[var(--dash-surface)] p-6 rounded-xl border border-[var(--dash-border)]">
              <div className="flex items-center gap-3 mb-4">
                <div className="h-8 w-8 rounded-lg bg-purple-500/10 flex items-center justify-center text-purple-500"><Globe size={16} /></div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--dash-text-muted)]">Catálogos Master</p>
              </div>
              <p className="text-3xl font-black text-purple-500">{masterCatalogs?.length || 0}</p>
            </div>
            
            <div className="bg-[var(--dash-surface)] p-6 rounded-xl border border-[var(--dash-border)]">
              <div className="flex items-center gap-3 mb-4">
                <div className="h-8 w-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-500"><Zap size={16} /></div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--dash-text-muted)]">Organizações B2B/CaaS</p>
              </div>
              <p className="text-3xl font-black text-emerald-500">{organizations?.length || 0}</p>
            </div>

            <div className="bg-[var(--dash-surface)] p-6 rounded-xl border border-[var(--dash-border)]">
              <div className="flex items-center gap-3 mb-4">
                <div className="h-8 w-8 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-500"><ShieldCheck size={16} /></div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--dash-text-muted)]">Vínculos Ativos</p>
              </div>
              <p className="text-3xl font-black text-blue-500">{assignments?.length || 0}</p>
            </div>
          </div>

          <CaasManager 
            masterCatalogs={(masterCatalogs || []) as any[]} 
            deletedCatalogs={(deletedCatalogs || []) as any[]}
            organizations={orgsWithAssignments} 
          />
        </div>
      ) : (
        <CatalogAnalysis stats={stats} />
      )}
    </div>
  );
}
