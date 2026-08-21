"use client";

import Link from "next/link";
import { FormEvent, useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { GoogleLogin } from "@react-oauth/google";
import { resolveSlugToEmail } from "@/app/entrar/actions";
import { Mail, Lock, Eye, EyeOff, ShieldCheck, ArrowRight } from "lucide-react";
import { Plus_Jakarta_Sans } from "next/font/google";

const plusJakarta = Plus_Jakarta_Sans({ subsets: ["latin"], weight: ["400", "500", "600", "700", "800"] });

type PageProps = {
  params: Promise<{ slug: string }>;
};

export default function OrgLoginPage(props: PageProps) {
  const params = use(props.params);
  const slug = params.slug;

  const router = useRouter();
  const supabase = createClient();

  const [orgData, setOrgData] = useState<{ name: string; logo_url?: string; favicon_url?: string; accent_color?: string } | null>(null);
  const [loginInput, setLoginInput] = useState(slug || "");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loadingEmail, setLoadingEmail] = useState(false);
  const [loadingGoogle, setLoadingGoogle] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    // Carregar informações da organização pelo slug
    async function loadOrg() {
      const { data: org } = await supabase
        .from("organizations")
        .select("name, logo_url, favicon_url, accent_color")
        .ilike("slug", slug)
        .maybeSingle();

      if (org) {
        setOrgData(org);
      } else {
        // Tenta buscar pelo perfil se não for org direta
        const { data: profile } = await supabase
          .from("profiles")
          .select("full_name, avatar_url, organization_id")
          .ilike("slug", slug)
          .maybeSingle();

        if (profile?.organization_id) {
          const { data: parentOrg } = await supabase
            .from("organizations")
            .select("name, logo_url, favicon_url, accent_color")
            .eq("id", profile.organization_id)
            .maybeSingle();
          if (parentOrg) setOrgData(parentOrg);
        }
      }
    }

    loadOrg();

    // Verificar se já está autenticado
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        router.replace("/dashboard");
      }
    });
  }, [slug, supabase, router]);

  async function handleEmailLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage("");
    setLoadingEmail(true);

    let finalEmail = loginInput.trim();

    if (!finalEmail.includes("@")) {
      const result = await resolveSlugToEmail(finalEmail);
      if (result.error || !result.email) {
        setLoadingEmail(false);
        setErrorMessage(result.error || "Login ou slug inválido.");
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
      setErrorMessage(error.message === "Invalid login credentials" ? "E-mail ou senha incorretos." : error.message);
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
          setErrorMessage("Acesso restrito.");
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

  const brandName = orgData?.name || "PlataformaShop";
  const brandLogo = orgData?.logo_url || orgData?.favicon_url || "/logo_fundo_escuro_ps.png";
  const accentColor = orgData?.accent_color || "#2CCB68";

  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center bg-[#0a0a0a] px-4 py-10 text-white overflow-hidden">
      {/* Background Grids */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: `linear-gradient(to right, rgba(255, 255, 255, 0.04) 1px, transparent 1px), linear-gradient(to bottom, rgba(255, 255, 255, 0.04) 1px, transparent 1px)`,
          backgroundSize: "40px 40px",
          maskImage: "radial-gradient(ellipse at center, rgba(0,0,0,0.6) 0%, rgba(0,0,0,0) 70%)",
          WebkitMaskImage: "radial-gradient(ellipse at center, rgba(0,0,0,0.6) 0%, rgba(0,0,0,0) 70%)",
        }}
      />
      {/* Glow Dynamic Color */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `radial-gradient(circle at 50% 30%, ${accentColor}15 0%, transparent 60%)`,
        }}
      />

      {/* Header Logo */}
      <div className="absolute top-8 left-8 hidden md:block">
        <Link href={`/${slug}`}>
          <img
            src="/logo_fundo_escuro_ps.png"
            alt="PlataformaShop"
            className="h-8 object-contain opacity-80 hover:opacity-100 transition-opacity"
          />
        </Link>
      </div>

      <div className="z-10 w-full max-w-md rounded-3xl border border-white/10 bg-[#141414]/90 p-8 shadow-2xl backdrop-blur-xl relative">
        {/* Top Accent Line */}
        <div
          className="absolute top-0 left-8 right-8 h-1 rounded-b-full"
          style={{ backgroundColor: accentColor }}
        />

        <div className="mb-8 flex flex-col items-center text-center pt-2">
          {brandLogo ? (
            <img
              src={brandLogo}
              alt={brandName}
              className="h-14 w-auto max-w-[180px] object-contain mb-4 rounded-xl"
            />
          ) : (
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center font-bold text-xl text-white mb-4 shadow-lg"
              style={{ backgroundColor: accentColor }}
            >
              {brandName.slice(0, 2).toUpperCase()}
            </div>
          )}

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-semibold text-zinc-300 mb-2">
            <ShieldCheck size={14} className="text-emerald-400" /> Portal de Acesso
          </div>

          <h1 className={`text-2xl font-bold text-white ${plusJakarta.className}`}>{brandName}</h1>
          <p className="text-xs text-zinc-400 mt-1">
            Digite suas credenciais para gerenciar o painel
          </p>
        </div>

        <form onSubmit={handleEmailLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-zinc-400 mb-1.5 pl-1">
              E-mail ou Usuário
            </label>
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
                className="w-full rounded-xl border border-white/10 bg-[#0a0a0a] py-3 pl-11 pr-4 text-sm text-white outline-none placeholder:text-zinc-600 focus:border-emerald-500 transition-colors"
                autoComplete="username"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-zinc-400 mb-1.5 pl-1">
              Senha de Acesso
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none text-zinc-500 z-10">
                <Lock size={18} />
              </div>
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full rounded-xl border border-white/10 bg-[#0a0a0a] py-3 pl-11 pr-11 text-sm text-white outline-none placeholder:text-zinc-600 focus:border-emerald-500 transition-colors"
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

          <div className="flex justify-end pb-1">
            <Link href="/recuperar-senha" className="text-xs text-zinc-400 hover:text-white transition-colors">
              Esqueceu a senha?
            </Link>
          </div>

          {errorMessage ? (
            <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
              {errorMessage}
            </div>
          ) : null}

          <button
            type="submit"
            disabled={loadingEmail}
            style={{ background: `linear-gradient(135deg, ${accentColor}, #06B6D4)` }}
            className={`w-full flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-bold text-white shadow-lg transition-all hover:opacity-90 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60 ${plusJakarta.className}`}
          >
            {loadingEmail ? "Entrando..." : (
              <>
                Entrar no Painel <ArrowRight size={16} />
              </>
            )}
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
                setErrorMessage("Falha na autenticação do Google.");
              }}
              theme="filled_black"
              shape="rectangular"
              text="signin_with"
            />
          </div>
        )}

        <div className="mt-8 text-center text-xs text-zinc-500">
          Precisa de suporte?{" "}
          <a href="https://wa.me/5527999999999" target="_blank" rel="noopener noreferrer" className="font-semibold text-emerald-400 hover:underline">
            Falar com a equipe
          </a>
        </div>
      </div>

      <footer className="absolute bottom-6 flex gap-6 text-xs text-zinc-600 font-medium z-10">
        <span>© {new Date().getFullYear()} PlataformaShop</span>
        <Link href="/termos" className="hover:text-zinc-400 transition-colors">Termos</Link>
        <Link href="/privacidade" className="hover:text-zinc-400 transition-colors">Privacidade</Link>
      </footer>
    </main>
  );
}
