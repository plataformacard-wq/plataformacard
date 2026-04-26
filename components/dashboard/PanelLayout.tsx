"use client";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter, usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { TopHeader } from "@/components/dashboard/TopHeader";
import { Clock } from "lucide-react";
import GlobalAlert from "@/components/dashboard/GlobalAlert";

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
  const [slug, setSlug] = useState<string | null>(null);
  const [isDark, setIsDark] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isReady, setIsReady] = useState(false);

  const [notice, setNotice] = useState<{id: string, text: string, active: boolean} | null>(null);

  useEffect(() => {
    // Tema
    const saved = localStorage.getItem("dash-theme");
    if (saved === "dark") {
      setIsDark(true);
      document.documentElement.setAttribute("data-theme", "dark");
    } else {
      document.documentElement.removeAttribute("data-theme");
    }

    // Sidebar Collapsed
    const collapsed = localStorage.getItem("dash-sidebar-collapsed");
    if (collapsed === "true") {
      setIsSidebarCollapsed(true);
    }

    async function loadData() {
      try {
        const { data: { user }, error } = await supabase.auth.getUser();
        
        if (error || !user) {
          router.push("/entrar");
          return;
        }

        // 1. Carregar Perfil e Org
        const { data: profile, error: profError } = await supabase
          .from("profiles")
          .select("*")
          .eq("user_id", user.id)
          .maybeSingle();

        if (profError || !profile) {
          router.push("/onboarding");
          return;
        }

        // 2. Carregar Configurações Globais (Alerta e Manutenção)
        const { data: configRows } = await supabase.from("platform_config").select("key, value");
        const configs: Record<string, string> = {};
        configRows?.forEach(r => configs[r.key] = r.value);

        const currentRole = profile.role || "pending";
        setRole(currentRole);

        setNotice({
          id: configs.system_notice_id || "0",
          text: configs.system_notice_text || "",
          active: configs.system_notice_active === "true"
        });

        // Trava de Vendedores
        if (profile.role === "seller") {
          if (profile.slug) {
            router.push(`/${profile.slug}`);
          } else {
            await supabase.auth.signOut();
            router.push("/entrar?error=vendedor_sem_link");
          }
          return;
        }

        if (profile.organization_id) {
          const { data: org } = await supabase
            .from("organizations")
            .select("business_model")
            .eq("id", profile.organization_id)
            .maybeSingle();
          
          if (org?.business_model) {
            setBusinessModel(org.business_model as "B2B" | "B2C" | "CaaS");
          } else {
            router.push("/onboarding");
          }
        } else {
          router.push("/onboarding");
          return;
        }

        setNome(profile.full_name || "Usuário");
        setAvatar(profile.avatar_url || null);
        setSlug(profile.slug || null);

        // Check for products count for isReady
        const { count: pCount } = await supabase
          .from("products")
          .select("*", { count: "exact", head: true })
          .eq("organization_id", profile.organization_id)
          .is("deleted_at", null);

        const ready = !!profile.avatar_url && !!profile.whatsapp && (pCount || 0) > 0;
        setIsReady(ready);

        // Bloqueio de Onboarding se não autorizado
        if (!profile.organization_id) {
          if (currentRole === "authorized") {
            if (pathname !== "/onboarding") {
              router.push("/onboarding");
            }
          } else {
            // Se não for autorizado e não tiver organização, fica no estado "pending"
            // que mostraremos abaixo
          }
        }

      } catch (err) {
        console.error("Erro no loadData:", err);
        setBusinessModel("B2B");
      }
    }

    loadData();
  }, [supabase, router, pathname]);

  function toggleTheme() {
    const next = !isDark;
    setIsDark(next);
    if (next) {
      document.documentElement.setAttribute("data-theme", "dark");
      localStorage.setItem("dash-theme", "dark");
    } else {
      document.documentElement.removeAttribute("data-theme");
      localStorage.setItem("dash-theme", "light");
    }
  }

  async function handleLogout() {
    try {
      await supabase.auth.signOut();
      window.location.href = "/entrar";
    } catch (err) {
      console.error("Erro ao sair:", err);
      window.location.href = "/entrar";
    }
  }

  if (businessModel === null) {
    // Se o usuário não tem organização e não é autorizado, mostra tela de espera
    if (!slug && role === "pending") {
      return (
        <div className="flex min-h-screen items-center justify-center bg-[var(--dash-bg)] text-[var(--dash-text-primary)] p-6">
          <div className="max-w-md text-center space-y-6">
            <div className="mx-auto w-20 h-20 bg-amber-500/10 text-amber-500 rounded-3xl flex items-center justify-center">
              <Clock size={40} />
            </div>
            <h1 className="text-2xl font-bold">Acesso em Análise</h1>
            <p className="text-[var(--dash-text-secondary)]">
              Olá! Recebemos seu cadastro. Durante esta fase Beta, o Super Admin precisa liberar seu acesso manualmente para que você possa escolher seu modelo de negócio e configurar seu perfil.
            </p>
            <div className="pt-4">
              <button 
                onClick={handleLogout}
                className="text-sm font-bold text-red-500 hover:underline"
              >
                Sair da conta
              </button>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--dash-bg)] text-[var(--dash-text-primary)]">
        <div className="flex flex-col items-center gap-4">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="text-sm font-medium">Sincronizando painel...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-[var(--dash-bg)] text-[var(--dash-text-primary)] transition-colors duration-500">
      <Sidebar 
        role={role} 
        businessModel={businessModel}
        isOpen={isSidebarOpen} 
        onClose={() => setIsSidebarOpen(false)} 
        isCollapsed={isSidebarCollapsed}
        setIsCollapsed={(val: boolean) => {
          setIsSidebarCollapsed(val);
          localStorage.setItem("dash-sidebar-collapsed", String(val));
        }}
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
          toggleTheme={toggleTheme}
          handleLogout={handleLogout}
          onMenuClick={() => setIsSidebarOpen(true)}
        />

        {/* Banner Global de Avisos */}
        {notice && (
          <GlobalAlert 
            noticeId={notice.id} 
            noticeText={notice.text} 
            isActive={notice.active} 
          />
        )}

        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          <div className="mx-auto max-w-7xl">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
            >
              {children}
            </motion.div>
          </div>
        </main>
      </div>
    </div>
  );
}
