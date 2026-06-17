"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import { motion } from "framer-motion";
import { 
  Package, 
  Eye, 
  MousePointer2, 
  TrendingUp,
  ArrowUpRight,
  ExternalLink,
  ChevronRight,
  MessageCircle
} from "lucide-react";

export default function DashboardPage() {
  const supabase = createClient();
  const [nome, setNome] = useState("");
  const [slug, setSlug] = useState<string | null>(null);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [whatsapp, setWhatsapp] = useState<string | null>(null);
  const [bio, setBio] = useState<string | null>(null);
  const [productCount, setProductCount] = useState<number | null>(null);
  const [sellerCount, setSellerCount] = useState<number | null>(null);
  const [sellers, setSellers] = useState<any[]>([]);
  const [profileViews, setProfileViews] = useState<number | null>(null);
  const [businessModel, setBusinessModel] = useState<"B2B" | "B2C">("B2C");
  const [userRole, setUserRole] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [showUnlinkedWarning, setShowUnlinkedWarning] = useState(false);
  const [showNoWhatsappWarning, setShowNoWhatsappWarning] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) {
          setLoading(false);
          return;
        }

        let { data: profile, error: profError } = await supabase
          .from("profiles")
          .select("id, full_name, slug, organization_id, avatar_url, whatsapp, bio, role")
          .eq("user_id", user.id)
          .maybeSingle();

        // Fallback por e-mail para contas com erro de vínculo
        if (!profile && user.email) {
          const { data: profileByEmail } = await supabase
            .from("profiles")
            .select("id, full_name, slug, organization_id, avatar_url, whatsapp, bio, role")
            .eq("email", user.email)
            .maybeSingle();
          if (profileByEmail) profile = profileByEmail;
        }

        if (profError) {
          console.error("Erro ao carregar perfil no dashboard:", profError);
        }

        if (profile) {
          const shadowOrgId = document.cookie
            .split("; ")
            .find((row) => row.startsWith("shadow_org_id="))
            ?.split("=")[1];

          const isSuperAdmin = profile.role === "superadmin";
          const activeOrgId = (isSuperAdmin && shadowOrgId) ? shadowOrgId : profile.organization_id;

          if (isSuperAdmin && shadowOrgId) {
            const { data: simulatedProfile } = await supabase
              .from("profiles")
              .select("id, full_name, slug, organization_id, avatar_url, whatsapp, bio, role")
              .eq("organization_id", shadowOrgId)
              .in("role", ["b2b_admin", "b2c_admin", "admin"])
              .limit(1)
              .maybeSingle();

            if (simulatedProfile) {
              profile = {
                ...profile,
                id: simulatedProfile.id,
                full_name: simulatedProfile.full_name,
                slug: simulatedProfile.slug,
                organization_id: simulatedProfile.organization_id,
                avatar_url: simulatedProfile.avatar_url,
                whatsapp: simulatedProfile.whatsapp,
                bio: simulatedProfile.bio,
              };
            }
          }

          setNome(profile.full_name ?? "");
          setSlug(profile.slug ?? null);
          setAvatarUrl(profile.avatar_url ?? null);
          setWhatsapp(profile.whatsapp ?? null);
          setBio(profile.bio ?? null);
          setUserRole(profile.role ?? "");

          // Dados dependentes da organização
          if (activeOrgId) {
            // Conta produtos
            const { count: pCount } = await supabase
              .from("products")
              .select("*", { count: "exact", head: true })
              .eq("organization_id", activeOrgId)
              .is("deleted_at", null);
            setProductCount(pCount ?? 0);

            // Dados de Vendedores
            const { data: sData, count: sCount } = await supabase
              .from("profiles")
              .select("id, full_name, slug, avatar_url", { count: "exact" })
              .eq("organization_id", activeOrgId)
              .eq("role", "seller")
              .limit(5);
            
            setSellerCount(sCount ?? 0);
            setSellers(sData ?? []);

            // Buscar modelo de negócio e whatsapp
            const { data: org } = await supabase
              .from("organizations")
              .select("business_model, whatsapp")
              .eq("id", activeOrgId)
              .maybeSingle();
            
            if (org?.business_model) {
              setBusinessModel(org.business_model as "B2B" | "B2C");
            }

            // Warning de WhatsApp
            const hasProfileWhatsapp = !!profile.whatsapp;
            const hasOrgWhatsapp = !!org?.whatsapp;
            const hasPublishedLink = !!profile.slug;
            
            if (hasPublishedLink && !hasProfileWhatsapp && !hasOrgWhatsapp) {
              setShowNoWhatsappWarning(true);
            }

            // Verifica se o catálogo master foi desvinculado
            const { data: orgCatalogs } = await supabase
              .from("organization_catalogs")
              .select("is_enabled, catalogs(catalog_type, deleted_at)")
              .eq("organization_id", activeOrgId);

            const hasActiveMaster = orgCatalogs?.some((c: any) => {
              const cat = Array.isArray(c.catalogs) ? c.catalogs[0] : c.catalogs;
              return c.is_enabled && (cat?.catalog_type === 'platform' || cat?.catalog_type === 'CaaS') && !cat?.deleted_at;
            });

            const hasAnyMaster = orgCatalogs?.some((c: any) => {
              const cat = Array.isArray(c.catalogs) ? c.catalogs[0] : c.catalogs;
              return cat?.catalog_type === 'platform' || cat?.catalog_type === 'CaaS';
            });

            setShowUnlinkedWarning(!hasActiveMaster && !!hasAnyMaster);
          }

          // Visitas via RPC
          try {
            const { data: analytics } = await supabase.rpc(
              "get_profile_analytics_summary",
              { p_profile_id: profile.id }
            );
            if (analytics) {
              const row = Array.isArray(analytics) ? analytics[0] : analytics;
              setProfileViews(Number(row?.profile_views ?? 0));
            }
          } catch (e) {
            console.error("Erro ao carregar analytics:", e);
            setProfileViews(0);
          }
        }
      } catch (err) {
        console.error("Erro no dashboard:", err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [supabase]);

  const stats = [
    {
      label: "Produtos Ativos",
      value: productCount ?? "0",
      icon: Package,
      trend: "+12%",
      color: "emerald",
      bgClass: "bg-emerald-500/10",
      textClass: "text-emerald-500"
    },
    {
      label: "Visualizações",
      value: profileViews ?? "0",
      icon: Eye,
      trend: "+5.4%",
      color: "blue",
      bgClass: "bg-blue-500/10",
      textClass: "text-blue-500"
    },
    {
      label: "Cliques em Links",
      value: "0", // Temporariamente 0 até implementarmos o tracking específico
      icon: MousePointer2,
      trend: "0%",
      color: "violet",
      bgClass: "bg-violet-500/10",
      textClass: "text-violet-500"
    },
    {
      label: "Conversão Est.",
      value: "0%", // Temporariamente 0%
      icon: TrendingUp,
      trend: "0%",
      color: "amber",
      bgClass: "bg-amber-500/10",
      textClass: "text-amber-500"
    }
  ];

  const quickActions = [
    {
      title: "Gerenciar Catálogo",
      desc: "Adicione, edite ou remova produtos do seu card digital.",
      icon: "📦",
      href: "/dashboard/catalogo",
      color: "from-emerald-500/10 to-emerald-500/5"
    },
    {
      title: "Personalizar Perfil",
      desc: "Altere cores, fotos e informações do seu cartão.",
      icon: "👤",
      href: businessModel === "B2C" ? "/dashboard/perfil#cartao" : "/dashboard/perfil#perfil",
      color: "from-blue-500/10 to-blue-500/5"
    },
    {
      title: "Ver Analytics",
      desc: "Entenda o comportamento dos seus clientes.",
      icon: "📊",
      href: "/dashboard/analytics",
      color: "from-violet-500/10 to-violet-500/5"
    },
    ...(businessModel === "B2B" ? [{
      title: "Vendedores",
      desc: "Gerencie sua equipe de vendas e acessos.",
      icon: "👥",
      href: "/dashboard/vendedores",
      color: "from-amber-500/10 to-amber-500/5"
    }] : [])
  ];

  // Lógica do Checklist Dinâmico
  const isB2B = businessModel === "B2B";
  
  const checklist = [
    { 
      label: isB2B ? "Central de Contatos" : "WhatsApp de Vendas", 
      done: !!whatsapp, 
      href: "/dashboard/perfil#cartao" 
    },
    { 
      label: isB2B ? "Catálogo de Produtos" : "Pelo menos 1 Produto", 
      done: (productCount ?? 0) > 0, 
      href: "/dashboard/catalogo" 
    },
    ...(isB2B ? [{
      label: "Cadastrar Vendedores",
      done: (sellerCount ?? 0) > 0,
      href: "/dashboard/vendedores"
    }] : []),
    { 
      label: isB2B ? "Link da Organização" : "Link Personalizado", 
      done: !!slug, 
      href: "/dashboard/perfil#cartao" 
    },
    { 
      label: isB2B ? "Bio da Empresa" : "Bio ou Slogan", 
      done: !!bio, 
      href: "/dashboard/perfil#cartao" 
    },
  ];

  const itemsDone = checklist.filter(i => i.done).length;
  // B2B exige todos os itens para estar pronto (incluindo vendedores)
  const isReady = isB2B ? (itemsDone === checklist.length) : (itemsDone >= 4);
  const progressPercent = Math.round((itemsDone / checklist.length) * 100);

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { y: 20, opacity: 0 },
    show: { y: 0, opacity: 1 }
  };

  return (
    <div className="space-y-10 pb-12">
      {/* Header Section */}
      <section className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-[var(--dash-text-primary)]">
            {nome ? `Olá, ${nome.split(" ")[0]} 👋` : "Dashboard"}
          </h1>
          <p className="text-[var(--dash-text-secondary)]">
            {isB2B ? "Gerencie sua equipe e seu catálogo matriz." : "Aqui está o que está acontecendo com sua plataforma hoje."}
          </p>
        </div>
      </section>

      {/* Warning Banner */}
      {showUnlinkedWarning && (
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-6 rounded-[32px] border border-amber-500/20 bg-amber-500/5 backdrop-blur-md flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
        >
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-500 shrink-0">
              <Package size={24} />
            </div>
            <div>
              <h3 className="font-bold text-base text-amber-800 dark:text-amber-400">
                Catálogo Master Desvinculado
              </h3>
              <p className="text-xs text-amber-700/80 dark:text-amber-400/80 mt-1 leading-relaxed max-w-2xl">
                O catálogo master (CaaS) foi desvinculado ou removido desta franquia. No momento, você não está herdando nenhum produto da franqueadora. Entre em contato com o super administrador para vincular um catálogo.
              </p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Warning WhatsApp */}
      {showNoWhatsappWarning && (
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-6 rounded-[32px] border border-red-500/20 bg-red-500/5 backdrop-blur-md flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
        >
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-2xl bg-red-500/10 flex items-center justify-center text-red-500 shrink-0">
              <MessageCircle size={24} />
            </div>
            <div>
              <h3 className="font-bold text-base text-red-800 dark:text-red-400">
                Atenção: Catálogo sem Contato
              </h3>
              <p className="text-xs text-red-700/80 dark:text-red-400/80 mt-1 leading-relaxed max-w-2xl">
                Seu catálogo está publicado, mas nenhum número de WhatsApp foi configurado! Seus clientes não conseguirão fazer pedidos. 
                {isB2B ? " Configure o WhatsApp Central em Configurações > SEO e Marca, ou no Perfil do vendedor." : " Configure no seu Perfil."}
              </p>
            </div>
          </div>
        </motion.div>
      )}


      {/* KPI Grid */}
      <motion.div 
        variants={container}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4"
      >
        {stats.map((stat, idx) => (
          <motion.div
            key={idx}
            variants={item}
            className="group relative overflow-hidden rounded-2xl border bg-[var(--dash-surface)] p-6 transition-all hover:border-primary/50 hover:shadow-lg"
          >
            <div className="flex items-center justify-between">
              <div className={`rounded-xl p-2.5 ${stat.bgClass} ${stat.textClass}`}>
                <stat.icon size={22} />
              </div>
              <div className="flex items-center gap-1 text-[10px] font-bold text-emerald-500 bg-emerald-500/10 px-2 py-1 rounded-full">
                <ArrowUpRight size={12} />
                {stat.trend}
              </div>
            </div>
            <div className="mt-4">
              <p className="text-sm font-medium text-[var(--dash-text-secondary)]">{stat.label}</p>
              <h3 className="text-2xl font-bold text-[var(--dash-text-primary)] mt-1">
                {loading ? "..." : stat.value}
              </h3>
            </div>
            
            {/* Subtle background glow on hover */}
            <div className="absolute -right-4 -top-4 h-24 w-24 rounded-full bg-primary/5 blur-2xl group-hover:bg-primary/10 transition-all" />
          </motion.div>
        ))}
      </motion.div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Quick Actions */}
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-[var(--dash-text-primary)]">Ações Rápidas</h2>
            <button className="text-sm font-medium text-primary hover:underline">Ver tudo</button>
          </div>
          
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {quickActions.map((action, idx) => (
              <Link 
                key={idx}
                href={action.href}
                className={`group flex items-start gap-4 rounded-2xl border bg-gradient-to-br ${action.color} p-5 transition-all hover:scale-[1.02] hover:shadow-md`}
              >
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[var(--dash-surface)] text-2xl shadow-sm border border-[var(--dash-border)]">
                  {action.icon}
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-[var(--dash-text-primary)] group-hover:text-primary transition-colors">
                    {action.title}
                  </h3>
                  <p className="mt-1 text-sm text-[var(--dash-text-secondary)] line-clamp-2">
                    {action.desc}
                  </p>
                </div>
                <ChevronRight className="mt-1 text-[var(--dash-text-muted)] group-hover:translate-x-1 transition-transform" size={18} />
              </Link>
            ))}
          </div>
        </div>

        {/* System Updates / Equipe (B2B) */}
        <div className="flex flex-col gap-6">
          {isB2B && sellerCount !== null && (
            <div className="rounded-3xl border bg-[var(--dash-surface)] p-6 shadow-sm border-[var(--dash-border)]">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold text-[var(--dash-text-primary)]">Equipe & Mini-sites</h3>
                <Link href="/dashboard/vendedores" className="text-[10px] font-bold text-primary hover:underline">GERENCIAR</Link>
              </div>
              <div className="space-y-3">
                {sellers.length > 0 ? (
                  sellers.map((s) => (
                    <div key={s.id} className="flex items-center justify-between p-2 rounded-xl hover:bg-[var(--dash-hover-bg)] transition-all group">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary font-bold text-xs overflow-hidden border border-primary/20">
                          {s.avatar_url ? <img src={s.avatar_url} className="h-full w-full object-cover" /> : s.full_name?.charAt(0)}
                        </div>
                        <div className="flex flex-col">
                          <span className="text-xs font-bold text-[var(--dash-text-primary)] truncate max-w-[100px]">{s.full_name}</span>
                          <span className="text-[10px] text-[var(--dash-text-muted)] truncate max-w-[100px]">/{s.slug}</span>
                        </div>
                      </div>
                      <Link 
                        href={`/${s.slug}`} 
                        target="_blank"
                        className="p-1.5 rounded-lg bg-[var(--dash-bg)] text-[var(--dash-text-muted)] hover:text-primary hover:bg-primary/10 transition-all opacity-0 group-hover:opacity-100"
                      >
                        <ExternalLink size={14} />
                      </Link>
                    </div>
                  ))
                ) : (
                  <p className="text-[10px] text-[var(--dash-text-muted)] py-4 text-center">Nenhum vendedor cadastrado.</p>
                )}
                {sellerCount > 5 && (
                  <p className="text-[10px] text-center text-[var(--dash-text-muted)] pt-2 border-t border-[var(--dash-border)]">
                    e mais {sellerCount - 5} vendedores...
                  </p>
                )}
              </div>
            </div>
          )}

          <div className="rounded-3xl bg-slate-900 p-8 text-white relative overflow-hidden dark:bg-primary/20 dark:border dark:border-primary/30">
            <div className="relative z-10">
              <span className="inline-block rounded-full bg-primary/20 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-primary">Dica Premium</span>
              <h3 className="mt-4 text-xl font-bold">Aumente suas vendas</h3>
              <p className="mt-2 text-sm text-slate-400">Personalize o link do seu cartão e compartilhe em suas redes sociais para atrair mais clientes.</p>
              <button className="mt-6 flex items-center gap-2 text-sm font-bold text-primary hover:text-primary/80">
                Saber mais <ChevronRight size={16} />
              </button>
            </div>
            
            {/* Abstract Background Design */}
            <div className="absolute -bottom-10 -right-10 h-40 w-40 rounded-full bg-primary opacity-20 blur-3xl" />
            <div className="absolute -top-10 -left-10 h-24 w-24 rounded-full bg-blue-500 opacity-20 blur-2xl" />
          </div>

          <div className="rounded-2xl border border-dashed border-[var(--dash-border)] p-6">
            <h4 className="text-sm font-bold text-[var(--dash-text-primary)] mb-4">Atualizações Recentes</h4>
            <div className="space-y-4">
              {[1, 2].map((i) => (
                <div key={i} className="flex gap-3">
                  <div className="h-2 w-2 mt-1.5 rounded-full bg-primary" />
                  <div>
                    <p className="text-xs font-bold text-[var(--dash-text-primary)]">Novo layout do Dashboard</p>
                    <p className="text-[10px] text-[var(--dash-text-muted)]">Implementamos uma nova navegação vertical...</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}