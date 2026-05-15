"use client";
import { useEffect, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import Link from "next/link";

type DashboardLayoutProps = {
  children: React.ReactNode;
};

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const router = useRouter();
  const supabase = createClient();
  const [nome, setNome] = useState("Cliente");
  const [avatar, setAvatar] = useState<string | null>(null);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isDark, setIsDark] = useState(false);
  const userMenuRef = useRef<HTMLDivElement | null>(null);

  // Carrega preferência de tema e perfil
  useEffect(() => {
    const saved = localStorage.getItem("dash-theme");
    if (saved === "dark") {
      setIsDark(true);
      document.documentElement.setAttribute("data-theme", "dark");
    }

    async function loadProfile() {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profile } = await supabase
        .from("profiles")
        .select("full_name, avatar_url")
        .eq("user_id", user.id)
        .maybeSingle();

      if (profile) {
        setNome(profile.full_name || "Cliente");
        setAvatar(profile.avatar_url || null);
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

  return (
    <div
      className="min-h-screen transition-colors duration-200"
      style={{ background: "var(--dash-bg)" }}
    >
      <header
        className="border-b transition-colors duration-200"
        style={{
          background: "var(--dash-header-bg)",
          borderColor: "var(--dash-header-border)",
        }}
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <span
              className="rounded-full px-3 py-1 text-xs font-medium text-white"
              style={{ background: "var(--dash-text-primary)" }}
            >
              PlataformaCard
            </span>
            <span
              className="text-sm"
              style={{ color: "var(--dash-text-secondary)" }}
            >
              painel do vendedor
            </span>
          </div>

          <nav className="flex items-center gap-5 text-sm font-medium">
            {[
              { href: "/dashboard", label: "Dashboard" },
              { href: "/dashboard/perfil", label: "Perfil" },
              { href: "/dashboard/catalogo", label: "Catálogo" },
              { href: "/dashboard/analytics", label: "Analytics" },
            ].map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="transition-colors hover:opacity-70"
                style={{ color: "var(--dash-text-primary)" }}
              >
                {item.label}
              </Link>
            ))}

            {/* Toggle dark/light */}
            <button
              type="button"
              onClick={toggleTheme}
              aria-label={isDark ? "Ativar modo claro" : "Ativar modo escuro"}
              className="flex h-8 w-8 items-center justify-center rounded-full border transition-all hover:opacity-70"
              style={{
                borderColor: "var(--dash-border)",
                background: "var(--dash-surface)",
                color: "var(--dash-text-primary)",
              }}
            >
              {isDark ? "☀️" : "🌙"}
            </button>

            <div
              ref={userMenuRef}
              className="relative flex items-center gap-3 border-l pl-4"
              style={{ borderColor: "var(--dash-border)" }}
            >
              <span style={{ color: "var(--dash-text-secondary)" }}>
                Olá, <strong style={{ color: "var(--dash-text-primary)" }}>{nome}</strong>
              </span>

              {avatar ? (
                <button
                  type="button"
                  onClick={() => setIsUserMenuOpen((prev) => !prev)}
                  className="ml-2"
                >
                  <img
                    src={avatar}
                    alt="avatar"
                    className="h-9 w-9 rounded-full border object-cover"
                    style={{ borderColor: "var(--dash-border)" }}
                  />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setIsUserMenuOpen((prev) => !prev)}
                  className="ml-2 flex h-8 w-8 items-center justify-center rounded-full text-white text-sm font-semibold"
                  style={{ background: "var(--dash-text-primary)" }}
                >
                  {nome.charAt(0).toUpperCase()}
                </button>
              )}

              {isUserMenuOpen && (
                <>
                  <button
                    type="button"
                    aria-label="Fechar menu"
                    onClick={() => setIsUserMenuOpen(false)}
                    className="fixed inset-0 z-40 cursor-default"
                  />
                  <div
                    className="absolute right-0 top-12 z-50 w-44 rounded-xl border p-2 shadow-lg"
                    style={{
                      background: "var(--dash-surface)",
                      borderColor: "var(--dash-border)",
                    }}
                  >
                    <Link
                      href="/dashboard/perfil"
                      onClick={() => setIsUserMenuOpen(false)}
                      className="block w-full rounded-lg px-3 py-2 text-right text-sm transition-colors hover:opacity-70"
                      style={{ color: "var(--dash-text-primary)" }}
                    >
                      Perfil
                    </Link>
                    <button
                      type="button"
                      onClick={handleLogout}
                      className="w-full rounded-lg px-3 py-2 text-right text-sm transition-colors hover:opacity-70"
                      style={{ color: "var(--dash-text-primary)" }}
                    >
                      Sair
                    </button>
                  </div>
                </>
              )}
            </div>
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-10">{children}</main>
    </div>
  );
}