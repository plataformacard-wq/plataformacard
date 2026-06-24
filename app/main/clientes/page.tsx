import { createClient } from "@/lib/supabase/server";
import { ShieldCheck, TrendingUp, Users, Building2 } from "lucide-react";
import ClientList from "./ClientList";

export const dynamic = "force-dynamic";

export default async function ClientesPage() {
  const supabase = await createClient();

  // 1. Fetch all organizations with their basic data
  const { data: organizations } = await supabase
    .from("organizations")
    .select("id, name, internal_name, slug, business_model, created_at, plan_id")
    .neq("name", "Start - Super Admin")
    .order("created_at", { ascending: false });

  // 2. Metrics for the header
  const totalB2B = organizations?.filter(o => o.business_model === 'B2B').length || 0;
  const totalB2C = organizations?.filter(o => o.business_model === 'B2C').length || 0;

  return (
    <div className="space-y-10">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold" style={{ color: "var(--dash-text-primary)" }}>
            Clientes do SaaS
          </h1>
          <p className="text-sm mt-1" style={{ color: "var(--dash-text-secondary)" }}>
            Painel estratégico para monitoramento de contas e saúde das empresas vinculadas.
          </p>
        </div>

        <div className="flex gap-4">
          <div className="bg-[var(--dash-surface)] border border-[var(--dash-border)] px-4 py-2 rounded-lg flex items-center gap-3">
            <div className="h-2 w-2 rounded-full bg-blue-500" />
            <span className="text-xs font-bold uppercase tracking-tighter" style={{ color: "var(--dash-text-secondary)" }}>{totalB2B} B2B</span>
          </div>
          <div className="bg-[var(--dash-surface)] border border-[var(--dash-border)] px-4 py-2 rounded-lg flex items-center gap-3">
            <div className="h-2 w-2 rounded-full bg-emerald-500" />
            <span className="text-xs font-bold uppercase tracking-tighter" style={{ color: "var(--dash-text-secondary)" }}>{totalB2C} B2C</span>
          </div>
        </div>
      </div>

      <ClientList organizations={organizations || []} />
    </div>
  );
}
