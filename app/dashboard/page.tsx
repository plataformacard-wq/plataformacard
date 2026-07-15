"use client";

import { useEffect, useState, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Package, 
  Eye, 
  MousePointer2, 
  TrendingUp,
  ArrowUpRight,
  ExternalLink,
  ChevronRight,
  MessageCircle,
  AlertTriangle,
  Calendar,
  Settings,
  BarChart2
} from "lucide-react";
import { getNationalHolidaysFull } from "@/lib/utils/holidays";
import StockIntelligenceSection from "@/components/dashboard/StockIntelligenceSection";
import DashboardAlerts from "@/components/dashboard/home/DashboardAlerts";
import DashboardKpiGrid from "@/components/dashboard/home/DashboardKpiGrid";
import DashboardQuickActions from "@/components/dashboard/home/DashboardQuickActions";
import DashboardTeamList from "@/components/dashboard/home/DashboardTeamList";

export default function DashboardPage() {
  const supabase = createClient();
  const [nome, setNome] = useState("");
  const [slug, setSlug] = useState<string | null>(null);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [whatsapp, setWhatsapp] = useState<string | null>(null);
  const [hasValidWhatsapp, setHasValidWhatsapp] = useState(false);
  const [bio, setBio] = useState<string | null>(null);
  const [productCount, setProductCount] = useState<number | null>(null);
  const [sellerCount, setSellerCount] = useState<number | null>(null);
  const [sellers, setSellers] = useState<any[]>([]);
  const [profileViews, setProfileViews] = useState<number | null>(null);
  const [businessModel, setBusinessModel] = useState<"B2B" | "B2C" | "CaaS" | "ALL_SERVICE">("B2C");
  const isCaaS = businessModel === "CaaS";
  const [userRole, setUserRole] = useState<string>("");
  const isB2B = businessModel === "B2B" || (!isCaaS && userRole === "b2b_admin");
  const [loading, setLoading] = useState(true);
  const [showNoWhatsappWarning, setShowNoWhatsappWarning] = useState(false);
  const [orgName, setOrgName] = useState<string | null>(null);
  const [hasActiveMasterState, setHasActiveMasterState] = useState(false);
  const [hasOwnedMasterState, setHasOwnedMasterState] = useState(false);
  const [hasSellersWithoutPhoto, setHasSellersWithoutPhoto] = useState(false);
  
  // Feriados e Alertas
  const [customAlerts, setCustomAlerts] = useState<any[]>([]);
  const [upcomingHoliday, setUpcomingHoliday] = useState<{ date: string, name: string } | null>(null);
  const [processingHolidayDecision, setProcessingHolidayDecision] = useState(false);
  const [profileData, setProfileData] = useState<any>(null);

  // Estoque Inteligente
  const [hasBlingConnection, setHasBlingConnection] = useState(false);

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
          .select("id, full_name, slug, organization_id, avatar_url, whatsapp, bio, role, custom_business_hours")
          .eq("user_id", user.id)
          .maybeSingle();

        // Fallback por e-mail para contas com erro de vínculo
        if (!profile && user.email) {
          const { data: profileByEmail } = await supabase
            .from("profiles")
            .select("id, full_name, slug, organization_id, avatar_url, whatsapp, bio, role, custom_business_hours")
            .eq("email", user.email)
            .maybeSingle();
          if (profileByEmail) profile = profileByEmail;
        }

        if (profError) {
          console.error("Erro ao carregar perfil no dashboard:", profError);
        }

        if (profile) {
          setProfileData(profile);
          const shadowOrgId = document.cookie
            .split("; ")
            .find((row) => row.startsWith("shadow_org_id="))
            ?.split("=")[1];

          const isSuperAdmin = profile.role === "main_admin";
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

          const displayName = user.user_metadata?.full_name || profile.full_name || "";
          setNome(displayName);
          setSlug(profile.slug ?? null);
          setAvatarUrl(profile.avatar_url ?? null);
          setWhatsapp(profile.whatsapp ?? null);
          setBio(profile.bio ?? null);
          setUserRole(profile.role ?? "");
          setProfileData(profile);

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
            setHasSellersWithoutPhoto((sData ?? []).some(s => !s.avatar_url));

            // Buscar modelo de negócio e whatsapp
            const { data: org } = await supabase
              .from("organizations")
              .select("name, business_model, whatsapp, business_hours, bling_access_token, low_stock_threshold")
              .eq("id", activeOrgId)
              .maybeSingle();
            
            if (org?.business_model) {
              setBusinessModel(org.business_model as "B2B" | "B2C" | "CaaS" | "ALL_SERVICE");
            }
            if (org?.name) {
              setOrgName(org.name);
            }
            if (org?.bling_access_token) setHasBlingConnection(true);

            // Avisos e Feriados
            const orgBusinessHours = org?.business_hours as any;

            if (orgBusinessHours?.holiday_settings?.autoCloseOnNationalHolidays) {
              const today = new Date();
              const maxSearchWindow = new Date(today);
              maxSearchWindow.setDate(today.getDate() + 60);
              
              const currentYear = today.getFullYear();
              const holidaysFull = await getNationalHolidaysFull(currentYear);
              
              const customDates = orgBusinessHours.holiday_settings.customDates || [];
              const customHolidaysFull = customDates.map((d: string) => ({ date: d, name: "Feriado Local / Recesso", type: "custom" }));
              
              const allHolidays = [...holidaysFull, ...customHolidaysFull].sort((a, b) => new Date(`${a.date}T12:00:00Z`).getTime() - new Date(`${b.date}T12:00:00Z`).getTime());
              
              const upcoming = allHolidays.find(h => {
                const hDate = new Date(`${h.date}T12:00:00Z`);
                return hDate >= today && hDate <= maxSearchWindow;
              });

              if (upcoming) {
                const hDate = new Date(`${upcoming.date}T12:00:00Z`);
                const diffTime = hDate.getTime() - today.getTime();
                const daysToHoliday = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

                // Lógica Sequencial dos Alertas
                if (orgBusinessHours.custom_alerts && orgBusinessHours.custom_alerts.length > 0) {
                  const triggeredAlerts = orgBusinessHours.custom_alerts.filter((a: any) => {
                    const adv = a.advanceDays ?? 7;
                    return daysToHoliday <= adv;
                  });

                  if (triggeredAlerts.length > 0) {
                    const mostUrgentAlert = triggeredAlerts.reduce((prev: any, current: any) => {
                      const prevAdv = prev.advanceDays ?? 7;
                      const currAdv = current.advanceDays ?? 7;
                      return (prevAdv < currAdv) ? prev : current;
                    });
                    setCustomAlerts([mostUrgentAlert]);
                  } else {
                    setCustomAlerts([]);
                  }
                }

                // Lógica do Card de Decisão (Fixo em 7 dias ou menos)
                if (daysToHoliday <= 7) {
                  const decisions = profile.custom_business_hours?.holiday_decisions || [];
                  const decided = decisions.find((d: any) => d.date === upcoming.date);
                  if (!decided) {
                    setUpcomingHoliday(upcoming);
                  }
                }
              } else {
                setCustomAlerts([]);
              }
            } else {
              setCustomAlerts([]);
            }

            // Warning de WhatsApp e Catálogo Vazio
            const hasProfileWhatsapp = !!profile.whatsapp;
            const hasOrgWhatsapp = !!org?.whatsapp;
            const hasPublishedLink = !!profile.slug;
            
            // In B2B or CaaS, org whatsapp is valid. In B2C, org whatsapp might also be valid.
            const validWhatsapp = hasProfileWhatsapp || hasOrgWhatsapp;
            setHasValidWhatsapp(validWhatsapp);
            
            // Verifica se o catálogo franquias foi desvinculado/vinculado antes dos banners
            const { data: orgCatalogs } = await supabase
              .from("organization_catalogs")
              .select("is_enabled, catalogs(organization_id, catalog_type, deleted_at)")
              .eq("organization_id", activeOrgId);

            const hasActiveMaster = orgCatalogs?.some((c: any) => {
              const cat = Array.isArray(c.catalogs) ? c.catalogs[0] : c.catalogs;
              const isOwner = cat?.organization_id === activeOrgId;
              return c.is_enabled && (cat?.catalog_type === 'platform' || cat?.catalog_type === 'CaaS') && !cat?.deleted_at && !isOwner;
            }) || false;

            const hasOwnedMaster = orgCatalogs?.some((c: any) => {
              const cat = Array.isArray(c.catalogs) ? c.catalogs[0] : c.catalogs;
              const isOwner = cat?.organization_id === activeOrgId;
              return c.is_enabled && (cat?.catalog_type === 'platform' || cat?.catalog_type === 'CaaS') && !cat?.deleted_at && isOwner;
            }) || false;

            const hasAnyMaster = orgCatalogs?.some((c: any) => {
              const cat = Array.isArray(c.catalogs) ? c.catalogs[0] : c.catalogs;
              return cat?.catalog_type === 'platform' || cat?.catalog_type === 'CaaS';
            }) || false;
            
            setHasActiveMasterState(hasActiveMaster);
            setHasOwnedMasterState(hasOwnedMaster);

            const currentIsB2B = org?.business_model === 'B2B' || (org?.business_model !== 'CaaS' && profile.role === 'b2b_admin');
            
            const b2bNeedsSellers = currentIsB2B && (sCount ?? 0) === 0;
            const b2cNeedsWhatsapp = !currentIsB2B && hasPublishedLink && !validWhatsapp;

            if (b2bNeedsSellers || b2cNeedsWhatsapp) {
              setShowNoWhatsappWarning(true);
            }
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

  async function handleHolidayDecision(date: string, work: boolean) {
    if (!profileData) return;
    setProcessingHolidayDecision(true);
    
    try {
      const currentHours = profileData.custom_business_hours as any || {};
      const decisions = currentHours.holiday_decisions || [];
      const updatedDecisions = [...decisions.filter((d: any) => d.date !== date), { date, work }];
      
      const { error } = await supabase
        .from("profiles")
        .update({
          custom_business_hours: {
            ...currentHours,
            holiday_decisions: updatedDecisions
          }
        })
        .eq("id", profileData.id);
        
      if (error) throw error;
      setUpcomingHoliday(null);
    } catch (e) {
      console.error(e);
      alert("Erro ao salvar decisão de feriado.");
    } finally {
      setProcessingHolidayDecision(false);
    }
  }

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
      desc: isCaaS ? "Adicione, edite ou remova produtos do seu catálogo." : "Adicione, edite ou remova produtos do seu card digital.",
      icon: "📦",
      href: "/dashboard/catalogo",
      color: "from-emerald-500/10 to-emerald-500/5"
    },
    ...(businessModel !== "CaaS" ? [{
      title: "Personalizar Perfil",
      desc: "Altere cores, fotos e informações do seu cartão.",
      icon: "👤",
      href: businessModel === "B2C" ? "/dashboard/perfil#cartao" : "/dashboard/perfil#perfil",
      color: "from-blue-500/10 to-blue-500/5"
    }] : []),
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

  // Lógica do Progresso Dinâmico (Core 3 pillars for publishing)
  const coreChecklist = [
    { 
      label: isB2B ? "Link da Empresa" : "Link do Perfil", 
      done: !!slug, 
      href: "/dashboard/perfil#cartao",
      icon: "🔗"
    },
    { 
      label: isB2B ? "Equipe de Vendas" : "WhatsApp de Vendas", 
      done: isB2B ? (sellerCount ?? 0) > 0 : hasValidWhatsapp,
      href: isB2B ? "/dashboard/vendedores" : "/dashboard/perfil#cartao",
      icon: isB2B ? "👥" : "📱"
    },
    { 
      label: hasActiveMasterState ? "Catálogo Ativo (Herdado)" : "Pelo menos 1 Produto", 
      done: (productCount ?? 0) > 0 || hasActiveMasterState, 
      href: "/dashboard/catalogo",
      icon: "📦"
    }
  ];

  const itemsDone = coreChecklist.filter(i => i.done).length;
  const isReady = itemsDone === coreChecklist.length;
  const progressPercent = Math.round((itemsDone / coreChecklist.length) * 100);

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
            {nome ? `Olá, ${nome} 👋` : "Dashboard"}
          </h1>
          <p className="text-[var(--dash-text-secondary)]">
            {isB2B ? "Gerencie sua equipe e seu catálogo matriz." : isCaaS ? "Gerencie seus produtos e vendas do seu catálogo CaaS." : "Aqui está o que está acontecendo com sua plataforma hoje."}
          </p>
        </div>
      </section>

      <DashboardAlerts 
        hasActiveMasterState={hasActiveMasterState}
        hasOwnedMasterState={hasOwnedMasterState}
        customAlerts={customAlerts}
        upcomingHoliday={upcomingHoliday}
        handleHolidayDecision={handleHolidayDecision}
        processingHolidayDecision={processingHolidayDecision}
        showNoWhatsappWarning={showNoWhatsappWarning}
        isB2B={isB2B}
        sellerCount={sellerCount}
        isReady={isReady}
        progressPercent={progressPercent}
        coreChecklist={coreChecklist}
        avatarUrl={avatarUrl}
        hasSellersWithoutPhoto={hasSellersWithoutPhoto}
        isCaaS={isCaaS}
      />


      {/* KPI Grid */}
      <DashboardKpiGrid stats={stats} loading={loading} />

      {/* Inteligência de Estoque */}
      <StockIntelligenceSection activeOrgId={profileData?.organization_id} hasBlingConnection={hasBlingConnection} />

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <DashboardQuickActions quickActions={quickActions} />

        {/* System Updates / Equipe (B2B) */}
        <div className="flex flex-col gap-6">
          {isB2B && sellerCount !== null && (
            <DashboardTeamList sellers={sellers} sellerCount={sellerCount} />
          )}

          <div className="rounded-3xl bg-slate-900 p-8 text-white relative overflow-hidden dark:bg-primary/20 dark:border dark:border-primary/30">
            <div className="relative z-10">
              <span className="inline-block rounded-full bg-primary/20 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-primary">Dica Premium</span>
              <h3 className="mt-4 text-xl font-bold">Aumente suas vendas</h3>
              <p className="mt-2 text-sm text-slate-400">Personalize o link do seu {isCaaS ? 'catálogo' : 'cartão'} e compartilhe em suas redes sociais para atrair mais clientes.</p>
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