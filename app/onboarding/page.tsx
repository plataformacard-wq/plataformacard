"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

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
  const [fullName, setFullName] = useState("");
  const [slug, setSlug] = useState("");
  const [slugManual, setSlugManual] = useState(false);
  const [whatsapp, setWhatsapp] = useState("");
  const [bio, setBio] = useState("");

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

      const trimmedName = fullName.trim();
      const trimmedSlug = slug.trim();
      const trimmedWhatsapp = whatsapp.trim();
      const trimmedBio = bio.trim();

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

      const payload = {
        full_name: trimmedName || null,
        slug: trimmedSlug,
        whatsapp: trimmedWhatsapp,
        bio: trimmedBio || null,
      };

      const { error } = existing
        ? await supabase
            .from("profiles")
            .update(payload)
            .eq("user_id", user.id)
        : await supabase.from("profiles").insert({
            id: crypto.randomUUID(),
            user_id: user.id,
            ...payload,
          });

      if (error) {
        if (
          error.code === "23505" ||
          error.message.toLowerCase().includes("unique")
        ) {
          setSlugError("Este slug já está em uso. Escolha outro.");
        } else {
          setFormError(error.message || "Não foi possível salvar. Tente novamente.");
        }
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
        <p className="text-sm text-zinc-400">Carregando…</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-zinc-950 px-4 py-10 text-white">
      <div className="mx-auto w-full max-w-md rounded-2xl border border-white/10 bg-white/5 p-6 shadow-2xl backdrop-blur">
        <div className="mb-8">
          <h1 className="text-2xl font-bold">Complete seu perfil</h1>
          <p className="mt-2 text-sm text-zinc-300">
            Defina como os clientes vão te encontrar e entrar em contato.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label htmlFor="fullName" className="mb-2 block text-sm font-medium">
              Nome completo
            </label>
            <input
              id="fullName"
              type="text"
              value={fullName}
              onChange={(e) => handleFullNameChange(e.target.value)}
              placeholder="Seu nome"
              className="w-full rounded-xl border border-white/10 bg-zinc-900 px-4 py-3 text-sm outline-none transition focus:border-white/30"
              autoComplete="name"
            />
          </div>

          <div>
            <label htmlFor="slug" className="mb-2 block text-sm font-medium">
              Slug da sua página
            </label>
            <input
              id="slug"
              type="text"
              value={slug}
              onChange={(e) => handleSlugChange(e.target.value)}
              placeholder="seu-nome"
              className="w-full rounded-xl border border-white/10 bg-zinc-900 px-4 py-3 text-sm outline-none transition focus:border-white/30"
              autoComplete="off"
              spellCheck={false}
            />
            <p className="mt-2 inline-flex max-w-full break-all rounded-lg border border-emerald-500/30 bg-emerald-500/15 px-3 py-1.5 text-xs font-medium text-emerald-300">
              anotameucontato.com.br/{slug || "seu-slug"}
            </p>
            {slugError ? (
              <p className="mt-2 text-sm text-red-300">{slugError}</p>
            ) : null}
          </div>

          <div>
            <label htmlFor="whatsapp" className="mb-2 block text-sm font-medium">
              WhatsApp
            </label>
            <input
              id="whatsapp"
              type="tel"
              value={whatsapp}
              onChange={(e) => setWhatsapp(e.target.value)}
              placeholder="5511999999999"
              className="w-full rounded-xl border border-white/10 bg-zinc-900 px-4 py-3 text-sm outline-none transition focus:border-white/30"
              autoComplete="tel"
            />
            {whatsappError ? (
              <p className="mt-2 text-sm text-red-300">{whatsappError}</p>
            ) : null}
          </div>

          <div>
            <label htmlFor="bio" className="mb-2 block text-sm font-medium">
              Bio <span className="font-normal text-zinc-500">(opcional)</span>
            </label>
            <textarea
              id="bio"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Uma frase sobre você ou seu negócio"
              rows={3}
              className="w-full resize-none rounded-xl border border-white/10 bg-zinc-900 px-4 py-3 text-sm outline-none transition focus:border-white/30"
            />
          </div>

          {formError ? (
            <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
              {formError}
            </div>
          ) : null}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-white px-4 py-3 text-sm font-semibold text-zinc-950 transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Salvando…" : "Continuar"}
          </button>
        </form>
      </div>
    </main>
  );
}
