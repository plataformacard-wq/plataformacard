"use client";

import Link from "next/link";
import { FormEvent, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { GoogleLogin } from "@react-oauth/google";
import { resolveSlugToEmail } from "./actions";
import { Mail, Lock, Eye, EyeOff } from "lucide-react";
import { Plus_Jakarta_Sans } from "next/font/google";

const plusJakarta = Plus_Jakarta_Sans({ subsets: ["latin"], weight: ["400", "500", "600", "700", "800"] });

export default function LoginPage() {
  const router = useRouter();
  const supabase = createClient();

  const [loginInput, setLoginInput] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loadingEmail, setLoadingEmail] = useState(false);
  const [loadingGoogle, setLoadingGoogle] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

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

      // Verificação de 2FA
      const { getMfaStatus } = await import("@/lib/auth/mfaActions");
      const mfaStatus = await getMfaStatus();
      
      if (mfaStatus.isEnabled && !mfaStatus.isDeviceTrusted) {
        router.push("/entrar/2fa");
        router.refresh();
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
    <main className="relative flex min-h-screen flex-col items-center justify-center bg-[#0a0a0a] px-4 py-10 text-white overflow-hidden">
      {/* Grid Pattern Background */}
      <div 
        className="absolute inset-0 pointer-events-none" 
        style={{
          backgroundImage: `linear-gradient(to right, rgba(255, 255, 255, 0.04) 1px, transparent 1px), linear-gradient(to bottom, rgba(255, 255, 255, 0.04) 1px, transparent 1px)`,
          backgroundSize: '40px 40px',
          maskImage: 'radial-gradient(ellipse at center, rgba(0,0,0,0.6) 0%, rgba(0,0,0,0) 70%)',
          WebkitMaskImage: 'radial-gradient(ellipse at center, rgba(0,0,0,0.6) 0%, rgba(0,0,0,0) 70%)'
        }}
      />
      {/* Smooth Radial Glow Backgrounds */}
      <div 
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(circle at 25% 30%, rgba(44, 203, 104, 0.08) 0%, transparent 50%), radial-gradient(circle at 75% 70%, rgba(6, 182, 212, 0.06) 0%, transparent 50%)'
        }}
      />

      {/* Header Logo (Desktop Absolute, Mobile inline) */}
      <div className="absolute top-8 left-8 hidden md:block">
        <Link href="/">
          <img src="/logo_fundo_escuro_ps.png" alt="PlataformaShop Logo" className="h-8 object-contain opacity-80 hover:opacity-100 transition-opacity" />
        </Link>
      </div>

      <div className="z-10 w-full max-w-md rounded-3xl border border-white/5 bg-[#141414]/80 p-8 shadow-2xl backdrop-blur-md">
        
        <div className="mb-8 flex flex-col items-center text-center">
          <Link href="/" className="mb-6 md:hidden">
            <img src="/logo_fundo_escuro_ps.png" alt="PlataformaShop Logo" className="h-8 object-contain" />
          </Link>
          <img src="/logo_fundo_escuro_ps.png" alt="PlataformaShop Logo" className="h-10 object-contain mb-6 hidden md:block" />
          
          <h1 className={`text-2xl font-bold text-white mb-2 ${plusJakarta.className}`}>Bem-vindo de Volta</h1>
          <p className="text-sm text-zinc-400">
            Entre para gerenciar seu catálogo digital
          </p>
        </div>

        <form onSubmit={handleEmailLogin} className="space-y-4">
          <div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none text-zinc-500 z-10">
                <Mail size={18} />
              </div>
              <input
                id="loginInput"
                type="text"
                value={loginInput}
                onChange={(e) => setLoginInput(e.target.value)}
                placeholder="E-mail ou Slug"
                className="w-full rounded-xl border border-white/10 bg-[#0a0a0a] py-3 pl-11 pr-4 text-sm text-white outline-none placeholder:text-zinc-600 focus:border-[#2CCB68] transition-colors"
                autoComplete="username"
                required
              />
            </div>
          </div>

          <div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none text-zinc-500 z-10">
                <Lock size={18} />
              </div>
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Digite sua senha"
                className="w-full rounded-xl border border-white/10 bg-[#0a0a0a] py-3 pl-11 pr-11 text-sm text-white outline-none placeholder:text-zinc-600 focus:border-[#2CCB68] transition-colors"
                autoComplete="current-password"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute inset-y-0 right-0 flex items-center pr-4 text-zinc-500 hover:text-white transition-colors z-10"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <div className="flex justify-end pb-2">
            <Link href="/recuperar-senha" className="text-xs text-zinc-400 hover:text-white transition-colors">
              Esqueceu a senha?
            </Link>
          </div>

          {errorMessage ? (
            <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
              {errorMessage === "auth_callback_failed" ? "Falha na autenticação. Tente novamente." : errorMessage}
            </div>
          ) : null}

          <button
            type="submit"
            disabled={loadingEmail}
            className={`w-full rounded-xl bg-gradient-to-r from-[#2CCB68] to-[#06B6D4] px-4 py-3 text-sm font-bold text-white shadow-[0_0_20px_rgba(44,203,104,0.15)] transition-all hover:shadow-[0_0_20px_rgba(44,203,104,0.3)] hover:opacity-90 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60 ${plusJakarta.className}`}
          >
            {loadingEmail ? "Entrando..." : "Entrar >"}
          </button>
        </form>

        <div className="my-6 flex items-center gap-3">
          <div className="h-px flex-1 bg-white/5" />
          <span className="text-xs text-zinc-600 uppercase font-medium tracking-widest">ou</span>
          <div className="h-px flex-1 bg-white/5" />
        </div>

        {loadingGoogle ? (
          <div className="flex w-full items-center justify-center rounded-xl px-4 py-3 text-sm font-semibold text-zinc-400">
            Acessando sistema...
          </div>
        ) : (
          <div className="flex w-full justify-center">
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

        <div className="mt-8 text-center text-xs text-zinc-500">
          Não tem uma conta?{" "}
          <Link href="/cadastro" className="font-semibold text-[#2CCB68] hover:text-[#06B6D4] transition-colors">
            Criar Conta
          </Link>
        </div>
      </div>

      {/* Footer Nav */}
      <footer className="absolute bottom-6 flex gap-6 text-xs text-zinc-600 font-medium z-10">
        <span>© {new Date().getFullYear()} PlataformaShop</span>
        <Link href="/termos" className="hover:text-zinc-400 transition-colors">Termos</Link>
        <Link href="/privacidade" className="hover:text-zinc-400 transition-colors">Privacidade</Link>
        <a href="https://wa.me/5527999999999" target="_blank" rel="noopener noreferrer" className="hover:text-zinc-400 transition-colors">Suporte</a>
      </footer>
    </main>
  );
}