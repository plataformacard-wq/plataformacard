"use client";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter, usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { TopHeader } from "@/components/dashboard/TopHeader";

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
  const [businessModel, setBusinessModel] = useState<"B2B" | "B2C" | null>(null);
  const [slug, setSlug] = useState<string | null>(null);
  const [isDark, setIsDark] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    // Tema
    const saved = localStorage.getItem("dash-theme");
    if (saved === "dark") {
      setIsDark(true);
      document.documentElement.setAttribute("data-theme", "dark");
    } else {
      document.documentElement.removeAttribute("data-theme");
    }

    async function loadProfile() {
      try {
        const { data: { user }, error } = await supabase.auth.getUser();
        
        if (error || !user) {
          router.push("/entrar");
          return;
        }

        const { data: profile, error: profError } = await supabase
          .from("profiles")
          .select("*")
          .eq("user_id", user.id)
          .maybeSingle();

        if (profError || !profile) {
          setBusinessModel("B2B");
          return;
        }

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
            setBusinessModel(org.business_model as "B2B" | "B2C");
          } else {
            setBusinessModel("B2B");
          }
        } else {
          setBusinessModel("B2B");
        }

        setNome(profile.full_name || "Usuário");
        setAvatar(profile.avatar_url || null);
        setRole(profile.role || "admin");
        setSlug(profile.slug || null);

      } catch (err) {
        console.error("Erro no loadProfile:", err);
        setBusinessModel("B2B");
      }
    }

    loadProfile();
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
    console.log("Executando handleLogout no PanelLayout...");
    try {
      await supabase.auth.signOut();
      window.location.href = "/entrar";
    } catch (err) {
      console.error("Erro ao sair:", err);
      window.location.href = "/entrar";
    }
  }

  if (businessModel === null) {
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
      />

      <div className="flex flex-1 flex-col overflow-hidden">
        <TopHeader 
          nome={nome}
          avatar={avatar}
          role={role}
          slug={slug}
          businessModel={businessModel}
          isDark={isDark}
          toggleTheme={toggleTheme}
          handleLogout={handleLogout}
          onMenuClick={() => setIsSidebarOpen(true)}
        />

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
