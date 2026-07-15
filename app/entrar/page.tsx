"use client";

import Link from "next/link";
import { FormEvent, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { GoogleLogin } from "@react-oauth/google";

import { resolveSlugToEmail } from "./actions";

export default function LoginPage() {
  const router = useRouter();
  const supabase = createClient();

  const [loginInput, setLoginInput] = useState("");
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

    let finalEmail = loginInput.trim();

    // Se não tiver '@', tentamos resolver como Slug de Vendedor
    if (!finalEmail.includes("@")) {
      const result = await resolveSlugToEmail(finalEmail);
      if (result.error || !result.email) {
        setLoadingEmail(false);
        setErrorMessage(result.error || "Slug inválido.");
        return;
      }
      finalEmail = result.email;
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email: finalEmail,
      password,
    });

    if (error) {
      setLoadingEmail(false);
      setErrorMessage(error.message);
      return;
    }

    if (data.user) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('user_id', data.user.id)
        .single();
        
      if (profile?.role === 'main_admin') {
        await supabase.auth.signOut();
        setLoadingEmail(false);
        setErrorMessage("Acesso restrito. Utilize o portal MAIN para administrar a plataforma.");
        return;
      }
    }

    router.push("/dashboard");
    router.refresh();
  }

  async function handleGoogleSuccess(credentialResponse: any) {
    setErrorMessage("");
    setLoadingGoogle(true);

    if (!credentialResponse.credential) {
      setLoadingGoogle(false);
      setErrorMessage("Erro ao obter o token do Google.");
      return;
    }

    try {
      const { data, error } = await supabase.auth.signInWithIdToken({
        provider: "google",
        token: credentialResponse.credential,
      });

      if (error) {
        setErrorMessage(error.message);
        setLoadingGoogle(false);
        return;
      }

      if (data.user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("role")
          .eq("user_id", data.user.id)
          .single();

        if (profile?.role === "main_admin") {
          await supabase.auth.signOut();
          setLoadingGoogle(false);
          setErrorMessage("Acesso restrito. Utilize o portal MAIN para administrar a plataforma.");
          return;
        }

        router.push("/dashboard");
        router.refresh();
      }
    } catch (err: any) {
      setErrorMessage("Ocorreu um erro no login com o Google.");
      setLoadingGoogle(false);
    }
  }

  return (
    <main className="min-h-screen bg-zinc-950 px-4 py-10 text-white">
      <div className="mx-auto w-full max-w-md rounded-2xl border border-white/10 bg-white/5 p-6 shadow-2xl backdrop-blur">
        <div className="mb-8">
          <div className="inline-flex rounded-full bg-white px-3 py-1 text-[10px] font-black uppercase tracking-widest text-black mb-4">
            PlataformaShop
          </div>
          <h1 className="text-2xl font-bold">Entrar</h1>
          <p className="mt-2 text-sm text-zinc-300">
            Acesse seu painel com email e senha ou entre com Google.
          </p>
        </div>

        <form onSubmit={handleEmailLogin} className="space-y-5">
          <div>
            <label htmlFor="loginInput" className="mb-2 block text-sm font-medium">
              Email do Lojista ou Slug do Vendedor
            </label>
            <input
              id="loginInput"
              type="text"
              value={loginInput}
              onChange={(e) => setLoginInput(e.target.value)}
              placeholder="voce@exemplo.com ou seu_slug"
              className="w-full rounded-xl border border-white/10 bg-zinc-900 px-4 py-3 text-sm outline-none transition focus:border-white/30"
              autoComplete="username"
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

        {loadingGoogle ? (
          <div className="flex w-full items-center justify-center rounded-xl border border-white/10 bg-zinc-900 px-4 py-3 text-sm font-semibold text-zinc-400">
            Acessando sistema...
          </div>
        ) : (
          <div className="flex w-full justify-center overflow-hidden rounded-xl">
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={() => {
                setErrorMessage("Falha na autenticação do Google. Tente novamente.");
              }}
              theme="filled_black"
              shape="rectangular"
              text="signin_with"
            />
          </div>
        )}

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