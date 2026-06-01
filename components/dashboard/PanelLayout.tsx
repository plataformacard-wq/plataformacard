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
  const [businessModel, setBusinessModel] = useState<"B2B" | "B2C" | "CaaS" | null>(null);
  const [planId, setPlanId] = useState<string | null>(null);
  const [slug, setSlug] = useState<string | null>(null);
  const [isDark, setIsDark] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [permissions, setPermissions] = useState({
    dash_access_catalog: false,
    dash_access_analytics: false,
    dash_access_company: false,
  });
  const [isReady, setIsReady] = useState(false);

  const [notice, setNotice] = useState<{id: string, text: string, active: boolean} | null>(null);
  const [newLead, setNewLead] = useState<{product_name: string, seller_name: string} | null>(null);
  const [hasShadowCookie, setHasShadowCookie] = useState(false);
  const [planOverages, setPlanOverages] = useState<{resource: string; label: string; current: number; limit: number}[]>([]);
  const [currentPlanName, setCurrentPlanName] = useState("");
  const [showNotificationModal, setShowNotificationModal] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);

  useEffect(() => {
    // Tema
    const saved = localStorage.getItem("dash-theme");
    if (saved === "light") {
      setIsDark(false);
      document.documentElement.removeAttribute("data-theme");
    } else {
      setIsDark(true);
      document.documentElement.setAttribute("data-theme", "dark");
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
          setIsReady(true);
          return;
        }

        const userRole = profile.role || "admin";
        const displayName = profile.full_name || user.user_metadata?.full_name || user.email?.split('@')[0] || "Usuário";
        
        setNome(displayName);
        setAvatar(profile.avatar_url || null);
        setRole(userRole);
        setSlug(profile.slug || null);
        
        setPermissions({
          dash_access_catalog: !!profile.dash_access_catalog,
          dash_access_analytics: !!profile.dash_access_analytics,
          dash_access_company: !!profile.dash_access_company,
        });

        // GUARDA CLIENT-SIDE: Super Admin não deve ficar no /dashboard sem Shadow Mode
        const shadowOrgId = document.cookie
          .split("; ")
          .find((row) => row.startsWith("shadow_org_id="))
          ?.split("=")[1];

        if (userRole === "superadmin") {
          if (!shadowOrgId && window.location.pathname.startsWith("/dashboard")) {
            router.replace("/admin");
            return;
          }
        }

        setHasShadowCookie(!!shadowOrgId);

        const targetOrgId = (userRole === "superadmin" && shadowOrgId) 
          ? shadowOrgId 
          : profile.organization_id;

        if (targetOrgId) {
          try {
            const org = await getOrganizationById(targetOrgId);
            const orgPlanId = org?.plan_id || null;
            setBusinessModel(org?.business_model as any || "B2B");
            setPlanId(orgPlanId);
            setCurrentPlanName(getPlanName(orgPlanId));

            // Detecta excedência de plano (uso acima do limite)
            // Só verifica para clientes reais (não super admin sem shadow)
            if (orgPlanId && userRole !== "superadmin") {
              try {
                const usageResult = await getOrganizationStats(targetOrgId);
                if (usageResult.success) {
                  const overages = detectOverage(orgPlanId, {
                    products: usageResult.stats.products,
                    sellers: usageResult.stats.sellers,
                  });
                  setPlanOverages(overages);
                }
              } catch (overageErr) {
                console.warn("Erro ao verificar excedência de plano:", overageErr);
              }
            }
            
            // Se estiver em shadow mode, podemos querer mostrar o nome da empresa em algum lugar
            if (shadowOrgId && userRole === "superadmin") {
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

        // --- FETCH MASTER CATALOG NOTIFICATIONS ---
        if (userRole !== "superadmin") {
          try {
            const { data: notifs, error: notifErr } = await supabase
              .from("master_catalog_notifications")
              .select("*")
              .order("created_at", { ascending: false })
              .limit(10);
            
            if (notifs && notifs.length > 0 && !notifErr) {
              const lastSeen = localStorage.getItem("last_seen_notification_time");
              const latestTime = new Date(notifs[0].created_at).getTime();
              
              const hasNew = !lastSeen || latestTime > parseInt(lastSeen);
              if (hasNew) {
                setNotifications(notifs);
                setShowNotificationModal(true);
              }
            }
          } catch (errNotif) {
            console.warn("Erro ao buscar notificações do catálogo master:", errNotif);
          }
        }

        // --- REALTIME LEADS LISTENER ---
        if (targetOrgId) {
          const channel = supabase
            .channel(`leads-${targetOrgId}`)
            .on(
              'postgres_changes',
              {
                event: 'INSERT',
                schema: 'public',
                table: 'leads_tracking',
                filter: `organization_id=eq.${targetOrgId}`
              },
              (payload) => {
                const lead = payload.new as any;
                setNewLead(lead);
                // Auto-hide after 10 seconds
                setTimeout(() => setNewLead(null), 10000);
                
                // Opcional: Tocar um som leve de notificação
                try { new Audio('/sounds/notification.mp3').play().catch(() => {}); } catch(e) {}
              }
            )
            .subscribe();
          
          setIsReady(true);
          return () => {
            supabase.removeChannel(channel);
          };
        }
        
        setIsReady(true);
      } catch (err) {
        console.error("Erro crítico ao carregar painel:", err);
        // Garantimos que o app não trave em loading infinito mesmo com erro
        setBusinessModel("B2B");
        setIsReady(true);
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
    window.location.href = "/admin";
  }

  const isAdminPath = pathname.startsWith("/admin");
  const isShadowMode = pathname.startsWith("/dashboard") && role === "superadmin" && hasShadowCookie;

  return (
    <div 
      className="flex min-h-screen text-[var(--dash-text-primary)] transition-colors duration-500"
      style={{ background: isDark ? 'var(--dash-bg-gradient)' : 'var(--dash-bg)' }}
    >
      {/* Banner de Simulação */}
      {isShadowMode && (
        <div className="fixed top-0 left-0 right-0 z-[999] bg-amber-500 text-white px-4 py-2 flex items-center justify-between shadow-lg">
          <div className="flex items-center gap-3">
            <div className="h-6 w-6 rounded-lg bg-white/20 flex items-center justify-center">
              <Clock size={14} className="animate-pulse" />
            </div>
            <p className="text-xs font-black uppercase tracking-widest">
              Modo Simulação Ativo: <span className="underline decoration-2 underline-offset-4">Você está vendo o painel como este cliente</span>
            </p>
          </div>
          <button 
            onClick={handleExitShadow}
            className="px-4 py-1.5 rounded-xl bg-white text-amber-600 text-[10px] font-black uppercase hover:bg-amber-50 transition-all shadow-sm"
          >
            Sair e Voltar ao QG
          </button>
        </div>
      )}

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
        isReady={isReady}
        isShadowMode={isShadowMode}
      />

      <div className="flex flex-1 flex-col overflow-hidden">
        <TopHeader 
          nome={nome}
          avatar={avatar}
          role={role}
          slug={slug}
          isReady={isReady}
          businessModel={businessModel || "B2C"}
          isDark={isDark}
          isAdminPath={isAdminPath}
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
          <div className="mx-auto max-w-7xl">
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
            className="fixed bottom-8 right-8 z-[9999] w-80 bg-white dark:bg-zinc-900 border border-emerald-500/30 rounded-2xl shadow-2xl overflow-hidden"
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

      {/* Modal de Notificações CaaS */}
      <AnimatePresence>
        {showNotificationModal && notifications.length > 0 && (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 px-4 py-8 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="w-full max-w-lg rounded-[32px] border p-8 shadow-[0_20px_50px_rgba(0,0,0,0.3)] flex flex-col max-h-[80vh] overflow-hidden"
              style={{
                background: "var(--dash-surface)",
                borderColor: "var(--dash-border)",
                color: "var(--dash-text-primary)",
              }}
            >
              {/* Header */}
              <div className="flex items-center justify-between pb-6 border-b" style={{ borderColor: "var(--dash-border)" }}>
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-purple-500/10 text-purple-500 flex items-center justify-center">
                    <Bell className="animate-bounce" size={20} />
                  </div>
                  <div className="text-left">
                    <h3 className="text-lg font-black uppercase tracking-tight">Atualizações do Catálogo</h3>
                    <p className="text-[9px] font-black text-[var(--dash-text-muted)] uppercase tracking-widest">Estoque mestre atualizado</p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    const latestTime = new Date(notifications[0].created_at).getTime();
                    localStorage.setItem("last_seen_notification_time", String(latestTime));
                    setShowNotificationModal(false);
                  }}
                  className="rounded-xl p-2 hover:bg-[var(--dash-hover-bg)] transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Body */}
              <div className="flex-1 overflow-y-auto py-6 space-y-4 pr-1 scrollbar-thin text-left">
                {notifications.map((n) => {
                  const dateStr = new Date(n.created_at).toLocaleDateString("pt-BR", {
                    day: "2-digit",
                    month: "2-digit",
                    hour: "2-digit",
                    minute: "2-digit",
                  });
                  return (
                    <div
                      key={n.id}
                      className="p-4 rounded-2xl border transition-all hover:bg-[var(--dash-hover-bg)] flex items-start gap-4"
                      style={{ borderColor: "var(--dash-border)" }}
                    >
                      <div className="flex flex-col gap-1 flex-1">
                        <div className="flex items-center justify-between gap-2">
                          <span className={`px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-wider ${
                            n.action_type === 'INSERT' ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' :
                            n.action_type === 'UPDATE' ? 'bg-blue-500/10 text-blue-500 border border-blue-500/20' :
                            'bg-red-500/10 text-red-500 border border-red-500/20'
                          }`}>
                            {n.action_type === 'INSERT' ? 'Novo Produto' :
                             n.action_type === 'UPDATE' ? 'Produto Atualizado' :
                             'Produto Removido'}
                          </span>
                          <span className="text-[9px] text-[var(--dash-text-muted)] font-medium">{dateStr}</span>
                        </div>
                        <p className="text-sm font-black mt-1.5 leading-tight">{n.product_name}</p>
                        <p className="text-[9px] text-[var(--dash-text-muted)] font-bold uppercase tracking-wider mt-0.5">
                          Origem: <span className="text-purple-500 font-black">{n.catalog_name}</span>
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Footer */}
              <div className="pt-6 border-t flex justify-end" style={{ borderColor: "var(--dash-border)" }}>
                <button
                  onClick={() => {
                    const latestTime = new Date(notifications[0].created_at).getTime();
                    localStorage.setItem("last_seen_notification_time", String(latestTime));
                    setShowNotificationModal(false);
                  }}
                  className="px-8 py-3.5 bg-purple-500 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-purple-600 transition-all shadow-lg shadow-purple-500/20 active:scale-95"
                >
                  Entendi, fechar
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
