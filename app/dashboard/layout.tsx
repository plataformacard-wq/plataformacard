"use client";
import { useEffect, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { 
  LayoutDashboard, 
  Building2, 
  BookOpen, 
  User, 
  Users, 
  BarChart3, 
  Settings, 
  LogOut, 
  Sun, 
  Moon,
  ChevronDown
} from "lucide-react";

type DashboardLayoutProps = {
  children: React.ReactNode;
};

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const router = useRouter();
  const pathname = usePathname();
  const supabase = createClient();
  const [nome, setNome] = useState("Cliente");
  const [avatar, setAvatar] = useState<string | null>(null);
  const [role, setRole] = useState("seller");
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isDark, setIsDark] = useState(false);
  const userMenuRef = useRef<HTMLDivElement | null>(null);

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
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

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
    }

    loadProfile();
  }, []);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        userMenuRef.current &&
        !userMenuRef.current.contains(event.target as Node)
      ) {
        setIsUserMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

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

  const navLinks = [
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard }
  ];

  if (role === "superadmin") {
    navLinks.push({ href: "/admin", label: "Painel MAJ", icon: Settings });
  }

  if (role !== "seller") {
    navLinks.push({ href: "/dashboard/empresa", label: "Empresa", icon: Building2 });
    navLinks.push({ href: "/dashboard/catalogo", label: "Catálogo", icon: BookOpen });
  }

  navLinks.push({ href: "/dashboard/perfil", label: "Perfil", icon: User });

  if (role === "b2b_admin" || role === "superadmin") {
    navLinks.push({ href: "/dashboard/vendedores", label: "Vendedores", icon: Users });
  }

  navLinks.push({ href: "/dashboard/analytics", label: "Analytics", icon: BarChart3 });

  return (
    <div className="min-h-screen bg-[var(--dash-bg)] text-[var(--dash-text-primary)] transition-colors duration-500">
      <header className="sticky top-0 z-40 w-full px-6 py-4">
        <motion.div 
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="glass mx-auto flex max-w-7xl items-center justify-between rounded-2xl px-6 py-3 shadow-premium"
        >
          <div className="flex items-center gap-4">
            <Link href="/dashboard" className="flex items-center gap-2 group">
              <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center shadow-lg shadow-primary/20 group-hover:scale-110 transition-transform">
                <span className="text-white font-bold text-xs">P</span>
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-bold tracking-tight leading-none">PlataformaCard</span>
                <span className="text-[10px] text-[var(--dash-text-muted)] font-medium uppercase tracking-wider">Painel Gestor</span>
              </div>
            </Link>
          </div>

          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`relative flex items-center gap-2 px-4 py-2 text-sm font-medium transition-all rounded-lg group ${
                    isActive 
                      ? "text-primary" 
                      : "text-[var(--dash-text-secondary)] hover:text-[var(--dash-text-primary)] hover:bg-[var(--dash-hover-bg)]"
                  }`}
                >
                  <item.icon size={16} strokeWidth={isActive ? 2.5 : 2} />
                  {item.label}
                  {isActive && (
                    <motion.div
                      layoutId="nav-active"
                      className="absolute inset-0 bg-primary/5 rounded-lg -z-10"
                      transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                    />
                  )}
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={toggleTheme}
              className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--dash-surface)] border border-[var(--dash-border)] text-[var(--dash-text-secondary)] shadow-sm transition-all hover:bg-[var(--dash-hover-bg)] hover:text-primary active:scale-95"
            >
              {isDark ? <Sun size={18} /> : <Moon size={18} />}
            </button>

            <div ref={userMenuRef} className="relative">
              <button
                type="button"
                onClick={() => setIsUserMenuOpen((prev) => !prev)}
                className="flex items-center gap-3 rounded-xl p-1 pr-3 transition-all hover:bg-[var(--dash-hover-bg)] active:scale-95"
              >
                {avatar ? (
                  <img
                    src={avatar}
                    alt={nome}
                    className="h-9 w-9 rounded-lg border border-[var(--dash-border)] object-cover shadow-sm"
                  />
                ) : (
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-white text-sm font-bold shadow-md shadow-primary/20">
                    {nome.charAt(0).toUpperCase()}
                  </div>
                )}
                <div className="hidden sm:flex flex-col items-start">
                  <span className="text-xs font-semibold leading-none">{nome}</span>
                  <span className="text-[10px] text-[var(--dash-text-muted)] font-medium capitalize">{role.replace("_", " ")}</span>
                </div>
                <ChevronDown size={14} className={`text-[var(--dash-text-muted)] transition-transform duration-300 ${isUserMenuOpen ? 'rotate-180' : ''}`} />
              </button>

              <AnimatePresence>
                {isUserMenuOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="absolute right-0 top-full mt-2 w-56 glass rounded-2xl p-2 shadow-deep overflow-hidden z-50"
                  >
                    <div className="px-3 py-2 mb-1">
                      <p className="text-[10px] font-bold text-[var(--dash-text-muted)] uppercase tracking-wider">Minha Conta</p>
                    </div>
                    <Link
                      href="/dashboard/perfil"
                      onClick={() => setIsUserMenuOpen(false)}
                      className="flex items-center gap-3 w-full rounded-xl px-3 py-2.5 text-sm font-medium text-[var(--dash-text-secondary)] transition-all hover:bg-[var(--dash-hover-bg)] hover:text-primary"
                    >
                      <User size={16} />
                      Meu Perfil
                    </Link>
                    <button
                      type="button"
                      onClick={handleLogout}
                      className="flex items-center gap-3 w-full rounded-xl px-3 py-2.5 text-sm font-medium text-red-500 transition-all hover:bg-red-50 dark:hover:bg-red-500/10"
                    >
                      <LogOut size={16} />
                      Sair da conta
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </motion.div>
      </header>

      <main className="mx-auto max-w-7xl px-6 pb-20 pt-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
        >
          {children}
        </motion.div>
      </main>
    </div>
  );
}