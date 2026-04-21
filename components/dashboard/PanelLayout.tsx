"use client";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { TopHeader } from "@/components/dashboard/TopHeader";

type PanelLayoutProps = {
  children: React.ReactNode;
};

export function PanelLayout({ children }: PanelLayoutProps) {
  const router = useRouter();
  const supabase = createClient();
  const [nome, setNome] = useState("Carregando...");
  const [avatar, setAvatar] = useState<string | null>(null);
  const [role, setRole] = useState("seller");
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
        const {
          data: { user },
          error
        } = await supabase.auth.getUser();
        
        if (error || !user) {
          router.push("/entrar");
          return;
        }


        const { data: profile } = await supabase
          .from("profiles")
          .select("full_name, avatar_url, role, slug")
          .eq("user_id", user.id)
          .maybeSingle();

        // Prioridade 1: Nome no perfil | Prioridade 2: Nome nos metadados do auth | Prioridade 3: Prefixo do email
        const userFullName = profile?.full_name || user.user_metadata?.full_name || user.email?.split('@')[0] || "Usuário";

        if (profile) {
          setNome(userFullName);
          setAvatar(profile.avatar_url || null);
          setRole(profile.role || "b2b_admin");
          setSlug(profile.slug || null);
        } else {
          console.log("Perfil não encontrado, usando metadados.");
          setNome(userFullName);
          setRole("b2b_admin");
        }
      } catch (err) {
        console.error("Erro ao carregar perfil:", err);
        setNome("Usuário");
      }
    }

    loadProfile();
  }, [supabase, router]);

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

  return (
    <div className="flex min-h-screen bg-[var(--dash-bg)] text-[var(--dash-text-primary)] transition-colors duration-500">
      <Sidebar 
        role={role} 
        isOpen={isSidebarOpen} 
        onClose={() => setIsSidebarOpen(false)} 
      />

      <div className="flex flex-1 flex-col overflow-hidden">
        <TopHeader 
          nome={nome}
          avatar={avatar}
          role={role}
          slug={slug}
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
