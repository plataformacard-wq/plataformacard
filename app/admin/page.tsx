import { createClient } from "@/lib/supabase/server";
import { getInviteCode } from "@/lib/admin-actions";
import AccessManager from "./AccessManager";
import UserList from "./UserList";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const supabase = await createClient();
  const currentBetaCode = await getInviteCode();

  // 1. Total Organizations
  const { count: orgCount } = await supabase
    .from("organizations")
    .select("*", { count: "exact", head: true });

  // 2. Total B2C Users
  const { count: b2cCount } = await supabase
    .from("profiles")
    .select("*", { count: "exact", head: true })
    .eq("role", "b2c_admin");

  // 3. Total B2B Owners
  const { count: b2bCount } = await supabase
    .from("profiles")
    .select("*", { count: "exact", head: true })
    .eq("role", "b2b_admin");

  // 4. Total Sellers
  const { count: sellerCount } = await supabase
    .from("profiles")
    .select("*", { count: "exact", head: true })
    .eq("role", "seller");

  // List recent signups with organization data
  const { data: recentProfiles } = await supabase
    .from("profiles")
    .select(`
      id, 
      full_name, 
      slug, 
      role, 
      created_at,
      organization_id,
      organizations (
        id,
        business_model
      )
    `)
    .order("created_at", { ascending: false })
    .limit(20);

  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-3xl font-bold" style={{ color: "var(--dash-text-primary)" }}>QG de Comando</h1>
        <p className="mt-2" style={{ color: "var(--dash-text-secondary)" }}>
          Bem-vindo ao centro nervoso do seu SaaS. Aqui você tem a visão global da operação.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Gestão de Acesso */}
        <AccessManager currentCode={currentBetaCode} />
        
        <div className="rounded-2xl border p-6 flex flex-col justify-center" style={{ background: "var(--dash-surface)", borderColor: "var(--dash-border)" }}>
           <p className="text-sm font-medium" style={{ color: "var(--dash-text-secondary)" }}>Status da Plataforma</p>
           <div className="flex items-center gap-2 mt-2">
              <div className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse"></div>
              <span className="font-bold text-emerald-500 uppercase tracking-wider text-sm">Beta Ativo</span>
           </div>
           <p className="mt-2 text-xs" style={{ color: "var(--dash-text-muted)" }}>
              O cadastro público está restrito pelo código definido ao lado.
           </p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-4">
        {/* Card 1 */}
        <div className="rounded-2xl border p-6" style={{ background: "var(--dash-surface)", borderColor: "var(--dash-border)" }}>
          <p className="text-sm font-medium" style={{ color: "var(--dash-text-secondary)" }}>Total de Empresas (Lojas)</p>
          <p className="mt-2 text-4xl font-bold" style={{ color: "var(--dash-text-primary)" }}>{orgCount || 0}</p>
        </div>

        {/* Card 2 */}
        <div className="rounded-2xl border p-6" style={{ background: "var(--dash-surface)", borderColor: "var(--dash-border)" }}>
          <p className="text-sm font-medium" style={{ color: "var(--dash-text-secondary)" }}>Assinantes B2B (Donos)</p>
          <p className="mt-2 text-4xl font-bold text-blue-500">{b2bCount || 0}</p>
        </div>

        {/* Card 3 */}
        <div className="rounded-2xl border p-6" style={{ background: "var(--dash-surface)", borderColor: "var(--dash-border)" }}>
          <p className="text-sm font-medium" style={{ color: "var(--dash-text-secondary)" }}>Assinantes B2C (Autônomos)</p>
          <p className="mt-2 text-4xl font-bold text-emerald-500">{b2cCount || 0}</p>
        </div>

        {/* Card 4 */}
        <div className="rounded-2xl border p-6" style={{ background: "var(--dash-surface)", borderColor: "var(--dash-border)" }}>
          <p className="text-sm font-medium" style={{ color: "var(--dash-text-secondary)" }}>Funcionários (Sellers)</p>
          <p className="mt-2 text-4xl font-bold text-purple-500">{sellerCount || 0}</p>
        </div>
      </div>

      <div className="rounded-2xl border" style={{ background: "var(--dash-surface)", borderColor: "var(--dash-border)" }}>
        <div className="border-b px-6 py-4" style={{ borderColor: "var(--dash-border)" }}>
          <h2 className="text-lg font-semibold" style={{ color: "var(--dash-text-primary)" }}>Usuários Recentes na Plataforma</h2>
        </div>
        <UserList profiles={recentProfiles as any} />
      </div>
    </div>
  );
}