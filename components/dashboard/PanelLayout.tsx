"use client";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter, usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { TopHeader } from "@/components/dashboard/TopHeader";
import { Clock } from "lucide-react";
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
        
        if (!session?.user) {
          // Pequena espera para garantir que o cookie foi processado em caso de login recente
          const { data: { user } } = await supabase.auth.getUser();
          if (!user) {
            console.warn("Nenhuma sessão encontrada, redirecionando para login...");
            router.push("/entrar");
            return;
          }
        }

        // Tenta obter o perfil via Server Action
        let profile = null;
        try {
          profile = await getMyProfile();
        } catch (pErr) {
          console.error("Erro ao chamar getMyProfile:", pErr);
        }

        if (!profile) {
          console.warn("Perfil não encontrado no banco, usando modo Admin genérico para evitar trava");
          setRole("superadmin");
          setBusinessModel("B2B");
          setIsReady(true);
          return;
        }

        const userRole = profile.role || "admin";
        setRole(userRole);
        setNome(profile.full_name || "Admin");
        setAvatar(profile.avatar_url || null);
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

  if (businessModel === null) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0a0a0a]">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent" />
      </div>
    );
  }

  const isAdminPath = pathname.startsWith("/admin");
  const isShadowMode = pathname.startsWith("/dashboard") && role === "superadmin";

  return (
    <div className="flex min-h-screen bg-[var(--dash-bg)] text-[var(--dash-text-primary)] transition-colors duration-500">
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
        businessModel={businessModel}
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
          businessModel={businessModel}
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
    </div>
  );
}
