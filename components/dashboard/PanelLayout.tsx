"use client";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter, usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { TopHeader } from "@/components/dashboard/TopHeader";
import { 
  Bell, 
  Menu, 
  Search, 
  LogOut, 
  User, 
  ChevronRight,
  X,
  Clock
} from "lucide-react";
import GlobalAlert from "@/components/dashboard/GlobalAlert";
import PlanOverageAlert from "@/components/dashboard/PlanOverageAlert";
import { getMyProfile, getOrganizationById, getOrganizationStats } from "@/lib/admin-actions";
import { detectOverage, getPlanName } from "@/lib/plans";

type PanelLayoutProps = {
  children: React.ReactNode;
};

export function PanelLayout({ children }: PanelLayoutProps) {
  const router = useRouter();
  const pathname = usePathname();
  const supabase = createClient();
  const [nome, setNome] = useState("Carregando...");
  const [avatar, setAvatar] = useState<string | null>(null);
  const [role, setRole] = useState("admin");
  const [businessModel, setBusinessModel] = useState<"B2B" | "B2C" | "CaaS" | "ALL_SERVICE" | null>(null);
  const [planId, setPlanId] = useState<string | null>(null);
  const [slug, setSlug] = useState<string | null>(null);
  const [jobTitle, setJobTitle] = useState<string | null>(null);
  const [isDark, setIsDark] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [permissions, setPermissions] = useState({
    dash_access_catalog: false,
    dash_access_analytics: false,
    dash_access_company: false,
  });
  const [granularPermissions, setGranularPermissions] = useState<any>(null);
  const [subscriptionStatus, setSubscriptionStatus] = useState<string | null>(null);
  const [isReady, setIsReady] = useState(false);

  const [notice, setNotice] = useState<{id: string, text: string, active: boolean} | null>(null);
  const [newLead, setNewLead] = useState<{product_name: string, seller_name: string} | null>(null);
  const [hasShadowCookie, setHasShadowCookie] = useState(false);
  const [planOverages, setPlanOverages] = useState<{resource: string; label: string; current: number; limit: number}[]>([]);
  const [currentPlanName, setCurrentPlanName] = useState("");
  const [allNotifications, setAllNotifications] = useState<any[]>([]);

  useEffect(() => {
    // Tema
    const saved = localStorage.getItem("dash-theme");
    if (saved === "dark") {
      setIsDark(true);
      document.documentElement.setAttribute("data-theme", "dark");
    } else {
      setIsDark(false);
      document.documentElement.removeAttribute("data-theme");
    }

    // Sidebar Collapsed
    const collapsed = localStorage.getItem("dash-sidebar-collapsed");
    if (collapsed === "true") {
      setIsSidebarCollapsed(true);
    }

    async function loadData() {
      try {
        let session = null;
        let user = null;
        
        try {
          const { data, error } = await supabase.auth.getSession();
          if (error) {
            console.warn("Sessão inválida, limpando cookies e redirecionando...", error.message);
            await supabase.auth.signOut().catch(() => {});
            router.push("/entrar");
            return;
          }
          session = data?.session;
          user = session?.user;
        } catch (e) {
          console.warn("Erro ao obter sessão:", e);
        }
        
        if (!user) {
          try {
            const { data, error } = await supabase.auth.getUser();
            if (error) {
              console.warn("Usuário inválido, limpando cookies e redirecionando...", error.message);
              await supabase.auth.signOut().catch(() => {});
              router.push("/entrar");
              return;
            }
            user = data?.user || undefined;
          } catch (e) {
            console.warn("Erro ao obter usuário:", e);
          }
          
          if (!user) {
            router.push("/entrar");
            return;
          }
        }

        // NOVIDADE: Seta o nome instantaneamente via metadados do login
        const instantName = user.user_metadata?.full_name || user.email?.split('@')[0] || "Usuário";
        setNome(instantName);

        let hasContactInfo = false;
        let hasProducts = false;

        // Tenta obter o perfil via Server Action
        let profile = null;
        try {
          profile = await getMyProfile();
        } catch (pErr) {
          console.error("Erro ao chamar getMyProfile:", pErr);
        }

        if (!profile) {
          setRole("b2c_admin");
          setBusinessModel("B2C");
          const fallbackName = user.user_metadata?.full_name || user.email?.split('@')[0] || "Usuário";
          setNome(fallbackName);
          setIsReady(false);
          return;
        }

        const userRole = profile.role || "admin";
        const displayName = user.user_metadata?.full_name || profile.full_name || user.email?.split('@')[0] || "Usuário";
        
        setNome(displayName);
        setAvatar(profile.avatar_url || null);
        setRole(userRole);
        setSlug(profile.slug || null);
        setJobTitle(profile.job_title || null);
        setSubscriptionStatus(profile.subscription_status || null);
        setGranularPermissions(profile.granular_permissions || null);
        setPermissions({
          dash_access_catalog: !!profile.dash_access_catalog,
          dash_access_analytics: !!profile.dash_access_analytics,
          dash_access_company: !!profile.dash_access_company,
        });

        if (profile.whatsapp) {
          hasContactInfo = true;
        }

        // GUARDA CLIENT-SIDE: Super Admin não deve ficar no /dashboard sem Shadow Mode
        const shadowOrgId = document.cookie
          .split("; ")
          .find((row) => row.startsWith("shadow_org_id="))
          ?.split("=")[1];

        if (userRole === "main_admin") {
          if (!shadowOrgId && window.location.pathname.startsWith("/dashboard")) {
            router.replace("/main");
            return;
          }
        }

        setHasShadowCookie(!!shadowOrgId);

        const targetOrgId = (userRole === "main_admin" && shadowOrgId) 
          ? shadowOrgId 
          : profile.organization_id;

        if (targetOrgId) {
          try {
            const org = await getOrganizationById(targetOrgId);
            const orgPlanId = org?.plan_id || null;
            setBusinessModel(org?.business_model as any || "B2B");
            setPlanId(orgPlanId);
            setCurrentPlanName(getPlanName(orgPlanId));

            // Para Lojistas (admins), substitui o avatar pelo icone da empresa se existir.
            // Para vendedores, mantém o do perfil e usa o da empresa como fallback.
            if (org?.favicon_url) {
              const cacheBuster = `${org.favicon_url}${org.favicon_url.includes('?') ? '&' : '?'}t=${Date.now()}`;
              if (userRole !== "seller") {
                setAvatar(cacheBuster);
              } else if (!profile.avatar_url) {
                setAvatar(cacheBuster);
              }
            }

            if (org?.whatsapp) {
              hasContactInfo = true;
            }

            // Sempre buscamos stats para verificar se o catálogo está pronto (products > 0)
            try {
              const usageResult = await getOrganizationStats(targetOrgId);
              if (usageResult.success) {
                hasProducts = usageResult.stats.products > 0;
                
                // Detecta excedência de plano apenas para clientes reais
                if (orgPlanId && userRole !== "main_admin") {
                  const overages = detectOverage(orgPlanId, {
                    products: usageResult.stats.products,
                    sellers: usageResult.stats.sellers,
                  });
                  setPlanOverages(overages);
                }
              }
            } catch (statsErr) {
              console.warn("Erro ao buscar stats da organização:", statsErr);
            }
            
            // Se estiver em shadow mode, podemos querer mostrar o nome da empresa em algum lugar
            if (shadowOrgId && userRole === "main_admin") {
              // Shadow mode ativo
            }
          } catch (oErr) {
            console.error("Erro ao buscar organização:", oErr);
            setBusinessModel("B2B");
            setPlanId(null);
          }
        } else {
          setBusinessModel("B2B");
        }

        // Configurações de sistema
        try {
          const { data: configs } = await supabase.from("platform_config").select("key, value");
          const configMap: any = {};
          configs?.forEach(c => configMap[c.key] = c.value);
          
          setNotice({
            id: configMap.system_notice_id || "0",
            text: configMap.system_notice_text || "",
            active: configMap.system_notice_active === "true"
          });
        } catch (cErr) {
          console.error("Erro ao buscar configs:", cErr);
        }

        // --- FETCH MASTER CATALOG NOTIFICATIONS & LEADS ---
        let combinedNotifications: any[] = [];

        if (userRole !== "main_admin") {
          try {
            const { data: notifs, error: notifErr } = await supabase
              .from("master_catalog_notifications")
              .select("*")
              .order("created_at", { ascending: false })
              .limit(10);
            
            if (notifs && notifs.length > 0 && !notifErr) {
              const mappedNotifs = notifs.map(n => ({ ...n, notification_type: 'catalog_update' }));
              combinedNotifications = [...combinedNotifications, ...mappedNotifs];
            }
          } catch (errNotif) {
            console.warn("Erro ao buscar notificações do catálogo master:", errNotif);
          }
        }

        if (targetOrgId) {
          try {
             const { data: leads } = await supabase
               .from("leads_tracking")
               .select("*")
               .eq("organization_id", targetOrgId)
               .order("created_at", { ascending: false })
               .limit(10);
             
             if (leads && leads.length > 0) {
               const mappedLeads = leads.map(l => ({ ...l, notification_type: 'new_lead' }));
               combinedNotifications = [...combinedNotifications, ...mappedLeads];
             }
          } catch (errLeads) {
            console.warn("Erro ao buscar histórico de leads:", errLeads);
          }
        }

        combinedNotifications.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        setAllNotifications(combinedNotifications);

        // --- REALTIME LEADS LISTENER ---
        if (targetOrgId) {
          const channelName = `leads-${targetOrgId}`;
          // Previne erro "cannot add postgres_changes callbacks after subscribe" em Strict Mode ou re-renders
          supabase.getChannels().forEach(ch => {
            if (ch.topic === `realtime:${channelName}`) {
              supabase.removeChannel(ch);
            }
          });

          const channel = supabase
            .channel(channelName)
            .on(
              'postgres_changes',
              {
                event: 'INSERT',
                schema: 'public',
                table: 'leads_tracking',
                filter: `organization_id=eq.${targetOrgId}`
              },
              (payload) => {
                const lead = { ...(payload.new as any), notification_type: 'new_lead' };
                setNewLead(lead);
                
                setAllNotifications(prev => {
                  const updated = [lead, ...prev];
                  return updated.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()).slice(0, 20);
                });

                // Auto-hide after 10 seconds
                setTimeout(() => setNewLead(null), 10000);
                
                // Opcional: Tocar um som leve de notificação
                try { new Audio('/sounds/notification.mp3').play().catch(() => {}); } catch(e) {}
              }
            )
            .subscribe();
          
          setIsReady(hasContactInfo && hasProducts);
          return () => {
            supabase.removeChannel(channel);
          };
        }
        
        setIsReady(hasContactInfo && hasProducts);
      } catch (err) {
        console.error("Erro crítico ao carregar painel:", err);
        // Garantimos que o app não trave em loading infinito mesmo com erro
        setBusinessModel("B2B");
        setIsReady(false);
      }
    }

    loadData();
  }, [supabase, router, pathname]);

  async function handleLogout() {
    await supabase.auth.signOut();
    window.location.href = "/entrar";
  }

  async function handleExitShadow() {
    const { stopShadowAccess } = await import("@/lib/admin-actions");
    await stopShadowAccess();
    window.location.href = "/main";
  }

  const isAdminPath = pathname.startsWith("/main");
  const isShadowMode = pathname.startsWith("/dashboard") && role === "main_admin" && hasShadowCookie;

  return (
    <div 
      className="flex min-h-screen text-[var(--dash-text-primary)] transition-colors duration-500"
      style={{ background: isDark ? 'var(--dash-bg-gradient)' : 'var(--dash-bg)' }}
    >
      <Sidebar 
        role={role} 
        businessModel={businessModel || "B2C"}
        planId={planId}
        isOpen={isSidebarOpen} 
        onClose={() => setIsSidebarOpen(false)} 
        isCollapsed={isSidebarCollapsed}
        setIsCollapsed={(val: boolean) => {
          setIsSidebarCollapsed(val);
          localStorage.setItem("dash-sidebar-collapsed", String(val));
        }}
        permissions={permissions}
        granularPermissions={granularPermissions}
        isReady={isReady}
        isShadowMode={isShadowMode}
      />

      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Banner de Simulação */}
        {isShadowMode && (
          <div className="relative z-[40] bg-amber-500 text-white px-4 md:px-6 py-2.5 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 shadow-md shrink-0">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 shrink-0 rounded-lg bg-[var(--dash-surface)]/20 flex items-center justify-center shadow-inner">
                <Clock size={16} className="animate-pulse" />
              </div>
              <div className="flex flex-col text-left">
                <p className="text-[11px] font-black uppercase tracking-widest leading-none">
                  Modo Simulação Ativo
                </p>
                <p className="text-[10px] font-medium opacity-90 mt-1 leading-tight">
                  Você está logado temporariamente e visualizando o painel através da visão deste cliente.
                </p>
              </div>
            </div>
            <button 
              onClick={handleExitShadow}
              className="w-full md:w-auto shrink-0 px-5 py-2 rounded-xl bg-[var(--dash-surface)] text-amber-600 text-[10px] font-black uppercase tracking-wider hover:bg-amber-50 transition-all shadow-sm active:scale-95 text-center"
            >
              Encerrar Simulação
            </button>
          </div>
        )}

        <TopHeader 
          nome={nome}
          avatar={avatar}
          role={role}
          slug={slug}
          isReady={isReady}
          businessModel={businessModel || "B2C"}
          isDark={isDark}
          isAdminPath={isAdminPath}
          subscriptionStatus={subscriptionStatus || undefined}
          notifications={allNotifications}
          jobTitle={jobTitle}
          toggleTheme={() => {
            const next = !isDark;
            setIsDark(next);
            if (next) {
              document.documentElement.setAttribute("data-theme", "dark");
              localStorage.setItem("dash-theme", "dark");
            } else {
              document.documentElement.removeAttribute("data-theme");
              localStorage.setItem("dash-theme", "light");
            }
          }}
          handleLogout={handleLogout}
          onMenuClick={() => setIsSidebarOpen(true)}
        />

        {notice && <GlobalAlert {...notice} noticeId={notice.id} noticeText={notice.text} isActive={notice.active} />}

        {/* Banner de Excedência de Plano */}
        {planOverages.length > 0 && (
          <PlanOverageAlert overages={planOverages} planName={currentPlanName} />
        )}

        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          <div className="w-full">
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
              {children}
            </motion.div>
          </div>
        </main>
      </div>

      {/* Notificação de Novo Lead (Realtime) */}
      <AnimatePresence>
        {newLead && (
          <motion.div
            initial={{ opacity: 0, x: 100, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 100, scale: 0.9 }}
            className="fixed bottom-8 right-8 z-[9999] w-80 bg-[var(--dash-surface)] dark:bg-zinc-900 border border-emerald-500/30 rounded-[27px] shadow-2xl overflow-hidden"
          >
            <div className="bg-emerald-500 px-4 py-2 flex items-center justify-between">
              <span className="text-[10px] font-black text-white uppercase tracking-widest">Novo Lead Detectado!</span>
              <button onClick={() => setNewLead(null)} className="text-white hover:rotate-90 transition-transform">
                <X size={14} />
              </button>
            </div>
            <div className="p-4 flex gap-4">
              <div className="h-12 w-12 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-600 shrink-0">
                <Clock size={24} className="animate-pulse" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-[var(--dash-text-primary)] truncate">
                  {newLead.product_name}
                </p>
                <p className="text-[10px] text-[var(--dash-text-secondary)] mt-0.5">
                  Vendedor: <span className="font-bold text-emerald-500">{newLead.seller_name}</span>
                </p>
                <div className="mt-3 flex items-center gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-ping" />
                  <span className="text-[9px] font-black uppercase text-emerald-500 tracking-tighter">Aguardando no WhatsApp...</span>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
