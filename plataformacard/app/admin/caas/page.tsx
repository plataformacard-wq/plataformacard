import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import CaasManager from "./CaasManager";
import { Globe, ShieldCheck, Zap } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function CaasAdminPage() {
  const supabase = await createClient();
  const admin = createAdminClient();

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
    .select("organization_id, catalog_id")
    .eq("is_enabled", true);

  // Map assignments to organizations
  const orgsWithAssignments = (organizations || []).map(org => {
    const assignment = assignments?.find(a => a.organization_id === org.id);
    return {
      ...org,
      assigned_catalog_id: assignment?.catalog_id || null
    };
  });

  return (
    <div className="space-y-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold" style={{ color: "var(--dash-text-primary)" }}>Gestão CaaS (QG)</h1>
          <p className="mt-2 text-sm" style={{ color: "var(--dash-text-secondary)" }}>
            Controle centralizado de Catálogos Master e distribuição para parceiros B2B/CaaS.
          </p>
        </div>

        <div className="flex items-center gap-3 bg-purple-500/10 border border-purple-500/20 px-5 py-3 rounded-2xl">
          <ShieldCheck className="text-purple-500" size={20} />
          <div className="flex flex-col">
            <span className="text-[10px] font-black uppercase tracking-widest text-purple-500">Autoridade Super Admin</span>
            <span className="text-xs font-bold" style={{ color: "var(--dash-text-primary)" }}>Distribuição Master Ativa</span>
          </div>
        </div>
      </div>

      {/* Métricas CaaS */}
      <div className="grid gap-6 md:grid-cols-3">
        <div className="bg-[var(--dash-surface)] p-6 rounded-3xl border border-[var(--dash-border)]">
          <div className="flex items-center gap-3 mb-4">
            <div className="h-8 w-8 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-500"><Globe size={16} /></div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--dash-text-muted)]">Catálogos Master</p>
          </div>
          <p className="text-3xl font-black text-purple-500">{masterCatalogs?.length || 0}</p>
        </div>
        
        <div className="bg-[var(--dash-surface)] p-6 rounded-3xl border border-[var(--dash-border)]">
          <div className="flex items-center gap-3 mb-4">
            <div className="h-8 w-8 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500"><Zap size={16} /></div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--dash-text-muted)]">Organizações B2B/CaaS</p>
          </div>
          <p className="text-3xl font-black text-emerald-500">{organizations?.length || 0}</p>
        </div>

        <div className="bg-[var(--dash-surface)] p-6 rounded-3xl border border-[var(--dash-border)]">
          <div className="flex items-center gap-3 mb-4">
            <div className="h-8 w-8 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-500"><ShieldCheck size={16} /></div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--dash-text-muted)]">Vínculos Ativos</p>
          </div>
          <p className="text-3xl font-black text-blue-500">{assignments?.length || 0}</p>
        </div>
      </div>

      {/* Gerenciador Principal */}
      <CaasManager 
        masterCatalogs={(masterCatalogs || []) as any[]} 
        deletedCatalogs={(deletedCatalogs || []) as any[]}
        organizations={orgsWithAssignments} 
      />
    </div>
  );
}
