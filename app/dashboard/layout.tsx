"use client";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { TopHeader } from "@/components/dashboard/TopHeader";

type DashboardLayoutProps = {
  children: React.ReactNode;
};

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const router = useRouter();
  const supabase = createClient();
  const [nome, setNome] = useState("Cliente");
  const [avatar, setAvatar] = useState<string | null>(null);
  const [role, setRole] = useState("seller");
  const [isDark, setIsDark] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Carrega preferência de tema e perfil
  useEffect(() => {
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
          // Se houver erro de auth ou não houver usuário, redireciona
          console.warn("Sessão inválida ou expirada:", error?.message);
          router.push("/entrar");
          return;
        }

        const { data: profile } = await supabase
          .from("profiles")
          .select("full_name, avatar_url, role")
          .eq("user_id", user.id)
          .maybeSingle();

        if (profile) {
          setNome(profile.full_name || "Cliente");
          setAvatar(profile.avatar_url || null);
          setRole(profile.role || "b2c_admin");
        }
      } catch (err) {
        console.error("Erro ao carregar perfil:", err);
        router.push("/entrar");
      }
    }

    loadProfile();
  }, [supabase]);

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
    const confirmLogout = window.confirm("Deseja sair?");
    if (!confirmLogout) return;
    await supabase.auth.signOut();
    router.push("/entrar");
  }

  return (
    <div className="flex min-h-screen bg-[var(--dash-bg)] text-[var(--dash-text-primary)] transition-colors duration-500">
      {/* Sidebar Component */}
      <Sidebar 
        role={role} 
        isOpen={isSidebarOpen} 
        onClose={() => setIsSidebarOpen(false)} 
      />

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Top Header Component */}
        <TopHeader 
          nome={nome}
          avatar={avatar}
          role={role}
          isDark={isDark}
          toggleTheme={toggleTheme}
          handleLogout={handleLogout}
          onMenuClick={() => setIsSidebarOpen(true)}
        />

        {/* Page Content */}
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