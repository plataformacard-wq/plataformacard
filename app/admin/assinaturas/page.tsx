import { createClient } from "@/lib/supabase/server";
import { BadgeDollarSign } from "lucide-react";
import AssinaturasList from "./AssinaturasList";

export const dynamic = "force-dynamic";

export default async function AssinaturasPage() {
  const supabase = await createClient();

  // 1. Fetch all organizations with their basic data
  const { data: organizations } = await supabase
    .from("organizations")
    .select("id, name, slug, business_model, created_at, plan_id")
    .neq("name", "Start - Super Admin")
    .order("created_at", { ascending: false });

  // 2. Metrics for the header
  const totalStart = organizations?.filter(o => o.plan_id === '32c7b8a2-2bf7-43dd-b1a6-5706566fbfd0').length || 0;
  const totalBasic = organizations?.filter(o => o.plan_id === '6f3dfe4e-905c-486e-923f-2cfb6e5d3e62').length || 0;
  const totalEnterprise = organizations?.filter(o => o.plan_id === 'd35c09c2-51a0-4f38-b5d9-dcc3526e7d26').length || 0;

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

        <div className="flex gap-4">
          <div className="bg-[var(--dash-surface)] border border-[var(--dash-border)] px-4 py-2 rounded-xl flex items-center gap-3">
            <div className="h-2 w-2 rounded-full bg-slate-400" />
            <span className="text-xs font-bold uppercase tracking-tighter" style={{ color: "var(--dash-text-secondary)" }}>{totalStart} Start</span>
          </div>
          <div className="bg-[var(--dash-surface)] border border-[var(--dash-border)] px-4 py-2 rounded-xl flex items-center gap-3">
            <div className="h-2 w-2 rounded-full bg-blue-500" />
            <span className="text-xs font-bold uppercase tracking-tighter" style={{ color: "var(--dash-text-secondary)" }}>{totalBasic} Basic</span>
          </div>
          <div className="bg-[var(--dash-surface)] border border-[var(--dash-border)] px-4 py-2 rounded-xl flex items-center gap-3">
            <div className="h-2 w-2 rounded-full bg-purple-500" />
            <span className="text-xs font-bold uppercase tracking-tighter" style={{ color: "var(--dash-text-secondary)" }}>{totalEnterprise} Enterprise</span>
          </div>
        </div>
      </div>

      <AssinaturasList organizations={organizations || []} />
    </div>
  );
}
