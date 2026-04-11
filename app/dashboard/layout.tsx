"use client";
import { useEffect, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import Link from "next/link";

type DashboardLayoutProps = {
  children: React.ReactNode;
};

export default function DashboardLayout({
  children,
}: DashboardLayoutProps) {

  const router = useRouter();
  const supabase = createClient();
  const [nome, setNome] = useState("Cliente");
  const [avatar, setAvatar] = useState<string | null>(null);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement | null>(null);
  
  useEffect(() => {
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

  return () => {
    document.removeEventListener("mousedown", handleClickOutside);
  };
}, []);


async function handleLogout() {
  const confirmLogout = window.confirm("Deseja sair?");

  if (!confirmLogout) return;

  await supabase.auth.signOut();
  router.push("/entrar");
}

  return (
    <div className="min-h-screen bg-neutral-50">
      <header className="border-b border-neutral-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <span className="rounded-full bg-black px-3 py-1 text-xs font-medium text-white">
              PlataformaCard
            </span>

            <span className="text-sm text-neutral-500">
              painel do vendedor
            </span>
          </div>

          <nav className="flex items-center gap-6 text-sm font-medium">
            <Link
              href="/dashboard"
              className="text-neutral-700 hover:text-black"
            >
              Dashboard
            </Link>

            <Link
              href="/dashboard/perfil"
              className="text-neutral-700 hover:text-black"
            >
              Perfil
            </Link>

            <Link
              href="/dashboard/catalogo"
              className="text-neutral-700 hover:text-black"
            >
              Catálogo
            </Link>

            <Link
              href="/dashboard/analytics"
              className="text-neutral-700 hover:text-black"
            >
              Analytics
            </Link>

            <div
              ref={userMenuRef}
              className="relative flex items-center gap-3 pl-4 border-l border-neutral-200">
            <span className="text-neutral-600">
            Olá, <strong>{nome}</strong>
            </span>

            {avatar ? (
            <button
            type="button"
            onClick={() => setIsUserMenuOpen((prev) => !prev)}
            className="ml-3"
          >
          <img
           src={avatar}
           alt="avatar"
           className="h-9 w-9 rounded-full object-cover border"
            />
          </button>
           ) : (
           <button
           type="button"
           onClick={() => setIsUserMenuOpen((prev) => !prev)}
           className="ml-3 flex h-8 w-8 items-center justify-center rounded-full bg-black text-white"
           >
            A
           </button>
           )}

            {isUserMenuOpen && (
             <>
            <button
            type="button"
            aria-label="Fechar menu do usuário"
            onClick={() => setIsUserMenuOpen(false)}
            className="fixed inset-0 z-40 cursor-default"
            />

              <div className="absolute right-0 top-12 z-50 w-40 rounded-xl border border-neutral-200 bg-white p-2 shadow-lg">
              <Link
              href="/dashboard/perfil"
              onClick={() => setIsUserMenuOpen(false)}
              className="block w-full rounded-lg px-3 py-2 text-right text-sm text-neutral-700 hover:bg-neutral-100">
              Perfil
              </Link>

              <button
               type="button"
               onClick={handleLogout}
               className="w-full rounded-lg px-3 py-2 text-right text-sm text-neutral-700 hover:bg-neutral-100">
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