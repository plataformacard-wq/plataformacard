import { createClient } from "@/lib/supabase/server";
import AccountList from "./AccountList";

export const dynamic = "force-dynamic";

export default async function ContasPage() {
  const supabase = await createClient();

  // Buscar todas as organizações e seus status
  // Como adicionamos a coluna status via SQL, precisamos informar ao Typescript
  // que ela pode estar lá. Na query, usamos '*' ou listamos explicitamente
  const { data: organizations } = await supabase
    .from("organizations")
    .select("id, name, internal_name, slug, business_model, created_at, plan_id, deleted_at, status")
    .neq("name", "Start - Super Admin")
    .order("created_at", { ascending: false });

  // Contadores
  const totalActives = organizations?.filter(o => o.status === 'active' || (!o.status && !o.deleted_at)).length || 0;
  const totalSuspended = organizations?.filter(o => o.status === 'suspended' || (o.deleted_at && o.status !== 'deactivated')).length || 0;
  const totalDeactivated = organizations?.filter(o => o.status === 'deactivated').length || 0;
  const totalTrash = organizations?.filter(o => o.deleted_at !== null).length || 0;

  return (
    <div className="space-y-10">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold" style={{ color: "var(--dash-text-primary)" }}>
            Gestão de Contas e Status
          </h1>
          <p className="text-sm mt-1" style={{ color: "var(--dash-text-secondary)" }}>
            Administração do ciclo de vida das contas (Inadimplência, Cancelamentos e Exclusão).
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <div className="bg-[var(--dash-surface)] border border-[var(--dash-border)] px-3 py-1.5 rounded-lg flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-emerald-500" />
            <span className="text-[10px] font-black uppercase tracking-tighter" style={{ color: "var(--dash-text-secondary)" }}>{totalActives} Ativas</span>
          </div>
          <div className="bg-[var(--dash-surface)] border border-[var(--dash-border)] px-3 py-1.5 rounded-lg flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-amber-500" />
            <span className="text-[10px] font-black uppercase tracking-tighter" style={{ color: "var(--dash-text-secondary)" }}>{totalSuspended} Suspensas</span>
          </div>
          <div className="bg-[var(--dash-surface)] border border-[var(--dash-border)] px-3 py-1.5 rounded-lg flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-zinc-500" />
            <span className="text-[10px] font-black uppercase tracking-tighter" style={{ color: "var(--dash-text-secondary)" }}>{totalDeactivated} Desativadas</span>
          </div>
          <div className="bg-[var(--dash-surface)] border border-[var(--dash-border)] px-3 py-1.5 rounded-lg flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-red-500" />
            <span className="text-[10px] font-black uppercase tracking-tighter" style={{ color: "var(--dash-text-secondary)" }}>{totalTrash} Lixeira</span>
          </div>
        </div>
      </div>

      <AccountList organizations={organizations || []} />
    </div>
  );
}
