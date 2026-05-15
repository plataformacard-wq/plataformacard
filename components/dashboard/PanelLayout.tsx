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
import { getMyProfile, getOrganizationById } from "@/lib/admin-actions";

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
        // Usamos getSession primeiro por ser mais rápido no cliente
        const { data: { session } } = await supabase.auth.getSession();
        let user = session?.user;
        
        if (!user) {
          const { data: { user: authUser } } = await supabase.auth.getUser();
          user = authUser || undefined;
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

        // Lógica de Organização (com suporte a Shadow Mode para Super Admin)
        const shadowOrgId = document.cookie
          .split("; ")
          .find((row) => row.startsWith("shadow_org_id="))
          ?.split("=")[1];

        setHasShadowCookie(!!shadowOrgId);

        const targetOrgId = (userRole === "superadmin" && shadowOrgId) 
          ? shadowOrgId 
          : profile.organization_id;

        if (targetOrgId) {
          try {
            const org = await getOrganizationById(targetOrgId);
            setBusinessModel(org?.business_model as any || "B2B");
            setPlanId(org?.plan_id || null);
            
            // Se estiver em shadow mode, podemos querer mostrar o nome da empresa em algum lugar
            if (shadowOrgId && userRole === "superadmin") {
              console.log(`Simulando acesso à organização: ${org?.name}`);
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
    </div>
  );
}
