import { createClient } from "@/lib/supabase/server";
import { BadgeDollarSign } from "lucide-react";
import AssinaturasList from "./AssinaturasList";

export const dynamic = "force-dynamic";

export default async function AssinaturasPage() {
  const supabase = await createClient();

  // 1. Fetch all organizations with their basic data
  const { data: organizations } = await supabase
    .from("organizations")
    .select("id, name, internal_name, slug, business_model, created_at, plan_id")
    .neq("name", "Start - Super Admin")
    .order("created_at", { ascending: false });

  // 2. Metrics for the header
  const { PLAN_IDS } = await import("@/lib/plans");
  const totalStarter = organizations?.filter(o => o.plan_id === PLAN_IDS.STARTER).length || 0;
  const totalPro = organizations?.filter(o => o.plan_id === PLAN_IDS.PRO).length || 0;
  const totalSalesTeam = organizations?.filter(o => o.plan_id === PLAN_IDS.SALES_TEAM).length || 0;
  const totalEnterprise = organizations?.filter(o => o.plan_id === PLAN_IDS.ENTERPRISE).length || 0;

  return (
    <div className="space-y-10">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3" style={{ color: "var(--dash-text-primary)" }}>
            <BadgeDollarSign className="text-amber-500" size={32} />
            Assinaturas e Planos
          </h1>
          <p className="text-sm mt-1" style={{ color: "var(--dash-text-secondary)" }}>
            Visão global das assinaturas ativas e distribuição de planos no SaaS.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <div className="bg-[var(--dash-surface)] border border-[var(--dash-border)] px-4 py-2 rounded-xl flex items-center gap-3">
            <div className="h-2 w-2 rounded-full bg-slate-400" />
            <span className="text-xs font-bold uppercase tracking-tighter" style={{ color: "var(--dash-text-secondary)" }}>{totalStarter} Starter</span>
          </div>
          <div className="bg-[var(--dash-surface)] border border-[var(--dash-border)] px-4 py-2 rounded-xl flex items-center gap-3">
            <div className="h-2 w-2 rounded-full bg-blue-500" />
            <span className="text-xs font-bold uppercase tracking-tighter" style={{ color: "var(--dash-text-secondary)" }}>{totalPro} PRO</span>
          </div>
          <div className="bg-[var(--dash-surface)] border border-[var(--dash-border)] px-4 py-2 rounded-xl flex items-center gap-3">
            <div className="h-2 w-2 rounded-full bg-amber-500" />
            <span className="text-xs font-bold uppercase tracking-tighter" style={{ color: "var(--dash-text-secondary)" }}>{totalSalesTeam} Sales Team</span>
          </div>
          <div className="bg-[var(--dash-surface)] border border-[var(--dash-border)] px-4 py-2 rounded-xl flex items-center gap-3">
            <div className="h-2 w-2 rounded-full bg-purple-500" />
            <span className="text-xs font-bold uppercase tracking-tighter" style={{ color: "var(--dash-text-secondary)" }}>{totalEnterprise} All Service</span>
          </div>
        </div>
      </div>

      <AssinaturasList organizations={organizations || []} />
    </div>
  );
}
