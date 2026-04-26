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
  ChevronRight
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
  const [businessModel, setBusinessModel] = useState<"B2B" | "B2C">("B2B");
  const [loading, setLoading] = useState(true);

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

        const { data: profile } = await supabase
          .from("profiles")
          .select("id, full_name, slug, organization_id, avatar_url, whatsapp, bio")
          .eq("user_id", user.id)
          .maybeSingle();

        if (profile) {
          setNome(profile.full_name ?? "");
          setSlug(profile.slug ?? null);
          setAvatarUrl(profile.avatar_url ?? null);
          setWhatsapp(profile.whatsapp ?? null);
          setBio(profile.bio ?? null);

          // Conta produtos
          const { count: pCount } = await supabase
            .from("products")
            .select("*", { count: "exact", head: true })
            .eq("organization_id", profile.organization_id)
            .is("deleted_at", null);
          setProductCount(pCount ?? 0);

          // Dados de Vendedores (Se for B2B)
          const { data: sData, count: sCount } = await supabase
            .from("profiles")
            .select("id, full_name, slug, avatar_url", { count: "exact" })
            .eq("organization_id", profile.organization_id)
            .eq("role", "seller")
            .limit(5);
          
          setSellerCount(sCount ?? 0);
          setSellers(sData ?? []);

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
          // Buscar modelo de negócio
          if (profile.organization_id) {
            const { data: org } = await supabase
              .from("organizations")
              .select("business_model")
              .eq("id", profile.organization_id)
              .maybeSingle();
            
            if (org?.business_model) {
              setBusinessModel(org.business_model as "B2B" | "B2C");
            }
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
      value: "842",
      icon: MousePointer2,
      trend: "+18%",
      color: "violet",
      bgClass: "bg-violet-500/10",
      textClass: "text-violet-500"
    },
    {
      label: "Conversão Est.",
      value: "3.2%",
      icon: TrendingUp,
      trend: "+2.1%",
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

      {/* Condicional: Checklist ou Spearhead Card */}
      {!loading && (
        <div className="grid grid-cols-1 gap-6">
          {isReady ? (
            /* Card de Sucesso (Ponta de Lança) */
            <motion.div 
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-600 to-teal-700 p-8 text-white shadow-2xl shadow-emerald-500/20"
            >
              <div className="relative z-10 flex flex-col items-start justify-between gap-6 md:flex-row md:items-center">
                <div className="space-y-2">
                  <div className="inline-flex items-center gap-2 rounded-full bg-white/20 px-3 py-1 text-[10px] font-bold uppercase tracking-widest backdrop-blur-md">
                    <div className="h-1.5 w-1.5 rounded-full bg-emerald-300 animate-pulse" />
                    {isB2B ? "Catálogo Matriz Online" : "Seu Cartão está Online"}
                  </div>
                  <h2 className="text-2xl md:text-3xl font-black tracking-tight">
                    {isB2B ? "Sua empresa está pronta para vender!" : "Pronto para compartilhar e vender!"}
                  </h2>
                  <p className="max-w-md text-emerald-50 text-sm font-medium opacity-90">
                    {isB2B 
                      ? `Sua estrutura está montada com ${sellerCount} vendedores ativos e ${productCount} produtos.`
                      : "Seu catálogo digital Maj está configurado e acessível para seus clientes em qualquer lugar do mundo."
                    }
                  </p>
                </div>
                
                {slug && (
                  <Link 
                    href={`/${slug}`}
                    target="_blank"
                    className="group flex items-center gap-3 rounded-2xl bg-white px-6 py-4 text-emerald-700 shadow-xl transition-all hover:scale-105 active:scale-95"
                  >
                    <span className="text-lg font-black uppercase tracking-tight">
                      {isB2B ? "Ver Vitrine da Empresa" : "Ver meu Cartão"}
                    </span>
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 group-hover:rotate-12 transition-transform">
                      <ExternalLink size={18} />
                    </div>
                  </Link>
                )}
              </div>

              <div className="absolute -right-10 -top-10 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
              <div className="absolute -bottom-20 -left-20 h-80 w-80 rounded-full bg-emerald-400/10 blur-3xl" />
            </motion.div>
          ) : (
            /* Launch Checklist Card */
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-3xl border bg-[var(--dash-surface)] p-8 shadow-sm"
              style={{ borderColor: "var(--dash-border)" }}
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="space-y-2">
                  <span className="text-[10px] font-black uppercase tracking-widest text-primary">Configuração Inicial</span>
                  <h2 className="text-2xl font-bold text-[var(--dash-text-primary)]">Falta pouco para o seu lançamento!</h2>
                  <p className="text-sm text-[var(--dash-text-secondary)]">Complete os itens abaixo para garantir uma experiência premium aos seus clientes.</p>
                </div>
                
                <div className="flex flex-col items-end gap-2">
                  <span className="text-sm font-bold text-[var(--dash-text-primary)]">{progressPercent}% Concluído</span>
                  <div className="h-2 w-48 rounded-full bg-[var(--dash-border)] overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${progressPercent}%` }}
                      className="h-full bg-primary"
                    />
                  </div>
                </div>
              </div>

              <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {checklist.map((item, idx) => (
                  <Link 
                    key={idx}
                    href={item.href}
                    className={`flex items-center justify-between rounded-2xl border p-4 transition-all hover:shadow-md ${
                      item.done 
                        ? "bg-emerald-500/5 border-emerald-500/20 text-emerald-500" 
                        : "bg-[var(--dash-bg)] border-[var(--dash-border)] text-[var(--dash-text-secondary)] opacity-80 hover:opacity-100"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`flex h-6 w-6 items-center justify-center rounded-full border ${item.done ? "bg-emerald-500 border-emerald-500 text-white" : "border-[var(--dash-border)]"}`}>
                        {item.done ? "✓" : ""}
                      </div>
                      <span className="text-sm font-bold">{item.label}</span>
                    </div>
                    {!item.done && <ChevronRight size={16} />}
                  </Link>
                ))}
              </div>
            </motion.div>
          )}
        </div>
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
        ))}StatCard
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