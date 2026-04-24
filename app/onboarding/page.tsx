"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { isReservedSlug } from "@/lib/utils/reserved-slugs";

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

import { Building2, User, LayoutGrid, Check, ArrowRight, ChevronLeft, Camera, Upload } from "lucide-react";
import ImageUploadModal from "@/components/dashboard/ImageUploadModal";
import { motion, AnimatePresence } from "framer-motion";

const SLUG_PATTERN = /^[a-z0-9-]+$/;

function displayNameFromUser(user: {
  user_metadata?: Record<string, unknown>;
  email?: string | null;
}): string {
  const meta = user.user_metadata ?? {};
  const fromMeta =
    (typeof meta.full_name === "string" && meta.full_name) ||
    (typeof meta.name === "string" && meta.name) ||
    "";
  if (fromMeta.trim()) return fromMeta.trim();
  if (user.email) {
    return user.email.split("@")[0]?.trim() ?? "";
  }
  return "";
}

export default function OnboardingPage() {
  const router = useRouter();

  const [initializing, setInitializing] = useState(true);
  const [step, setStep] = useState(1); // 1: Model, 2: Profile
  const [businessModel, setBusinessModel] = useState<"B2B" | "B2C" | "CaaS" | null>(null);
  
  const [fullName, setFullName] = useState("");
  const [slug, setSlug] = useState("");
  const [slugManual, setSlugManual] = useState(false);
  const [whatsapp, setWhatsapp] = useState("");
  const [bio, setBio] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);

  const [slugError, setSlugError] = useState("");
  const [whatsappError, setWhatsappError] = useState("");
  const [formError, setFormError] = useState("");

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const supabase = createClient();

    async function loadSession() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (cancelled) return;

      if (!user) {
        router.replace("/entrar");
        return;
      }

      const name = displayNameFromUser(user);
      
      // Verificar se o usuário tem permissão para Onboarding (Role 'authorized')
      const { data: profile } = await supabase
        .from("profiles")
        .select("role, organization_id")
        .eq("user_id", user.id)
        .maybeSingle();

      if (profile?.organization_id) {
        router.replace("/dashboard");
        return;
      }

      if (profile?.role !== "authorized") {
        router.replace("/dashboard");
        return;
      }

      setFullName(name);
      setSlug(slugify(name));
      setSlugManual(false);
      setInitializing(false);
    }

    loadSession();

    return () => {
      cancelled = true;
    };
  }, [router]);

  function handleFullNameChange(value: string) {
    setFullName(value);
    if (!slugManual) {
      setSlug(slugify(value));
    }
  }

  function handleSlugChange(value: string) {
    setSlugManual(true);
    const next = value
      .toLowerCase()
      .split("")
      .filter((ch) => /[a-z0-9-]/.test(ch))
      .join("");
    setSlug(next);
  }

  function validate(): boolean {
    let ok = true;
    setSlugError("");
    setWhatsappError("");

    const trimmedSlug = slug.trim();
    if (!trimmedSlug) {
      setSlugError("O slug é obrigatório.");
      ok = false;
    } else if (trimmedSlug.length < 3) {
      setSlugError("O slug deve ter no mínimo 3 caracteres.");
      ok = false;
    } else if (!SLUG_PATTERN.test(trimmedSlug)) {
      setSlugError("Use apenas letras minúsculas, números e hífens.");
      ok = false;
    } else if (isReservedSlug(trimmedSlug)) {
      setSlugError("Este slug é reservado pelo sistema. Escolha outro.");
      ok = false;
    }

    if (!whatsapp.trim()) {
      setWhatsappError("O WhatsApp é obrigatório.");
      ok = false;
    }

    return ok;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError("");

    if (!validate()) return;

    setLoading(true);

    const supabase = createClient();

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setFormError("Sessão expirada. Entre novamente.");
        router.replace("/entrar");
        return;
      }

      if (!businessModel) {
        setStep(1);
        return;
      }

      const trimmedName = fullName.trim();
      const trimmedSlug = slug.trim();
      const trimmedWhatsapp = whatsapp.trim();
      const trimmedBio = bio.trim();

      // 1. Criar ou buscar Organização
      let orgId: string | null = null;
      
      // Para B2B e CaaS, geralmente criamos uma organização
      // Para B2C, também criamos uma organização "Pessoal" para manter a estrutura do app
      const orgName = businessModel === "B2B" ? `Empresa de ${trimmedName}` : trimmedName;
      
      const { data: newOrg, error: orgError } = await supabase
        .from("organizations")
        .insert({
          name: orgName,
          slug: trimmedSlug,
          business_model: businessModel,
          plan_id: "32c7b8a2-2bf7-43dd-b1a6-5706566fbfd0" // Starter
        })
        .select("id")
        .single();

      if (orgError) {
        if (orgError.code === "23505") {
          setSlugError("Este slug já está em uso por outra organização.");
          setLoading(false);
          return;
        }
        setFormError(`Erro ao criar organização: ${orgError.message}`);
        setLoading(false);
        return;
      }
      orgId = newOrg.id;

      // 2. Atualizar ou Criar Perfil
      const { data: existing, error: fetchError } = await supabase
        .from("profiles")
        .select("id")
        .eq("user_id", user.id)
        .maybeSingle();

      if (fetchError) {
        setFormError(
          fetchError.message || "Não foi possível salvar. Tente novamente."
        );
        return;
      }

      const roleMap = {
        B2B: "b2b_admin",
        B2C: "b2c_admin",
        CaaS: "caas_admin",
      };

      const payload = {
        full_name: trimmedName || null,
        slug: trimmedSlug,
        whatsapp: trimmedWhatsapp,
        bio: trimmedBio || null,
        avatar_url: avatarUrl || null,
        organization_id: orgId,
        role: roleMap[businessModel] || "admin"
      };

      const { error } = existing
        ? await supabase
            .from("profiles")
            .update(payload)
            .eq("user_id", user.id)
        : await supabase.from("profiles").insert({
            id: user.id,
            user_id: user.id,
            ...payload,
          });

      if (error) {
        if (error.code === "23505") {
          if (error.message.includes("slug")) {
            setSlugError("Este slug já está em uso. Escolha outro.");
          } else {
            setFormError(`Erro de constraint: ${error.message}`);
          }
          return;
        }
        setFormError(
          error.message || "Não foi possível salvar. Tente novamente."
        );
        return;
      }

      router.push("/dashboard");
    } catch {
      setFormError("Ocorreu um erro ao salvar. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }

  if (initializing) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-zinc-950 px-4 py-10 text-white">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-white/10 border-t-white" />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-zinc-950 px-4 py-10 text-white selection:bg-white/20">
      <div className="mx-auto w-full max-w-2xl">
        <AnimatePresence mode="wait">
          {step === 1 ? (
            <motion.div
              key="step1"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-8"
            >
              <div className="text-center">
                <h1 className="text-4xl font-black tracking-tight sm:text-5xl">
                  Escolha seu <span className="text-emerald-500">Modelo</span>
                </h1>
                <p className="mt-4 text-zinc-400">
                  Como você pretende utilizar a plataforma? Você poderá mudar isso depois.
                </p>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                {[
                  {
                    id: "B2B",
                    title: "Empresa",
                    desc: "Gestão de equipe e múltiplos vendedores.",
                    icon: Building2,
                    color: "blue",
                  },
                  {
                    id: "B2C",
                    title: "Autônomo",
                    desc: "Seu cartão digital pessoal e vitrine.",
                    icon: User,
                    color: "emerald",
                  },
                  {
                    id: "CaaS",
                    title: "Catálogo",
                    desc: "Vitrine digital direta, sem cartão pessoal.",
                    icon: LayoutGrid,
                    color: "violet",
                  },
                ].map((model) => (
                  <button
                    key={model.id}
                    onClick={() => setBusinessModel(model.id as any)}
                    className={`relative flex flex-col items-center rounded-3xl border p-6 text-center transition-all hover:scale-[1.02] ${
                      businessModel === model.id
                        ? "border-white bg-white/10 shadow-[0_0_20px_rgba(255,255,255,0.1)]"
                        : "border-white/5 bg-white/5 hover:border-white/20"
                    }`}
                  >
                    <div
                      className={`mb-4 flex h-14 w-14 items-center justify-center rounded-2xl ${
                        model.color === "blue"
                          ? "bg-blue-500/20 text-blue-400"
                          : model.color === "emerald"
                          ? "bg-emerald-500/20 text-emerald-400"
                          : "bg-violet-500/20 text-violet-400"
                      }`}
                    >
                      <model.icon size={28} />
                    </div>
                    <h3 className="text-lg font-bold">{model.title}</h3>
                    <p className="mt-2 text-xs text-zinc-500">{model.desc}</p>
                    {businessModel === model.id && (
                      <div className="absolute right-3 top-3 rounded-full bg-white p-1 text-black">
                        <Check size={12} strokeWidth={4} />
                      </div>
                    )}
                  </button>
                ))}
              </div>

              <div className="flex justify-center">
                <button
                  onClick={() => setStep(2)}
                  disabled={!businessModel}
                  className="flex items-center gap-2 rounded-full bg-white px-8 py-4 text-sm font-black text-black transition-all hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Próximo Passo <ArrowRight size={18} />
                </button>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="step2"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="mx-auto max-w-md space-y-8"
            >
              <div>
                <button
                  onClick={() => setStep(1)}
                  className="mb-6 flex items-center gap-1 text-xs font-bold uppercase tracking-widest text-zinc-500 transition-colors hover:text-white"
                >
                  <ChevronLeft size={14} /> Voltar
                </button>
                <h1 className="text-3xl font-black">Identidade Visual</h1>
                <p className="mt-2 text-zinc-400">
                  {businessModel === "CaaS" 
                    ? "Defina o link e o nome da sua vitrine digital."
                    : "Como os clientes vão te encontrar e entrar em contato."}
                </p>
              </div>

              {/* Avatar/Logo Upload Section */}
              <div className="flex flex-col items-center justify-center">
                <div className="relative group">
                  <button
                    type="button"
                    onClick={() => setIsImageModalOpen(true)}
                    className={`h-24 w-24 rounded-3xl border-2 border-dashed border-white/10 bg-white/5 flex flex-col items-center justify-center overflow-hidden transition-all hover:border-emerald-500/50 hover:bg-emerald-500/5 ${avatarUrl ? 'border-solid border-emerald-500/30' : ''}`}
                  >
                    {avatarUrl ? (
                      <img src={avatarUrl} alt="Preview" className="h-full w-full object-cover" />
                    ) : (
                      <>
                        <Camera size={24} className="text-zinc-500 group-hover:text-emerald-500 mb-1" />
                        <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 group-hover:text-emerald-500">
                          {businessModel === "CaaS" ? "Logo" : "Foto"}
                        </span>
                      </>
                    )}
                  </button>
                  {avatarUrl && (
                    <div className="absolute -right-2 -bottom-2 bg-emerald-500 text-black rounded-full p-1 border-4 border-zinc-950">
                      <Check size={12} strokeWidth={4} />
                    </div>
                  )}
                </div>
                <p className="mt-3 text-[10px] font-bold uppercase tracking-widest text-zinc-600">
                  {avatarUrl ? "Toque para alterar" : "Foto de Perfil / Logo"}
                </p>
              </div>

              <ImageUploadModal
                isOpen={isImageModalOpen}
                onClose={() => setIsImageModalOpen(false)}
                onUploadSuccess={(url) => setAvatarUrl(url)}
                bucket="avatars"
                folder="profiles"
                title={businessModel === "CaaS" ? "Upload do Logo" : "Sua Foto de Perfil"}
              />

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label htmlFor="fullName" className="mb-2 block text-sm font-bold uppercase tracking-wider text-zinc-500">
                    {businessModel === "CaaS" ? "Nome da Empresa / Vitrine" : "Seu Nome Completo"}
                  </label>
                  <input
                    id="fullName"
                    type="text"
                    value={fullName}
                    onChange={(e) => handleFullNameChange(e.target.value)}
                    placeholder={businessModel === "CaaS" ? "Ex: Padaria do João" : "Seu nome"}
                    className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-4 text-sm outline-none transition focus:border-white/30"
                    autoComplete="name"
                  />
                </div>

                <div>
                  <label htmlFor="slug" className="mb-2 block text-sm font-bold uppercase tracking-wider text-zinc-500">
                    Link da sua página
                  </label>
                  <div className="relative">
                    <input
                      id="slug"
                      type="text"
                      value={slug}
                      onChange={(e) => handleSlugChange(e.target.value)}
                      placeholder="seu-link"
                      className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-4 text-sm outline-none transition focus:border-white/30"
                      autoComplete="off"
                      spellCheck={false}
                    />
                  </div>
                  <p className="mt-3 inline-flex items-center gap-2 rounded-xl border border-emerald-500/20 bg-emerald-500/5 px-4 py-2 text-xs font-bold text-emerald-500">
                    anotameucontato.com.br/{slug || "link"}
                  </p>
                  {slugError ? (
                    <p className="mt-2 text-xs font-bold text-red-400">{slugError}</p>
                  ) : null}
                </div>

                <div>
                  <label htmlFor="whatsapp" className="mb-2 block text-sm font-bold uppercase tracking-wider text-zinc-500">
                    WhatsApp para Pedidos/Contato
                  </label>
                  <input
                    id="whatsapp"
                    type="tel"
                    value={whatsapp}
                    onChange={(e) => setWhatsapp(e.target.value)}
                    placeholder="5511999999999"
                    className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-4 text-sm outline-none transition focus:border-white/30"
                    autoComplete="tel"
                  />
                  {whatsappError ? (
                    <p className="mt-2 text-xs font-bold text-red-400">{whatsappError}</p>
                  ) : null}
                </div>

                {businessModel !== "CaaS" && (
                  <div>
                    <label htmlFor="bio" className="mb-2 block text-sm font-bold uppercase tracking-wider text-zinc-500">
                      Mini Bio <span className="text-[10px] font-normal lowercase opacity-50">(opcional)</span>
                    </label>
                    <textarea
                      id="bio"
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                      placeholder="Uma frase curta sobre você..."
                      rows={2}
                      className="w-full resize-none rounded-2xl border border-white/10 bg-white/5 px-4 py-4 text-sm outline-none transition focus:border-white/30"
                    />
                  </div>
                )}

                {formError ? (
                  <div className="rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-4 text-xs font-bold text-red-400">
                    {formError}
                  </div>
                ) : null}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full rounded-2xl bg-white py-5 text-sm font-black text-black transition-all hover:scale-[1.01] active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-50 shadow-xl"
                >
                  {loading ? "Finalizando Configuração..." : "Concluir Onboarding"}
                </button>
              </form>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </main>
  );
}
