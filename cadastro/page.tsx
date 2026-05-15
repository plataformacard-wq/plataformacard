"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

function GoogleIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5 shrink-0">
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

function slugify(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

export default function CadastroPage() {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [loadingGoogle, setLoadingGoogle] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  async function handleGoogleSignUp() {
    setErrorMessage("");
    setLoadingGoogle(true);
    const supabase = createClient();

    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: window.location.origin + "/auth/callback",
      },
    });

    if (error) {
      setLoadingGoogle(false);
      setErrorMessage(error.message);
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const supabase = createClient();

    setErrorMessage("");

    const trimmedName = fullName.trim();
    const trimmedEmail = email.trim().toLowerCase();

    if (!trimmedName) {
      setErrorMessage("Preencha seu nome.");
      return;
    }

    if (!trimmedEmail) {
      setErrorMessage("Preencha seu email.");
      return;
    }

    if (password.length < 6) {
      setErrorMessage("A senha deve ter pelo menos 6 caracteres.");
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage("A confirmação de senha não confere.");
      return;
    }

    const generatedSlug = slugify(trimmedName);

    if (!generatedSlug) {
      setErrorMessage("Não foi possível gerar um slug válido com esse nome.");
      return;
    }

    setLoading(true);

    try {
      const redirectTo =
        typeof window !== "undefined"
          ? `${window.location.origin}/auth/callback`
          : undefined;

      const { error } = await supabase.auth.signUp({
        email: trimmedEmail,
        password,
        options: {
          emailRedirectTo: redirectTo,
          data: {
            full_name: trimmedName,
            slug: generatedSlug,
          },
        },
      });

      if (error) {
        setErrorMessage(error.message);
        return;
      }

      // Redireciona para a página de sucesso
      router.push("/cadastro/sucesso");
    } catch {
      setErrorMessage("Ocorreu um erro ao criar sua conta. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-zinc-950 px-4 py-10 text-white">
      <div className="mx-auto w-full max-w-md rounded-2xl border border-white/10 bg-white/5 p-6 shadow-2xl backdrop-blur">
        <div className="mb-8">
          <h1 className="text-2xl font-bold">Criar conta</h1>
          <p className="mt-2 text-sm text-zinc-300">
            Cadastre-se para acessar o seu painel na PlataformaCard.
          </p>
        </div>

        <button
          type="button"
          onClick={handleGoogleSignUp}
          disabled={loading || loadingGoogle}
          className="flex w-full items-center justify-center gap-3 rounded-xl border border-white/10 bg-zinc-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <GoogleIcon />
          {loadingGoogle ? "Redirecionando..." : "Cadastrar com Google"}
        </button>

        <div className="my-6 flex items-center gap-3">
          <div className="h-px flex-1 bg-white/10" />
          <span className="text-sm text-zinc-500">ou</span>
          <div className="h-px flex-1 bg-white/10" />
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label htmlFor="fullName" className="mb-2 block text-sm font-medium">
              Nome
            </label>
            <input
              id="fullName"
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Seu nome completo"
              className="w-full rounded-xl border border-white/10 bg-zinc-900 px-4 py-3 text-sm outline-none transition focus:border-white/30"
              autoComplete="name"
            />
          </div>

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
                placeholder="Mínimo de 6 caracteres"
                className="w-full bg-transparent px-4 py-3 text-sm outline-none"
                autoComplete="new-password"
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

          <div>
            <label
              htmlFor="confirmPassword"
              className="mb-2 block text-sm font-medium"
            >
              Confirmar senha
            </label>

            <div className="flex overflow-hidden rounded-xl border border-white/10 bg-zinc-900 focus-within:border-white/30">
              <input
                id="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Repita sua senha"
                className="w-full bg-transparent px-4 py-3 text-sm outline-none"
                autoComplete="new-password"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword((prev) => !prev)}
                className="px-4 text-sm text-zinc-300 transition hover:text-white"
              >
                {showConfirmPassword ? "Ocultar" : "Mostrar"}
              </button>
            </div>
          </div>

          {errorMessage ? (
            <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
              {errorMessage}
            </div>
          ) : null}

          <button
            type="submit"
            disabled={loading || loadingGoogle}
            className="w-full rounded-xl bg-white px-4 py-3 text-sm font-semibold text-zinc-950 transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Criando conta..." : "Criar conta"}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-zinc-300">
          Já tem conta?{" "}
          <Link href="/entrar" className="font-medium text-white hover:underline">
            Entrar
          </Link>
        </div>
      </div>
    </main>
  );
}