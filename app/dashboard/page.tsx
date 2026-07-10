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
import StockThresholdModal from "@/components/dashboard/StockThresholdModal";

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
  const [stockStats, setStockStats] = useState<{ total: number; inStock: number; outOfStock: number }>({ total: 0, inStock: 0, outOfStock: 0 });
  const [topCategories, setTopCategories] = useState<{ name: string; total: number; outOfStock: number }[]>([]);
  const [lowStockProducts, setLowStockProducts] = useState<any[]>([]);
  const [lowStockThreshold, setLowStockThreshold] = useState<number>(5);
  const [isStockModalOpen, setIsStockModalOpen] = useState(false);
  const allProductsForFilterRef = useRef<any[]>([]);

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
            if (org?.low_stock_threshold !== undefined && org?.low_stock_threshold !== null) {
              setLowStockThreshold(org.low_stock_threshold);
            }

            // Busca Inteligência de Estoque
            const { data: allProducts, error: apError } = await supabase
              .from("products")
              .select("id, name, sku, is_in_stock, stock_quantity, categories(name)")
              .eq("organization_id", activeOrgId)
              .is("deleted_at", null);
              
            if (apError) {
              console.error("Erro ao buscar produtos para estoque:", apError);
            }

            if (allProducts && allProducts.length > 0) {
              allProductsForFilterRef.current = allProducts;
              const inStock = allProducts.filter(p => p.is_in_stock).length;
              const outOfStock = allProducts.filter(p => p.is_in_stock === false || (p.is_in_stock === null && p.stock_quantity === 0)).length;
              setStockStats({ total: allProducts.length, inStock, outOfStock });

              // Agrupamento por categoria
              const catMap: Record<string, { total: number; outOfStock: number }> = {};
              allProducts.forEach((p: any) => {
                const c = p.categories ? (Array.isArray(p.categories) ? p.categories[0]?.name : p.categories.name) : "Sem Categoria";
                const catName = c || "Sem Categoria";
                if (!catMap[catName]) catMap[catName] = { total: 0, outOfStock: 0 };
                catMap[catName].total++;
                if (p.is_in_stock === false || (p.is_in_stock === null && p.stock_quantity === 0)) {
                  catMap[catName].outOfStock++;
                }
              });

              const catArray = Object.keys(catMap).map(k => ({ name: k, total: catMap[k].total, outOfStock: catMap[k].outOfStock }));
              // Ordena pelas categorias com MAIS PRODUTOS NO TOTAL
              catArray.sort((a, b) => b.total - a.total);
              setTopCategories(catArray.slice(0, 5));

              // Alertas de estoque baixo
              const currentThreshold = org?.low_stock_threshold ?? 5;
              const low = allProducts.filter(p => p.stock_quantity !== null && p.stock_quantity <= currentThreshold);
              // Sort by quantity ascending
              low.sort((a, b) => (a.stock_quantity || 0) - (b.stock_quantity || 0));
              setLowStockProducts(low.slice(0, 10)); // max 10 to not overflow
            }

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

      {/* Permanent Catalog Status Banner */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`p-6 rounded-[32px] border backdrop-blur-md flex flex-col md:flex-row items-start md:items-center justify-between gap-4 ${
          hasActiveMasterState 
            ? "border-purple-500/20 bg-purple-500/5"
            : hasOwnedMasterState
            ? "border-blue-500/20 bg-blue-500/5"
            : "border-emerald-500/20 bg-emerald-500/5"
        }`}
      >
        <div className="flex items-center gap-4">
          <div className={`h-12 w-12 rounded-2xl flex items-center justify-center shrink-0 ${
            hasActiveMasterState 
              ? "bg-purple-500/10 text-purple-600 dark:text-purple-400"
              : hasOwnedMasterState
              ? "bg-blue-500/10 text-blue-600 dark:text-blue-400"
              : "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
          }`}>
            <Package size={24} />
          </div>
          <div>
            <h3 className={`font-bold text-base ${
              hasActiveMasterState ? "text-purple-800 dark:text-purple-400" : hasOwnedMasterState ? "text-blue-800 dark:text-blue-400" : "text-emerald-800 dark:text-emerald-400"
            }`}>
              {hasActiveMasterState ? "Operando com Catálogo Franqueado" : hasOwnedMasterState ? "Operando com Catálogo Matriz" : "Operando com Catálogo Próprio"}
            </h3>
            <p className={`text-xs mt-1 leading-relaxed max-w-2xl ${
              hasActiveMasterState ? "text-purple-700/80 dark:text-purple-400/80" : hasOwnedMasterState ? "text-blue-700/80 dark:text-blue-400/80" : "text-emerald-700/80 dark:text-emerald-400/80"
            }`}>
              {hasActiveMasterState 
                ? "Os produtos exibidos na sua vitrine e configurações principais são baseados no catálogo matriz da sua franqueadora."
                : hasOwnedMasterState
                ? "Você está operando o catálogo matriz. As alterações aqui refletirão nas lojas da sua rede."
                : "Os produtos exibidos na sua vitrine são gerenciados exclusivamente por você."}
            </p>
          </div>
        </div>
        <Link
          href="/dashboard/catalogo/gerenciador"
          className={`shrink-0 w-full sm:w-auto rounded-xl px-5 py-2.5 text-sm font-bold text-white transition flex items-center justify-center gap-2 mt-4 md:mt-0 ${
            hasActiveMasterState ? "bg-purple-600 hover:bg-purple-700" : hasOwnedMasterState ? "bg-blue-600 hover:bg-blue-700" : "bg-emerald-600 hover:bg-emerald-700"
          }`}
        >
          Gerenciar
          <ArrowUpRight size={16} />
        </Link>
      </motion.div>

      {/* Banner: Sem Catálogo (Ação Positiva) */}
      {/* Mural de Avisos */}
      {customAlerts.length > 0 && (
        <div className="space-y-3 mb-6">
          {customAlerts.map(alert => (
            <motion.div 
              key={alert.id}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`p-4 rounded-2xl flex items-start gap-3 backdrop-blur-md border ${
                alert.color === 'red' ? 'bg-red-500/10 border-red-500/20 text-red-700 dark:text-red-400' :
                alert.color === 'yellow' ? 'bg-yellow-500/10 border-yellow-500/20 text-yellow-700 dark:text-yellow-400' :
                alert.color === 'green' ? 'bg-green-500/10 border-green-500/20 text-green-700 dark:text-green-400' :
                'bg-blue-500/10 border-blue-500/20 text-blue-700 dark:text-blue-400'
              }`}
            >
              <div className="shrink-0 mt-0.5">
                {alert.color === 'red' ? '⚠️' : alert.color === 'yellow' ? '⚡' : alert.color === 'green' ? '✅' : 'ℹ️'}
              </div>
              <p className="text-sm font-medium leading-relaxed">{alert.message}</p>
            </motion.div>
          ))}
        </div>
      )}

      {/* Alerta de Feriado */}
      {upcomingHoliday && (
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="mb-6 overflow-hidden rounded-[32px] bg-gradient-to-br from-indigo-600 to-violet-700 p-6 md:p-8 relative"
        >
          <div className="absolute right-0 top-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/20 rounded-full text-white text-xs font-bold uppercase tracking-wider mb-3">
              <span>📅</span> Feriado se aproximando
            </div>
            <h3 className="text-xl md:text-2xl font-bold text-white mb-2">
              {upcomingHoliday.name}
            </h3>
            <p className="text-indigo-100 mb-6 text-sm md:text-base max-w-2xl">
              No dia <strong>{upcomingHoliday.date.split('-').reverse().join('/')}</strong> teremos este feriado. 
              Como você deseja operar seu catálogo neste dia?
            </p>
            
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => handleHolidayDecision(upcomingHoliday.date, false)}
                disabled={processingHolidayDecision}
                className="bg-white/20 hover:bg-white/30 text-white border border-white/20 font-bold px-6 py-3 rounded-xl transition-all shadow-sm flex items-center justify-center gap-2"
              >
                🏝️ Vou folgar (Pausar 24h)
              </button>
              <button
                onClick={() => handleHolidayDecision(upcomingHoliday.date, true)}
                disabled={processingHolidayDecision}
                className="bg-white text-indigo-700 hover:bg-indigo-50 font-bold px-6 py-3 rounded-xl transition-all shadow-md flex items-center justify-center gap-2"
              >
                💼 Vou trabalhar
              </button>
            </div>
          </div>
        </motion.div>
      )}

      {/* Banners existentes de WhatsApp, Catálogo Vazio, etc. */}


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
                Atenção: {isB2B && sellerCount === 0 ? "Nenhum Vendedor Cadastrado" : "Catálogo sem Contato"}
              </h3>
              <p className="text-xs text-red-700/80 dark:text-red-400/80 mt-1 leading-relaxed max-w-2xl">
                {isB2B && sellerCount === 0
                  ? "Seu catálogo está sem uma frente de vendas! No modelo B2B, a venda ocorre exclusivamente via vendedor. Sem vendedores cadastrados, seus clientes não terão um ponto de contato local para finalizar pedidos."
                  : `Seu catálogo está publicado, mas nenhum número de WhatsApp foi configurado! Seus clientes não conseguirão fazer pedidos. ${isB2B ? "Configure o número de WhatsApp na ficha dos seus vendedores." : "Configure no seu Perfil."}`
                }
              </p>
            </div>
          </div>
          <Link
            href={isB2B ? "/dashboard/vendedores" : "/dashboard/perfil#cartao"}
            className="shrink-0 w-full sm:w-auto rounded-xl bg-red-600 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-red-700 flex items-center justify-center gap-2 mt-4 md:mt-0"
          >
            {isB2B ? (sellerCount === 0 ? "Cadastrar Vendedor" : "Configurar Vendedores") : "Configurar WhatsApp"}
            <ArrowUpRight size={16} />
          </Link>
        </motion.div>
      )}

      {/* Progress Bar (Setup Checklist) */}
      {!isReady && (
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-3xl border border-[var(--dash-border)] bg-[var(--dash-surface)] p-6 shadow-sm"
        >
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-5">
            <div>
              <h3 className="text-lg font-bold text-[var(--dash-text-primary)]">Configuração do Catálogo</h3>
              <p className="text-sm text-[var(--dash-text-secondary)] mt-1">
                Seu link público permanecerá em construção até que as 3 configurações obrigatórias sejam concluídas.
              </p>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              <span className="text-2xl font-bold text-primary">{progressPercent}%</span>
              <div className="w-32 h-3 rounded-full bg-[var(--dash-surface-secondary)] border border-[var(--dash-border)] overflow-hidden">
                <div 
                  className="h-full bg-primary transition-all duration-1000 ease-out" 
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {coreChecklist.map((item, idx) => (
              <Link key={idx} href={item.href} className="flex items-center gap-3 p-3 rounded-xl hover:bg-[var(--dash-surface-secondary)] transition group border border-transparent hover:border-[var(--dash-border)]">
                <div className={`flex items-center justify-center h-8 w-8 rounded-full shrink-0 ${item.done ? 'bg-emerald-500/20 text-emerald-500' : 'bg-[var(--dash-border)] text-[var(--dash-text-muted)]'}`}>
                  {item.done ? "✓" : item.icon}
                </div>
                <div className="flex-1">
                  <span className={`text-sm font-semibold transition ${item.done ? 'text-[var(--dash-text-secondary)] line-through opacity-70' : 'text-[var(--dash-text-primary)] group-hover:text-primary'}`}>
                    {item.label}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </motion.div>
      )}

      {/* Dica de Foto de Perfil (Mostra se isReady ou não, caso esteja faltando) */}
      {((!isB2B && !avatarUrl) || (isB2B && hasSellersWithoutPhoto)) && (
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 rounded-2xl border border-violet-500/20 bg-violet-500/5 backdrop-blur-md flex items-start gap-3"
        >
          <div className="h-10 w-10 rounded-full bg-violet-500/10 flex items-center justify-center text-violet-500 shrink-0">
            <span className="text-lg">📸</span>
          </div>
          <div>
            <h4 className="text-sm font-bold text-violet-800 dark:text-violet-400">
              {isB2B ? "Dica: Adicione fotos aos perfis da equipe" : "Dica: Adicione uma Foto de Perfil ou Logo"}
            </h4>
            <p className="text-xs text-violet-700/80 dark:text-violet-400/80 mt-1">
              {isB2B 
                ? "Vendedores com foto real transmitem muito mais confiança e convertem até 40% mais. "
                : "Catálogos com fotos de perfil reais ou logotipos de empresas transmitem muito mais confiança e vendem até 40% a mais. "
              }
              <Link href={isB2B ? "/dashboard/vendedores" : "/dashboard/perfil#cartao"} className="font-semibold underline">
                Adicionar agora
              </Link>.
            </p>
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

      {/* Inteligência de Estoque */}
      <div className="mt-10 mb-4 flex items-center justify-between">
        <h2 className="text-xl font-bold text-[var(--dash-text-primary)]">Inteligência de Estoque</h2>
      </div>
      
      {hasBlingConnection ? (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3 mb-10">
          {/* Card 1: Estoque Global */}
          <div className="rounded-3xl border border-[var(--dash-border)] bg-[var(--dash-surface)] p-6 flex flex-col justify-between">
             <div className="flex items-center justify-between mb-4">
               <div className="flex items-center gap-2">
                 <div className="rounded-lg bg-blue-500/10 p-2 text-blue-500">
                   <Package size={20} />
                 </div>
                 <h3 className="font-bold text-[var(--dash-text-primary)]">Estoque Global</h3>
               </div>
               <span className="text-xs font-medium text-emerald-500 bg-emerald-500/10 px-2 py-1 rounded-full border border-emerald-500/20">Sincronizado</span>
             </div>
             
             <div className="flex items-end justify-between mt-4">
               <div>
                 <p className="text-3xl font-bold text-[var(--dash-text-primary)]">{stockStats.total}</p>
                 <p className="text-sm text-[var(--dash-text-secondary)]">Total de Produtos</p>
               </div>
               <div className="text-right">
                 <div className="flex items-center justify-end gap-1.5 mb-1">
                   <div className="w-2 h-2 rounded-full bg-emerald-500" />
                   <span className="text-xs text-[var(--dash-text-secondary)]">{stockStats.inStock} em estoque</span>
                 </div>
                 <div className="flex items-center justify-end gap-1.5">
                   <div className="w-2 h-2 rounded-full bg-red-500" />
                   <span className="text-xs text-[var(--dash-text-secondary)]">{stockStats.outOfStock} esgotados</span>
                 </div>
               </div>
             </div>
             <div className="mt-4 flex h-2 w-full overflow-hidden rounded-full bg-red-500/20">
               <div className="bg-emerald-500 transition-all" style={{ width: `${stockStats.total > 0 ? (stockStats.inStock / stockStats.total) * 100 : 0}%` }} />
               <div className="bg-red-500 transition-all" style={{ width: `${stockStats.total > 0 ? (stockStats.outOfStock / stockStats.total) * 100 : 0}%` }} />
             </div>
          </div>

          {/* Card 2: Top Categorias */}
          <div className="rounded-3xl border border-[var(--dash-border)] bg-[var(--dash-surface)] p-6">
            <div className="flex items-center gap-2 mb-4">
               <div className="rounded-lg bg-purple-500/10 p-2 text-purple-500">
                 <BarChart2 size={20} />
               </div>
               <h3 className="font-bold text-[var(--dash-text-primary)]">Top Categorias (Volumetria)</h3>
            </div>
            {topCategories.length > 0 ? (
              <div className="space-y-3 mt-2">
                {topCategories.map((cat, idx) => (
                  <div key={idx} className="flex items-center justify-between">
                    <span className="text-sm font-medium text-[var(--dash-text-secondary)] truncate max-w-[120px]">{cat.name}</span>
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-bold text-[var(--dash-text-primary)]">{cat.total} itens</span>
                      {cat.outOfStock > 0 && (
                        <span className="text-[10px] font-bold text-red-500 bg-red-500/10 px-1.5 py-0.5 rounded-md">
                          {cat.outOfStock} esg.
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex h-24 items-center justify-center text-sm text-[var(--dash-text-muted)]">Nenhum dado de categoria</div>
            )}
          </div>

          {/* Card 3: Alerta Crítico */}
          <div className="rounded-3xl border border-red-500/20 bg-red-500/5 p-6 relative overflow-hidden flex flex-col">
            <div className="flex items-center justify-between mb-4">
               <div className="flex items-center gap-2">
                 <div className="rounded-lg bg-red-500/10 p-2 text-red-500">
                   <AlertTriangle size={20} />
                 </div>
                 <h3 className="font-bold text-red-800 dark:text-red-400">Alerta de Estoque</h3>
               </div>
               <button onClick={() => setIsStockModalOpen(true)} className="text-red-500 hover:text-red-700 transition">
                 <Settings size={18} />
               </button>
            </div>
            
            <p className="text-xs text-red-700/80 dark:text-red-400/80 mb-3">
              Produtos com {lowStockThreshold} ou menos unidades em estoque:
            </p>

            {lowStockProducts.length > 0 ? (
              <div className="space-y-2 overflow-y-auto flex-1 max-h-[110px] pr-2 custom-scrollbar">
                {lowStockProducts.map(p => (
                  <div key={p.id} className="flex items-center justify-between bg-white/50 dark:bg-black/20 p-2 rounded-lg border border-red-500/10">
                    <span className="text-xs font-medium text-red-900 dark:text-red-300 truncate max-w-[140px]" title={p.name}>{p.name}</span>
                    <span className="text-xs font-bold text-red-600 dark:text-red-400 shrink-0">{p.stock_quantity} un</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-emerald-600 dark:text-emerald-400 font-medium bg-emerald-500/5 rounded-xl border border-emerald-500/10 p-4 text-center">
                <span className="text-2xl mb-1">🎉</span>
                <span className="text-sm">Tudo seguro por aqui!</span>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="mb-10 rounded-3xl border border-[var(--dash-border)] bg-[var(--dash-surface-secondary)] p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-full bg-[var(--dash-border)] flex items-center justify-center text-[var(--dash-text-muted)] shrink-0">
              <Package size={24} />
            </div>
            <div>
              <h3 className="font-bold text-[var(--dash-text-primary)]">Integração com Bling Desativada</h3>
              <p className="text-sm text-[var(--dash-text-secondary)] mt-1">Conecte-se com o Bling para acompanhar os parâmetros de estoque em tempo real.</p>
            </div>
          </div>
          <Link href="/dashboard/catalogo/gerenciador" className="shrink-0 rounded-xl bg-primary px-5 py-2.5 text-sm font-bold text-white transition hover:bg-primary/90 shadow-sm flex items-center gap-2">
            <Settings size={16} /> Conectar Bling
          </Link>
        </div>
      )}

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
      
      <AnimatePresence>
        {profileData && (
          <StockThresholdModal
            isOpen={isStockModalOpen}
            onClose={() => setIsStockModalOpen(false)}
            orgId={profileData.organization_id}
            currentThreshold={lowStockThreshold}
            onSaved={(val) => {
              setLowStockThreshold(val);
              const low = allProductsForFilterRef.current.filter((p: any) => p.stock_quantity !== null && p.stock_quantity <= val);
              low.sort((a: any, b: any) => (a.stock_quantity || 0) - (b.stock_quantity || 0));
              setLowStockProducts(low.slice(0, 10));
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}