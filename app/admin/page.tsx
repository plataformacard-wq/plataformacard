import { createClient } from "@/lib/supabase/server";
import { getInviteCode } from "@/lib/admin-actions";
import UserList from "./UserList";
import { Building2, Users, LayoutDashboard, ShieldCheck, BookOpen } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const supabase = await createClient();
  const currentBetaCode = await getInviteCode();

  // 1. Total Organizations
  const { count: orgCount } = await supabase
    .from("organizations")
    .select("*", { count: "exact", head: true })
    .neq("name", "Start - Super Admin");

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

  // 5. Total Products
  const { count: productCount } = await supabase
    .from("products")
    .select("*", { count: "exact", head: true })
    .is("deleted_at", null);

  // 6. Total Categories
  const { count: categoryCount } = await supabase
    .from("categories")
    .select("*", { count: "exact", head: true });

  // 7. Total Catalogs
  const { count: catalogCount } = await supabase
    .from("catalogs")
    .select("*", { count: "exact", head: true });

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
        name,
        business_model
      )
    `)
    .neq("role", "superadmin")
    .order("created_at", { ascending: false })
    .limit(20);

  return (
    <div className="space-y-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold" style={{ color: "var(--dash-text-primary)" }}>QG de Comando</h1>
          <p className="mt-2 text-sm" style={{ color: "var(--dash-text-secondary)" }}>
            Bem-vindo ao centro nervoso do seu SaaS. Visão global da operação.
          </p>
        </div>

        <div className="bg-[var(--dash-surface)] border border-[var(--dash-border)] px-5 py-3 rounded-2xl flex items-center gap-3">
          <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
          <div className="flex flex-col">
            <span className="text-[10px] font-black uppercase tracking-widest text-emerald-500">Sistemas Ativos</span>
            <span className="text-xs font-bold" style={{ color: "var(--dash-text-primary)" }}>Beta: {currentBetaCode}</span>
          </div>
        </div>
      </div>

      {/* Grid Principal de Métricas */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {/* Card: Total Empresas */}
        <div className="rounded-3xl border p-6 shadow-sm transition-all hover:shadow-md" style={{ background: "var(--dash-surface)", borderColor: "var(--dash-border)" }}>
          <div className="flex items-center justify-between mb-4">
            <p className="text-xs font-bold uppercase tracking-widest" style={{ color: "var(--dash-text-muted)" }}>Total de Empresas</p>
            <div className="h-8 w-8 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
              <Building2 size={16} />
            </div>
          </div>
          <p className="text-4xl font-black" style={{ color: "var(--dash-text-primary)" }}>{orgCount || 0}</p>
          <div className="mt-4 flex items-center gap-2 text-emerald-500 font-bold text-[10px] bg-emerald-500/10 w-fit px-2 py-0.5 rounded-full">
            <span>↑ 12%</span>
          </div>
        </div>

        {/* Card: Total Usuários */}
        <div className="rounded-3xl border p-6 shadow-sm transition-all hover:shadow-md" style={{ background: "var(--dash-surface)", borderColor: "var(--dash-border)" }}>
          <div className="flex items-center justify-between mb-4">
            <p className="text-xs font-bold uppercase tracking-widest" style={{ color: "var(--dash-text-muted)" }}>Total de Usuários</p>
            <div className="h-8 w-8 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-500">
              <Users size={16} />
            </div>
          </div>
          <p className="text-4xl font-black" style={{ color: "var(--dash-text-primary)" }}>{(b2bCount || 0) + (b2cCount || 0) + (sellerCount || 0)}</p>
          <p className="mt-2 text-[10px] font-medium truncate" style={{ color: "var(--dash-text-secondary)" }}>
            {b2bCount || 0} B2B · {b2cCount || 0} B2C · {sellerCount || 0} Vend.
          </p>
        </div>

        {/* Card: Catálogos Ativos */}
        <div className="rounded-3xl border p-6 shadow-sm transition-all hover:shadow-md" style={{ background: "var(--dash-surface)", borderColor: "var(--dash-border)" }}>
          <div className="flex items-center justify-between mb-4">
            <p className="text-xs font-bold uppercase tracking-widest" style={{ color: "var(--dash-text-muted)" }}>Catálogos Ativos</p>
            <div className="h-8 w-8 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500">
              <BookOpen size={16} />
            </div>
          </div>
          <p className="text-4xl font-black" style={{ color: "var(--dash-text-primary)" }}>{catalogCount || 0}</p>
          <p className="mt-2 text-[10px] font-medium" style={{ color: "var(--dash-text-secondary)" }}>
            Infraestrutura de exibição
          </p>
        </div>

        {/* Card: Inventário Global */}
        <div className="rounded-3xl border p-6 shadow-sm transition-all hover:shadow-md" style={{ background: "var(--dash-surface)", borderColor: "var(--dash-border)" }}>
          <div className="flex items-center justify-between mb-4">
            <p className="text-xs font-bold uppercase tracking-widest" style={{ color: "var(--dash-text-muted)" }}>Itens Cadastrados</p>
            <div className="h-8 w-8 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-500">
              <LayoutDashboard size={16} />
            </div>
          </div>
          <p className="text-4xl font-black" style={{ color: "var(--dash-text-primary)" }}>{productCount || 0}</p>
          <p className="mt-2 text-[10px] font-medium" style={{ color: "var(--dash-text-secondary)" }}>
            {categoryCount || 0} Categorias globais
          </p>
        </div>
      </div>

      {/* Tabela de Usuários Recentes */}
      <div className="rounded-3xl border shadow-sm overflow-hidden" style={{ background: "var(--dash-surface)", borderColor: "var(--dash-border)" }}>
        <div className="border-b px-8 py-6 flex items-center justify-between" style={{ borderColor: "var(--dash-border)" }}>
          <div>
            <h2 className="text-xl font-bold" style={{ color: "var(--dash-text-primary)" }}>Fluxo de Usuários</h2>
            <p className="text-sm" style={{ color: "var(--dash-text-secondary)" }}>Últimas adesões à plataforma PlataformaCard.</p>
          </div>
        </div>
        <UserList profiles={recentProfiles as any} />
      </div>
    </div>
  );
}