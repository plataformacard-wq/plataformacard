"use client";

import Link from "next/link";
import { FormEvent, useState, useEffect, Suspense } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useSearchParams } from "next/navigation";
import { isReservedSlug } from "@/lib/utils/reserved-slugs";
import { GoogleLogin } from "@react-oauth/google";
import { Mail, Lock, Eye, EyeOff, User, CheckCircle2 } from "lucide-react";
import { Plus_Jakarta_Sans } from "next/font/google";

const plusJakarta = Plus_Jakarta_Sans({ subsets: ["latin"], weight: ["400", "500", "600", "700", "800"] });

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

function CadastroContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [reservedSlug, setReservedSlug] = useState<string | null>(null);

  useEffect(() => {
    const refOrgId = searchParams?.get("ref");
    const refCatalogId = searchParams?.get("catalog");
    const reservedSlugParam = searchParams?.get("slug") || (typeof window !== "undefined" ? localStorage.getItem("reserved_slug") : null);

    if (refOrgId && refCatalogId) {
      localStorage.setItem("franchise_ref_org", refOrgId);
      localStorage.setItem("franchise_ref_catalog", refCatalogId);
    }
    if (reservedSlugParam) {
      localStorage.setItem("reserved_slug", reservedSlugParam);
      setReservedSlug(reservedSlugParam);
    }
  }, [searchParams]);

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [acceptTerms, setAcceptTerms] = useState(false);

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

    if (!acceptTerms) {
      setErrorMessage("Você deve aceitar os Termos de Uso e a Política de Privacidade para continuar.");
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

      if (data.session) {
        router.push("/dashboard");
        router.refresh();
      } else {
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
        
        <div className="z-10 w-full max-w-md rounded-3xl border border-white/5 bg-[#141414]/80 p-8 text-center shadow-2xl backdrop-blur-md">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-[#2CCB68]/10 text-[#2CCB68]">
            <CheckCircle2 size={40} />
          </div>
          <h2 className={`mb-2 text-2xl font-bold text-white ${plusJakarta.className}`}>Confirme seu E-mail</h2>
          <p className="mb-6 text-sm text-zinc-400 leading-relaxed">
            Enviamos um código de verificação para <strong className="text-white">{email}</strong>. 
            Insira-o abaixo para concluir seu cadastro e acessar o dashboard.
          </p>

          <form onSubmit={handleVerifyOtp} className="space-y-5 text-left">
            <div>
              <div className="relative flex items-center overflow-hidden rounded-xl border border-white/10 bg-[#0a0a0a] focus-within:border-[#2CCB68] transition-colors">
                <input
                  id="otpCode"
                  type="text"
                  maxLength={8}
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ""))}
                  placeholder="000000"
                  className="w-full bg-transparent py-4 text-center text-3xl font-black tracking-[0.5em] text-white outline-none placeholder:text-zinc-800"
                  autoComplete="off"
                />
              </div>
            </div>

            {otpError && (
              <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300 text-center">
                {otpError}
              </div>
            )}

            <button
              type="submit"
              disabled={verifyingOtp || otpCode.length < 6}
              className={`w-full rounded-xl bg-gradient-to-r from-[#2CCB68] to-[#06B6D4] px-4 py-3 text-sm font-bold text-white shadow-[0_0_20px_rgba(44,203,104,0.15)] transition-all hover:shadow-[0_0_20px_rgba(44,203,104,0.3)] hover:opacity-90 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60 ${plusJakarta.className}`}
            >
              {verifyingOtp ? "Verificando..." : "Validar Código"}
            </button>
          </form>

          <div className="mt-6 rounded-xl border border-white/5 bg-[#0a0a0a] p-4 text-xs text-zinc-500">
            <p>Não recebeu? Verifique sua pasta de Spam ou aguarde alguns minutos.</p>
          </div>
        </div>
      </main>
    );
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

      {/* Header Logo */}
      <div className="absolute top-8 left-8 hidden md:block">
        <Link href="/">
          <img src="/logo_fundo_escuro_ps.png" alt="PlataformaShop Logo" className="h-8 object-contain opacity-80 hover:opacity-100 transition-opacity" />
        </Link>
      </div>

      <div className="z-10 w-full max-w-md rounded-3xl border border-white/5 bg-[#141414]/80 p-8 shadow-2xl backdrop-blur-md my-8">
        
        <div className="mb-8 flex flex-col items-center text-center">
          <Link href="/" className="mb-6 md:hidden">
            <img src="/logo_fundo_escuro_ps.png" alt="PlataformaShop Logo" className="h-8 object-contain" />
          </Link>
          <img src="/logo_fundo_escuro_ps.png" alt="PlataformaShop Logo" className="h-10 object-contain mb-6 hidden md:block" />

          <h1 className={`text-2xl font-bold text-white mb-2 ${plusJakarta.className}`}>Crie sua Conta</h1>
          <p className="text-sm text-zinc-400">
            Cadastre-se para acessar o seu painel.
          </p>

          {reservedSlug && (
            <div className="mt-4 w-full flex items-center justify-center gap-2 p-2.5 rounded-xl bg-[#2CCB68]/10 border border-[#2CCB68]/20 text-[#2CCB68] text-xs font-semibold">
              <span className="w-2 h-2 rounded-full bg-[#2CCB68] animate-pulse shrink-0" />
              <span>Link reservado: <strong>anotameucontato.com.br/{reservedSlug}</strong></span>
            </div>
          )}
        </div>

        {loadingGoogle ? (
          <div className="flex w-full items-center justify-center rounded-xl px-4 py-3 text-sm font-semibold text-zinc-400 mb-6">
            Acessando sistema...
          </div>
        ) : (
          <div className="flex flex-col w-full items-center justify-center gap-3 mb-6">
            <div className="flex w-full justify-center">
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
          </div>
        )}

        <div className="my-6 flex items-center gap-3">
          <div className="h-px flex-1 bg-white/5" />
          <span className="text-xs text-zinc-600 uppercase font-medium tracking-widest">ou</span>
          <div className="h-px flex-1 bg-white/5" />
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">

          <div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none text-zinc-500 z-10">
                <User size={18} />
              </div>
              <input
                id="fullName"
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Seu nome completo"
                className="w-full rounded-xl border border-white/10 bg-[#0a0a0a] py-3 pl-11 pr-4 text-sm text-white outline-none placeholder:text-zinc-600 focus:border-[#2CCB68] transition-colors"
                autoComplete="name"
                required
              />
            </div>
          </div>

          <div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none text-zinc-500 z-10">
                <Mail size={18} />
              </div>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="voce@exemplo.com"
                className="w-full rounded-xl border border-white/10 bg-[#0a0a0a] py-3 pl-11 pr-4 text-sm text-white outline-none placeholder:text-zinc-600 focus:border-[#2CCB68] transition-colors"
                autoComplete="email"
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
                placeholder="Senha (mín. 6 caracteres)"
                className="w-full rounded-xl border border-white/10 bg-[#0a0a0a] py-3 pl-11 pr-11 text-sm text-white outline-none placeholder:text-zinc-600 focus:border-[#2CCB68] transition-colors"
                autoComplete="new-password"
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

          <div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none text-zinc-500 z-10">
                <Lock size={18} />
              </div>
              <input
                id="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Repita sua senha"
                className="w-full rounded-xl border border-white/10 bg-[#0a0a0a] py-3 pl-11 pr-11 text-sm text-white outline-none placeholder:text-zinc-600 focus:border-[#2CCB68] transition-colors"
                autoComplete="new-password"
                required
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword((prev) => !prev)}
                className="absolute inset-y-0 right-0 flex items-center pr-4 text-zinc-500 hover:text-white transition-colors z-10"
              >
                {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {errorMessage ? (
            <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
              {errorMessage}
            </div>
          ) : null}

          <div className="flex items-start gap-3 rounded-xl border border-white/5 bg-[#0a0a0a] p-4">
            <div className="mt-0.5 flex h-5 items-center">
              <input
                id="terms"
                type="checkbox"
                checked={acceptTerms}
                onChange={(e) => setAcceptTerms(e.target.checked)}
                className="h-4 w-4 rounded border-white/20 bg-[#0a0a0a] text-[#2CCB68] focus:ring-[#2CCB68] focus:ring-offset-[#141414]"
              />
            </div>
            <label htmlFor="terms" className="text-xs text-zinc-400">
              Li e concordo com os{" "}
              <Link href="/termos" target="_blank" className="font-medium text-white hover:text-[#2CCB68] transition-colors">
                Termos de Uso
              </Link>{" "}
              e a{" "}
              <Link href="/privacidade" target="_blank" className="font-medium text-white hover:text-[#2CCB68] transition-colors">
                Política de Privacidade
              </Link>
              .
            </label>
          </div>

          <button
            type="submit"
            disabled={loading || loadingGoogle || !acceptTerms}
            className={`w-full mt-2 rounded-xl bg-gradient-to-r from-[#2CCB68] to-[#06B6D4] px-4 py-3 text-sm font-bold text-white shadow-[0_0_20px_rgba(44,203,104,0.15)] transition-all hover:shadow-[0_0_20px_rgba(44,203,104,0.3)] hover:opacity-90 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60 ${plusJakarta.className}`}
          >
            {loading ? "Criando conta..." : "Criar Conta >"}
          </button>
        </form>

        <div className="mt-8 text-center text-xs text-zinc-500">
          Já tem conta?{" "}
          <Link href="/entrar" className="font-semibold text-[#2CCB68] hover:text-[#06B6D4] transition-colors">
            Entrar
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

export default function CadastroPage() {
  return (
    <Suspense fallback={
      <main className="min-h-screen flex items-center justify-center bg-[#0a0a0a]">
        <div className="w-8 h-8 border-4 border-[#2CCB68]/20 border-t-[#2CCB68] rounded-full animate-spin"></div>
      </main>
    }>
      <CadastroContent />
    </Suspense>
  );
}
