import { createClient } from "@/lib/supabase/server";
import { getInviteCode } from "@/lib/admin-actions";
import ClientList from "./clientes/ClientList";
import { 
  Building2, 
  Users, 
  LayoutDashboard, 
  ShieldCheck, 
  BookOpen, 
  Globe, 
  Zap, 
  TrendingUp,
  CreditCard
} from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const supabase = await createClient();
  const currentBetaCode = await getInviteCode();

  // 1. Métricas Globais
  const { count: orgCount } = await supabase.from("organizations").select("*", { count: "exact", head: true }).neq("name", "Start - Super Admin");
  const { count: productCount } = await supabase.from("products").select("*", { count: "exact", head: true }).is("deleted_at", null);
  const { count: catalogCount } = await supabase.from("catalogs").select("*", { count: "exact", head: true });

  // 2. BI Segmentado por Modelo
  const { count: b2bCount } = await supabase.from("organizations").select("*", { count: "exact", head: true }).eq("business_model", "B2B").neq("name", "Start - Super Admin");
  const { count: b2cCount } = await supabase.from("organizations").select("*", { count: "exact", head: true }).eq("business_model", "B2C");
  const { count: caasCount } = await supabase.from("organizations").select("*", { count: "exact", head: true }).eq("business_model", "CaaS");
  const { count: allServiceCount } = await supabase.from("organizations").select("*", { count: "exact", head: true }).eq("business_model", "ALL_SERVICE");

  // 3. BI por Plano
  const { count: starterCount } = await supabase.from("organizations").select("*", { count: "exact", head: true }).eq("plan_id", "32c7b8a2-2bf7-43dd-b1a6-5706566fbfd0");
  const { count: proCount } = await supabase.from("organizations").select("*", { count: "exact", head: true }).eq("plan_id", "6f3dfe4e-905c-486e-923f-2cfb6e5d3e62");
  const { count: enterpriseCount } = await supabase.from("organizations").select("*", { count: "exact", head: true }).eq("plan_id", "d35c09c2-51a0-4f38-b5d9-dcc3526e7d26");

  // Recent profiles
  const { data: recentProfiles } = await supabase
    .from("profiles")
    .select(`id, full_name, slug, role, created_at, organization_id, organizations ( id, name, internal_name, business_model )`)
    .neq("role", "main_admin")
    .neq("role", "seller")
    .order("created_at", { ascending: false })
    .limit(10);

  // Organizations for the list
  const { data: organizations } = await supabase
    .from("organizations")
    .select("id, name, internal_name, slug, business_model, created_at, plan_id")
    .neq("name", "Start - Super Admin")
    .order("created_at", { ascending: false });

  return (
    <div className="space-y-10">
      {/* Header Estratégico */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold" style={{ color: "var(--dash-text-primary)" }}>Centro de Inteligência</h1>
          <p className="mt-2 text-sm" style={{ color: "var(--dash-text-secondary)" }}>
            Visão estratégica da plataforma. Monitore o crescimento e a saúde dos modelos de negócio.
          </p>
        </div>

        <div className="bg-[var(--dash-surface)] border border-[var(--dash-border)] px-5 py-3 rounded-lg flex items-center gap-3">
          <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
          <div className="flex flex-col">
            <span className="text-[10px] font-black uppercase tracking-widest text-emerald-500">Operação em Tempo Real</span>
            <span className="text-xs font-bold" style={{ color: "var(--dash-text-primary)" }}>Beta Ativo: {currentBetaCode}</span>
          </div>
        </div>
      </div>

      {/* Grid BI de Performance (Principais Modelos) */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
         {/* B2B Segment */}
         <div className="rounded-[32px] border p-8 flex flex-col justify-between group hover:border-blue-500/30 transition-all" style={{ background: "var(--dash-surface)", borderColor: "var(--dash-border)" }}>
           <div>
             <div className="flex items-center gap-3 mb-6">
               <div className="h-12 w-12 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-500">
                 <Building2 size={24} />
               </div>
               <div>
                 <p className="text-xs font-bold uppercase tracking-widest" style={{ color: "var(--dash-text-muted)" }}>Modelo Empresarial</p>
                 <h3 className="text-xl font-black text-blue-500">B2B Business</h3>
               </div>
             </div>
             <p className="text-5xl font-black mb-2" style={{ color: "var(--dash-text-primary)" }}>{b2bCount || 0}</p>
             <p className="text-xs font-bold" style={{ color: "var(--dash-text-secondary)" }}>Empresas com equipe de vendas</p>
           </div>
           <div className="mt-8 pt-6 border-t border-dashed" style={{ borderColor: "var(--dash-border)" }}>
              <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-[var(--dash-text-muted)]">
                 <span>Penetração de Mercado</span>
                 <span className="text-blue-500">{orgCount ? Math.round((b2bCount || 0) / orgCount * 100) : 0}%</span>
              </div>
              <div className="mt-2 h-1.5 w-full bg-[var(--dash-bg)] rounded-full overflow-hidden">
                 <div className="h-full bg-blue-500 rounded-full" style={{ width: `${orgCount ? (b2bCount || 0) / orgCount * 100 : 0}%` }} />
              </div>
           </div>
         </div>

         {/* B2C Segment */}
         <div className="rounded-[32px] border p-8 flex flex-col justify-between group hover:border-emerald-500/30 transition-all" style={{ background: "var(--dash-surface)", borderColor: "var(--dash-border)" }}>
           <div>
             <div className="flex items-center gap-3 mb-6">
               <div className="h-12 w-12 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                 <Users size={24} />
               </div>
               <div>
                 <p className="text-xs font-bold uppercase tracking-widest" style={{ color: "var(--dash-text-muted)" }}>Modelo Pessoal</p>
                 <h3 className="text-xl font-black text-emerald-500">B2C Digital</h3>
               </div>
             </div>
             <p className="text-5xl font-black mb-2" style={{ color: "var(--dash-text-primary)" }}>{b2cCount || 0}</p>
             <p className="text-xs font-bold" style={{ color: "var(--dash-text-secondary)" }}>Usuários com perfis individuais</p>
           </div>
           <div className="mt-8 pt-6 border-t border-dashed" style={{ borderColor: "var(--dash-border)" }}>
              <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-[var(--dash-text-muted)]">
                 <span>Penetração de Mercado</span>
                 <span className="text-emerald-500">{orgCount ? Math.round((b2cCount || 0) / orgCount * 100) : 0}%</span>
              </div>
              <div className="mt-2 h-1.5 w-full bg-[var(--dash-bg)] rounded-full overflow-hidden">
                 <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${orgCount ? (b2cCount || 0) / orgCount * 100 : 0}%` }} />
              </div>
           </div>
         </div>

         {/* CaaS Segment */}
         <div className="rounded-[32px] border p-8 flex flex-col justify-between group hover:border-purple-500/30 transition-all" style={{ background: "var(--dash-surface)", borderColor: "var(--dash-border)" }}>
           <div>
             <div className="flex items-center gap-3 mb-6">
               <div className="h-12 w-12 rounded-lg bg-purple-500/10 flex items-center justify-center text-purple-500">
                 <Globe size={24} />
               </div>
               <div>
                 <p className="text-xs font-bold uppercase tracking-widest" style={{ color: "var(--dash-text-muted)" }}>Infraestrutura</p>
                 <h3 className="text-xl font-black text-purple-500">CaaS / Vitrine</h3>
               </div>
             </div>
             <p className="text-5xl font-black mb-2" style={{ color: "var(--dash-text-primary)" }}>{caasCount || 0}</p>
             <p className="text-xs font-bold" style={{ color: "var(--dash-text-secondary)" }}>Catálogos implementados via API/iFrame</p>
           </div>
           <div className="mt-8 pt-6 border-t border-dashed" style={{ borderColor: "var(--dash-border)" }}>
              <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-[var(--dash-text-muted)]">
                 <span>Penetração de Mercado</span>
                 <span className="text-purple-500">{orgCount ? Math.round((caasCount || 0) / orgCount * 100) : 0}%</span>
              </div>
              <div className="mt-2 h-1.5 w-full bg-[var(--dash-bg)] rounded-full overflow-hidden">
                 <div className="h-full bg-purple-500 rounded-full" style={{ width: `${orgCount ? (caasCount || 0) / orgCount * 100 : 0}%` }} />
              </div>
           </div>
         </div>

        {/* All Service Segment */}
         <div className="rounded-[32px] border p-8 flex flex-col justify-between group hover:border-zinc-500/30 transition-all" style={{ background: "var(--dash-surface)", borderColor: "var(--dash-border)" }}>
           <div>
             <div className="flex items-center gap-3 mb-6">
               <div className="h-12 w-12 rounded-lg bg-zinc-900/10 flex items-center justify-center text-zinc-900 dark:text-white">
                 <Building2 size={24} />
               </div>
               <div>
                 <p className="text-xs font-bold uppercase tracking-widest" style={{ color: "var(--dash-text-muted)" }}>Solução Completa</p>
                 <h3 className="text-xl font-black text-zinc-900 dark:text-white">All Service</h3>
               </div>
             </div>
             <p className="text-5xl font-black mb-2" style={{ color: "var(--dash-text-primary)" }}>{allServiceCount || 0}</p>
             <p className="text-xs font-bold" style={{ color: "var(--dash-text-secondary)" }}>B2B, B2C e CaaS integrados</p>
           </div>
           <div className="mt-8 pt-6 border-t border-dashed" style={{ borderColor: "var(--dash-border)" }}>
              <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-[var(--dash-text-muted)]">
                 <span>Penetração de Mercado</span>
                 <span className="text-zinc-900 dark:text-white">{orgCount ? Math.round((allServiceCount || 0) / orgCount * 100) : 0}%</span>
              </div>
              <div className="mt-2 h-1.5 w-full bg-[var(--dash-bg)] rounded-full overflow-hidden">
                 <div className="h-full bg-zinc-900 rounded-full" style={{ width: `${orgCount ? (allServiceCount || 0) / orgCount * 100 : 0}%` }} />
              </div>
           </div>
         </div>
      </div>

      {/* Grid de Planos e Infraestrutura */}
      <div className="grid gap-6 md:grid-cols-4">
          {/* Starter Plan */}
          <div className="bg-[var(--dash-surface)] p-6 rounded-xl border border-[var(--dash-border)]">
             <div className="flex items-center gap-3 mb-4">
                <div className="h-8 w-8 rounded-lg bg-zinc-500/10 flex items-center justify-center text-zinc-500"><CreditCard size={16} /></div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--dash-text-muted)]">Plano Starter</p>
             </div>
             <p className="text-3xl font-black" style={{ color: "var(--dash-text-primary)" }}>{starterCount || 0}</p>
          </div>
          {/* Pro Plan */}
          <div className="bg-[var(--dash-surface)] p-6 rounded-xl border border-[var(--dash-border)]">
             <div className="flex items-center gap-3 mb-4">
                <div className="h-8 w-8 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-500"><Zap size={16} /></div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--dash-text-muted)]">Plano Pro</p>
             </div>
             <p className="text-3xl font-black text-blue-500">{proCount || 0}</p>
          </div>
          {/* Enterprise Plan */}
          <div className="bg-[var(--dash-surface)] p-6 rounded-xl border border-[var(--dash-border)]">
             <div className="flex items-center gap-3 mb-4">
                <div className="h-8 w-8 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-500"><TrendingUp size={16} /></div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--dash-text-muted)]">Plano Master</p>
             </div>
             <p className="text-3xl font-black text-amber-500">{enterpriseCount || 0}</p>
          </div>
          {/* Infra Global */}
          <div className="bg-[var(--dash-surface)] p-6 rounded-xl border border-[var(--dash-border)]">
             <div className="flex items-center gap-3 mb-4">
                <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary"><LayoutDashboard size={16} /></div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--dash-text-muted)]">Infra Global</p>
             </div>
             <p className="text-3xl font-black" style={{ color: "var(--dash-text-primary)" }}>{productCount || 0}</p>
             <p className="text-[10px] font-bold text-[var(--dash-text-muted)] mt-1">{catalogCount || 0} vitrines ativas</p>
          </div>
      </div>

      {/* Gestão de Empresas SaaS */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold" style={{ color: "var(--dash-text-primary)" }}>Gestão de Empresas SaaS</h2>
            <p className="text-sm" style={{ color: "var(--dash-text-secondary)" }}>Acesso total ao Raio-X de cada organização e controle de licenças.</p>
          </div>
        </div>
        <ClientList organizations={organizations || []} />
      </div>
    </div>
  );
}