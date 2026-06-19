"use client";

import Link from "next/link";
import { FormEvent, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

function GoogleIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5">
      <path
        fill="#EA4335"
        d="M12 10.2v3.9h5.4c-.2 1.3-1.5 3.9-5.4 3.9-3.2 0-5.8-2.7-5.8-6s2.6-6 5.8-6c1.8 0 3 .8 3.7 1.4l2.5-2.4C16.7 3.6 14.6 2.8 12 2.8 6.9 2.8 2.8 6.9 2.8 12S6.9 21.2 12 21.2c6.1 0 9.1-4.3 9.1-6.6 0-.4 0-.7-.1-1H12Z"
      />
      <path
        fill="#34A853"
        d="M2.8 12c0 1.7.6 3.2 1.6 4.5l3.7-2.9c-.2-.5-.4-1-.4-1.6s.1-1.1.4-1.6L4.4 7.5C3.4 8.8 2.8 10.3 2.8 12Z"
      />
      <path
        fill="#FBBC05"
        d="M12 21.2c2.6 0 4.8-.9 6.4-2.5l-3.1-2.4c-.8.6-1.9 1-3.3 1-2.5 0-4.6-1.7-5.3-4l-3.8 2.9c1.7 3.1 5 5 9.1 5Z"
      />
      <path
        fill="#4285F4"
        d="M21.1 13c.1-.4.1-.8.1-1.2s0-.8-.1-1.2H12v3.9h5.4c-.3 1.2-1 2.1-2 2.8l3.1 2.4c1.8-1.7 2.6-4.1 2.6-6.7Z"
      />
    </svg>
  );
}

export default function LoginPage() {
  const router = useRouter();
  const supabase = createClient();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loadingEmail, setLoadingEmail] = useState(false);
  const [loadingGoogle, setLoadingGoogle] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // Redireciona se já estiver logado (validação segura com getUser para evitar loops)
  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        router.replace("/dashboard");
      }
    });
  }, [supabase, router]);

  async function handleEmailLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage("");
    setLoadingEmail(true);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setLoadingEmail(false);
      setErrorMessage(error.message);
      return;
    }

    router.push("/dashboard");
    router.refresh();
  }

  async function handleGoogleLogin() {
    setErrorMessage("");
    setLoadingGoogle(true);

    const origin = typeof window !== "undefined" ? window.location.origin : "";

    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${origin}/auth/callback`,
      },
    });

    if (error) {
      setLoadingGoogle(false);
      setErrorMessage(error.message);
    }
  }

  return (
    <main className="min-h-screen bg-zinc-950 px-4 py-10 text-white">
      <div className="mx-auto w-full max-w-md rounded-2xl border border-white/10 bg-white/5 p-6 shadow-2xl backdrop-blur">
        <div className="mb-8">
          <div className="inline-flex rounded-full bg-white px-3 py-1 text-[10px] font-black uppercase tracking-widest text-black mb-4">
            PlataformaCard
          </div>
          <h1 className="text-2xl font-bold">Entrar</h1>
          <p className="mt-2 text-sm text-zinc-300">
            Acesse seu painel com email e senha ou entre com Google.
          </p>
        </div>

        <form onSubmit={handleEmailLogin} className="space-y-5">
          <div>
            <label htmlFor="email" className="mb-2 block text-sm font-medium">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="voce@exemplo.com"
              className="w-full rounded-xl border border-white/10 bg-zinc-900 px-4 py-3 text-sm outline-none transition focus:border-white/30"
              autoComplete="email"
              required
            />
          </div>

          <div>
            <label htmlFor="password" className="mb-2 block text-sm font-medium">
              Senha
            </label>
            <div className="flex overflow-hidden rounded-xl border border-white/10 bg-zinc-900 focus-within:border-white/30">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Sua senha"
                className="w-full bg-transparent px-4 py-3 text-sm outline-none"
                autoComplete="current-password"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="px-4 text-sm text-zinc-300 transition hover:text-white"
              >
                {showPassword ? "Ocultar" : "Mostrar"}
              </button>
            </div>
          </div>

          {errorMessage ? (
            <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
              {errorMessage === "auth_callback_failed" ? "Falha na autenticação. Tente novamente." : errorMessage}
            </div>
          ) : null}

          <button
            type="submit"
            disabled={loadingEmail}
            className="w-full rounded-xl bg-white px-4 py-3 text-sm font-semibold text-zinc-950 transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loadingEmail ? "Entrando..." : "Entrar com email"}
          </button>
        </form>

        <div className="my-6 flex items-center gap-3">
          <div className="h-px flex-1 bg-white/10" />
          <span className="text-sm text-zinc-500">ou</span>
          <div className="h-px flex-1 bg-white/10" />
        </div>

        <button
          type="button"
          onClick={handleGoogleLogin}
          disabled={loadingGoogle}
          className="flex w-full items-center justify-center gap-3 rounded-xl border border-white/10 bg-zinc-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <GoogleIcon />
          <span>
            {loadingGoogle ? "Redirecionando..." : "Entrar com Google"}
          </span>
        </button>

        <div className="mt-6 text-center text-sm text-zinc-300">
          Não tem conta?{" "}
          <Link href="/cadastro" className="font-medium text-white hover:underline">
            Cadastrar-se
          </Link>
        </div>
      </div>
    </main>
  );
}