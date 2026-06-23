"use client";

import Link from "next/link";
import { FormEvent, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { isReservedSlug } from "@/lib/utils/reserved-slugs";
import { GoogleLogin } from "@react-oauth/google";



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

  const [success, setSuccess] = useState(false);

  const [otpCode, setOtpCode] = useState("");
  const [verifyingOtp, setVerifyingOtp] = useState(false);
  const [otpError, setOtpError] = useState("");

  async function handleGoogleSuccess(credentialResponse: any) {
    setErrorMessage("");
    setLoadingGoogle(true);
    const supabase = createClient();

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

      const user = data.user;
      if (user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("slug")
          .eq("user_id", user.id)
          .maybeSingle();

        if (profile?.slug) {
          router.push("/dashboard");
        } else {
          router.push("/onboarding");
        }
      }
    } catch (err: any) {
      setErrorMessage("Ocorreu um erro no login com o Google.");
      setLoadingGoogle(false);
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

    if (isReservedSlug(generatedSlug)) {
      setErrorMessage("Este nome de usuário é reservado pelo sistema. Por favor, tente outro.");
      return;
    }

    setLoading(true);

    try {
      const redirectTo =
        typeof window !== "undefined"
          ? `${window.location.origin}/auth/callback`
          : undefined;

      const { data, error } = await supabase.auth.signUp({
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
        if (error.message.includes("security purposes")) {
          setErrorMessage("Muitas tentativas seguidas. Aguarde 60 segundos e tente novamente.");
        } else {
          setErrorMessage(error.message);
        }
        return;
      }

      // Se houver sesso (Auto Confirm ligado), vai direto pro dashboard
      if (data.session) {
        router.push("/dashboard");
        router.refresh();
      } else {
        // Se no, avisa que precisa confirmar o e-mail
        setSuccess(true);
      }
    } catch (err) {
      setErrorMessage("Ocorreu um erro ao criar sua conta. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }

  async function handleVerifyOtp(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setOtpError("");

    if (otpCode.length < 6 || otpCode.length > 8) {
      setOtpError("O código deve ter entre 6 e 8 dígitos.");
      return;
    }

    setVerifyingOtp(true);
    const supabase = createClient();

    try {
      const { data, error } = await supabase.auth.verifyOtp({
        email: email.trim().toLowerCase(),
        token: otpCode,
        type: "signup",
      });

      if (error) {
        setOtpError(error.message);
        return;
      }

      if (data.session) {
        router.push("/dashboard");
        router.refresh();
      } else {
        setOtpError("Sessão não iniciada. Tente fazer login.");
      }
    } catch (err) {
      setOtpError("Ocorreu um erro ao verificar o código. Tente novamente.");
    } finally {
      setVerifyingOtp(false);
    }
  }

  if (success) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-zinc-950 px-4 text-white">
        <div className="w-full max-w-md rounded-2xl border border-white/10 bg-white/5 p-8 text-center shadow-2xl backdrop-blur">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-500">
            <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
          </div>
          <h2 className="mb-2 text-2xl font-bold">Confirme seu E-mail</h2>
          <p className="mb-6 text-sm text-zinc-400">
            Enviamos um código de verificação para <strong>{email}</strong>. 
            Insira-o abaixo para concluir seu cadastro e acessar o dashboard.
          </p>

          <form onSubmit={handleVerifyOtp} className="space-y-5 text-left">
            <div>
              <label htmlFor="otpCode" className="mb-2 block text-sm font-medium text-center">
                Código de Verificação
              </label>
              <input
                id="otpCode"
                type="text"
                maxLength={8}
                value={otpCode}
                onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ""))}
                placeholder="Digite o código"
                className="w-full rounded-xl border border-white/10 bg-zinc-900 px-4 py-3 text-center text-2xl tracking-widest outline-none transition focus:border-white/30"
                autoComplete="off"
              />
            </div>

            {otpError && (
              <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300 text-center">
                {otpError}
              </div>
            )}

            <button
              type="submit"
              disabled={verifyingOtp || otpCode.length < 6}
              className="w-full rounded-xl bg-white px-4 py-3 text-sm font-semibold text-zinc-950 transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {verifyingOtp ? "Verificando..." : "Validar Código"}
            </button>
          </form>

          <div className="mt-6 rounded-xl border border-white/5 bg-white/5 p-4 text-xs text-zinc-500">
            <p>Não recebeu? Verifique sua pasta de Spam ou aguarde alguns minutos.</p>
          </div>
        </div>
      </main>
    );
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
              text="signup_with"
            />
          </div>
        )}

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