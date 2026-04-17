"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

type ProfileData = {
  full_name: string | null;
  avatar_url: string | null;
  bio: string | null;
  whatsapp: string | null;
  slug: string | null;
};

function sanitizeSlug(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9-]/g, "-")
    .replace(/-{2,}/g, "-")
    .replace(/^-|-$/g, "");
}

export default function PerfilPage() {
  const supabase = createClient();

  const [loading, setLoading] = useState(true);
  const [nome, setNome] = useState("Cliente");
  const [nomeInput, setNomeInput] = useState("");
  const [bioInput, setBioInput] = useState("");
  const [whatsappInput, setWhatsappInput] = useState("");
  const [slugInput, setSlugInput] = useState("");
  const [slugOriginal, setSlugOriginal] = useState("");
  const [slugError, setSlugError] = useState("");
  const [slugChecking, setSlugChecking] = useState(false);
  const [email, setEmail] = useState("");
  const [avatar, setAvatar] = useState<string | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState("");
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    async function loadProfile() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setLoading(false);
        return;
      }

      setEmail(user.email ?? "");

      const { data: profile } = await supabase
        .from("profiles")
        .select("full_name, avatar_url, bio, whatsapp, slug")
        .eq("user_id", user.id)
        .maybeSingle<ProfileData>();

      if (profile) {
        setNome(profile.full_name || "Cliente");
        setNomeInput(profile.full_name || "");
        setBioInput(profile.bio || "");
        setWhatsappInput(profile.whatsapp || "");
        setSlugInput(profile.slug || "");
        setSlugOriginal(profile.slug || "");
        setAvatar(profile.avatar_url || null);
      }

      setLoading(false);
    }

    loadProfile();
  }, [supabase]);

  useEffect(() => {
    if (!saveMessage) return;
    const timer = setTimeout(() => setSaveMessage(""), 3000);
    return () => clearTimeout(timer);
  }, [saveMessage]);

  // Verifica se o slug já está em uso por outro perfil
  async function checkSlugAvailability(slug: string): Promise<boolean> {
    if (!slug || slug === slugOriginal) return true;

    setSlugChecking(true);
    const { data } = await supabase
      .from("profiles")
      .select("slug")
      .eq("slug", slug)
      .maybeSingle();

    setSlugChecking(false);
    return !data; // disponível se não encontrou nenhum registro
  }

  function handleSlugChange(value: string) {
    const sanitized = sanitizeSlug(value);
    setSlugInput(sanitized);
    setSlugError("");
  }

  const avatarPreview = avatarFile ? URL.createObjectURL(avatarFile) : avatar;
  const slugPreview = slugInput ? `anotameucontato.com.br/p/${slugInput}` : null;

  async function handleSave() {
    setSaving(true);
    setSaveMessage("");
    setSlugError("");

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setSaveMessage("Usuário não autenticado.");
      setSaving(false);
      return;
    }

    const trimmedName = nomeInput.trim();
    if (!trimmedName) {
      setSaveMessage("O nome é obrigatório.");
      setSaving(false);
      return;
    }

    const trimmedSlug = slugInput.trim();
    if (trimmedSlug && trimmedSlug.length < 3) {
      setSlugError("O link deve ter pelo menos 3 caracteres.");
      setSaving(false);
      return;
    }

    // Verifica disponibilidade do slug
    if (trimmedSlug && trimmedSlug !== slugOriginal) {
      const available = await checkSlugAvailability(trimmedSlug);
      if (!available) {
        setSlugError("Este link já está em uso. Escolha outro.");
        setSaving(false);
        return;
      }
    }

    let newAvatarUrl = avatar;

    if (avatarFile) {
      const fileExt = avatarFile.name.split(".").pop();
      const filePath = `${user.id}/avatar.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(filePath, avatarFile, { upsert: true });

      if (uploadError) {
        setSaveMessage("Erro ao fazer upload da foto. Tente novamente.");
        setSaving(false);
        return;
      }

      const { data: urlData } = supabase.storage
        .from("avatars")
        .getPublicUrl(filePath);

      newAvatarUrl = urlData.publicUrl;
    }

    const { error } = await supabase
      .from("profiles")
      .update({
        full_name: trimmedName,
        avatar_url: newAvatarUrl,
        bio: bioInput.trim() || null,
        whatsapp: whatsappInput.trim() || null,
        slug: trimmedSlug || null,
      })
      .eq("user_id", user.id);

    if (error) {
      setSaveMessage("Não foi possível salvar. Tente novamente.");
      setSaving(false);
      return;
    }

    setNome(trimmedName);
    setAvatar(newAvatarUrl);
    setAvatarFile(null);
    setSlugOriginal(trimmedSlug);
    setSaveSuccess(true);
    setSaveMessage("Perfil atualizado com sucesso!");
    setSaving(false);
    setTimeout(() => setSaveSuccess(false), 3000);
  }

  return (
    <div className="relative space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-neutral-900">Perfil</h1>
        <p className="mt-2 text-sm text-neutral-600">
          Edite suas informações públicas e o link do seu cartão.
        </p>
      </div>

      {loading ? (
        <p className="text-sm text-neutral-600">Carregando dados...</p>
      ) : (
        <>
          {/* Card 1 — Identidade */}
          <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
            <h2 className="text-base font-semibold text-neutral-900">
              Identidade
            </h2>
            <p className="mt-1 text-sm text-neutral-500">
              Foto, nome e bio que aparecem no seu cartão público.
            </p>

            <div className="mt-6 flex items-start gap-6">
              {/* Avatar */}
              <div className="flex flex-col items-center gap-3">
                {avatarPreview ? (
                  <img
                    src={avatarPreview}
                    alt={nome}
                    className="h-20 w-20 rounded-full border border-neutral-200 object-cover"
                  />
                ) : (
                  <div className="flex h-20 w-20 items-center justify-center rounded-full bg-black text-xl font-medium text-white">
                    {nome.charAt(0).toUpperCase()}
                  </div>
                )}

                <label
                  htmlFor="avatar-upload"
                  className="cursor-pointer rounded-lg border border-neutral-300 px-4 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-50"
                >
                  {avatarFile ? "✓ Selecionada" : "Alterar foto"}
                </label>

                <input
                  id="avatar-upload"
                  type="file"
                  accept="image/*"
                  onChange={(e) => setAvatarFile(e.target.files?.[0] || null)}
                  className="hidden"
                />
              </div>

              {/* Campos */}
              <div className="flex-1 space-y-4">
                <div>
                  <label
                    htmlFor="nome"
                    className="text-sm font-medium text-neutral-700"
                  >
                    Nome completo
                  </label>
                  <input
                    id="nome"
                    type="text"
                    value={nomeInput}
                    onChange={(e) => setNomeInput(e.target.value)}
                    placeholder="Seu nome"
                    className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm text-neutral-900 outline-none focus:border-neutral-500"
                  />
                </div>

                <div>
                  <label
                    htmlFor="bio"
                    className="text-sm font-medium text-neutral-700"
                  >
                    Bio{" "}
                    <span className="font-normal text-neutral-400">
                      (opcional)
                    </span>
                  </label>
                  <textarea
                    id="bio"
                    value={bioInput}
                    onChange={(e) => setBioInput(e.target.value)}
                    placeholder="Ex: Representante comercial · Região ES/RJ"
                    rows={2}
                    maxLength={120}
                    className="mt-1 w-full resize-none rounded-lg border border-neutral-300 px-3 py-2 text-sm text-neutral-900 outline-none focus:border-neutral-500"
                  />
                  <p className="mt-1 text-right text-xs text-neutral-400">
                    {bioInput.length}/120
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Card 2 — Contato e Link */}
          <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
            <h2 className="text-base font-semibold text-neutral-900">
              Contato e link do cartão
            </h2>
            <p className="mt-1 text-sm text-neutral-500">
              Como seus clientes entram em contato e acessam seu cartão.
            </p>

            <div className="mt-6 space-y-5">
              {/* WhatsApp */}
              <div>
                <label
                  htmlFor="whatsapp"
                  className="text-sm font-medium text-neutral-700"
                >
                  WhatsApp
                </label>
                <div className="relative mt-1">
                  <span className="absolute inset-y-0 left-3 flex items-center text-sm text-neutral-400">
                    +55
                  </span>
                  <input
                    id="whatsapp"
                    type="tel"
                    value={whatsappInput}
                    onChange={(e) =>
                      setWhatsappInput(e.target.value.replace(/\D/g, ""))
                    }
                    placeholder="27999999999"
                    maxLength={13}
                    className="w-full rounded-lg border border-neutral-300 py-2 pl-10 pr-3 text-sm text-neutral-900 outline-none focus:border-neutral-500"
                  />
                </div>
                <p className="mt-1 text-xs text-neutral-400">
                  Apenas números, com DDD. Ex: 27999887766
                </p>
              </div>

              {/* Slug */}
              <div>
                <label
                  htmlFor="slug"
                  className="text-sm font-medium text-neutral-700"
                >
                  Link personalizado do cartão
                </label>
                <div className="relative mt-1">
                  <span className="absolute inset-y-0 left-3 flex items-center text-xs text-neutral-400">
                    /p/
                  </span>
                  <input
                    id="slug"
                    type="text"
                    value={slugInput}
                    onChange={(e) => handleSlugChange(e.target.value)}
                    placeholder="seu-nome"
                    maxLength={40}
                    className={`w-full rounded-lg border py-2 pl-9 pr-3 text-sm text-neutral-900 outline-none focus:border-neutral-500 ${
                      slugError
                        ? "border-red-400 focus:border-red-400"
                        : "border-neutral-300"
                    }`}
                  />
                  {slugChecking && (
                    <span className="absolute inset-y-0 right-3 flex items-center text-xs text-neutral-400">
                      verificando...
                    </span>
                  )}
                </div>

                {slugError ? (
                  <p className="mt-1 text-xs text-red-500">{slugError}</p>
                ) : slugPreview ? (
                  <p className="mt-1 text-xs text-neutral-400">
                    Seu link:{" "}
                    <span className="font-medium text-neutral-700">
                      {slugPreview}
                    </span>
                  </p>
                ) : (
                  <p className="mt-1 text-xs text-neutral-400">
                    Use letras minúsculas, números e hífens. Ex: joao-silva
                  </p>
                )}
              </div>

              {/* Email (leitura) */}
              <div>
                <p className="text-sm font-medium text-neutral-700">Email</p>
                <p className="mt-1 text-sm text-neutral-500">
                  {email || "Email não disponível"}
                </p>
                <p className="mt-0.5 text-xs text-neutral-400">
                  O email não pode ser alterado aqui.
                </p>
              </div>
            </div>
          </div>

          {/* Botão salvar */}
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="rounded-xl bg-black px-6 py-2.5 text-sm font-medium text-white transition-opacity hover:opacity-80 disabled:opacity-60"
            >
              {saving ? "Salvando..." : "Salvar todas as alterações"}
            </button>

            {saveSuccess && (
              <span className="text-sm text-green-600 font-medium">
                ✓ Salvo com sucesso
              </span>
            )}
          </div>
        </>
      )}

      {saveMessage && (
        <div className="fixed bottom-6 right-6 z-50 rounded-xl border border-neutral-200 bg-white px-4 py-3 text-sm text-neutral-800 shadow-lg">
          {saveMessage}
        </div>
      )}
    </div>
  );
}