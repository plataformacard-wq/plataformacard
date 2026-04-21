import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/entrar");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("user_id", user.id)
    .single();

  if (profile?.role !== "superadmin") {
    redirect("/dashboard");
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      <header className="border-b border-white/10 bg-zinc-900/50 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <span className="rounded-full bg-white px-3 py-1 text-xs font-bold text-black">
              PLATAFORMA CARD
            </span>
            <span className="text-sm text-zinc-400">SaaS QG</span>
          </div>

          <nav className="flex items-center gap-5 text-sm font-medium">
            <Link href="/admin" className="text-white hover:text-emerald-400 transition-colors">
              Visão Geral
            </Link>
            <Link href="/dashboard" className="text-zinc-400 hover:text-white transition-colors">
              Voltar ao Meu Cartão
            </Link>
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-10">
        {children}
      </main>
    </div>
  );
}