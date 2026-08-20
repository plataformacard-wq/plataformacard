"use client";

import { FormEvent, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function MainLoginPage() {
  const router = useRouter();
  const supabase = createClient();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // Se já estiver logado, checar nível de 2FA antes de redirecionar para o MAIN
  useEffect(() => {
    async function checkAuthAndMfa() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("user_id", user.id)
        .maybeSingle();

      if (profile?.role !== "main_admin") {
        return;
      }

      // 🔒 Checagem de 2FA para o Super Admin
      const { data: aalData } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
      if (aalData?.currentLevel === "aal1" && aalData?.nextLevel === "aal2") {
        router.replace("/entrar/2fa?redirect=/main");
        return;
      }

      const { data: factorsData } = await supabase.auth.mfa.listFactors();
      const verifiedFactors = factorsData?.all?.filter((f) => f.status === "verified") || [];

      if (verifiedFactors.length === 0) {
        router.replace("/dashboard/perfil?mfa_required=true");
        return;
      }

      router.replace("/main");
    }

    checkAuthAndMfa();
  }, [supabase, router]);

  async function handleLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage("");
    setLoading(true);

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setLoading(false);
      setErrorMessage(error.message);
      return;
    }

    // Verificar se realmente é um main_admin antes de prosseguir
    if (data.user) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("user_id", data.user.id)
        .single();

      if (profile?.role !== "main_admin") {
        await supabase.auth.signOut();
        setLoading(false);
        setErrorMessage("Acesso Negado. Esta área é restrita para o Main Admin.");
        return;
      }

      // 🔒 1. Verificar se a conta possui 2FA ativo que precisa de desafio (AAL2)
      const { data: aalData } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
      if (aalData?.currentLevel === "aal1" && aalData?.nextLevel === "aal2") {
        router.push("/entrar/2fa?redirect=/main");
        return;
      }

      // 🔒 2. Verificar se o Super Admin ainda não ativou o 2FA (obrigatoriedade)
      const { data: factorsData } = await supabase.auth.mfa.listFactors();
      const verifiedFactors = factorsData?.all?.filter((f) => f.status === "verified") || [];

      if (verifiedFactors.length === 0) {
        router.push("/dashboard/perfil?mfa_required=true");
        return;
      }
    }

    router.push("/main");
    router.refresh();
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-zinc-950 px-4 text-white">
      <div className="w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-xl p-8 shadow-2xl relative overflow-hidden">
        {/* Glow Effect Sutil */}
        <div className="absolute -top-32 -right-32 w-64 h-64 bg-indigo-600 rounded-full blur-3xl opacity-10"></div>

        <div className="mb-8">
          <div className="inline-flex rounded-full bg-indigo-500/10 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-indigo-400 mb-4 border border-indigo-500/20">
            PORTAL MAIN
          </div>
          <h1 className="text-2xl font-bold tracking-tight">Main Login</h1>
          <p className="mt-2 text-sm text-zinc-400">
            Acesso administrativo global.
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label htmlFor="email" className="mb-2 block text-xs font-semibold text-zinc-400 uppercase tracking-wider">
              Email Oficial
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@suaempresa.com"
              className="w-full rounded-lg border border-zinc-800 bg-zinc-950 px-4 py-2.5 text-sm outline-none transition focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50"
              autoComplete="email"
              required
            />
          </div>

          <div>
            <label htmlFor="password" className="mb-2 block text-xs font-semibold text-zinc-400 uppercase tracking-wider">
              Senha de Acesso
            </label>
            <div className="flex overflow-hidden rounded-lg border border-zinc-800 bg-zinc-950 focus-within:border-indigo-500/50 focus-within:ring-1 focus-within:ring-indigo-500/50">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-transparent px-4 py-2.5 text-sm outline-none"
                autoComplete="current-password"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="px-4 text-xs font-medium text-zinc-500 transition hover:text-zinc-300"
              >
                {showPassword ? "Ocultar" : "Mostrar"}
              </button>
            </div>
          </div>

          {errorMessage && (
            <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
              {errorMessage}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-50 mt-4"
          >
            {loading ? "Autenticando..." : "Acessar Portal"}
          </button>
        </form>
      </div>
    </main>
  );
}
