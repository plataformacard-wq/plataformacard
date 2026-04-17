"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

type ProfileData = {
  full_name: string | null;
  avatar_url: string | null;
};

export default function PerfilPage() {
  const supabase = createClient();

  const [loading, setLoading] = useState(true);
  const [nome, setNome] = useState("Cliente");
  const [nomeInput, setNomeInput] = useState("");
  const [email, setEmail] = useState("");
  const [avatar, setAvatar] = useState<string | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState("");

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
        .select("full_name, avatar_url")
        .eq("user_id", user.id)
        .maybeSingle<ProfileData>();

      if (profile) {
        const safeName = profile.full_name || "Cliente";
        setNome(safeName);
        setNomeInput(safeName);
        setAvatar(profile.avatar_url || null);
      }

      setLoading(false);
    }

    loadProfile();
  }, [supabase]);

  useEffect(() => {
    if (!saveMessage) return;
    const timer = setTimeout(() => setSaveMessage(""), 2500);
    return () => clearTimeout(timer);
  }, [saveMessage]);

  // Preview da imagem selecionada antes de salvar
  const avatarPreview = avatarFile ? URL.createObjectURL(avatarFile) : avatar;

  async function handleSave() {
    setSaving(true);
    setSaveMessage("");

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
      setSaveMessage("Digite um nome válido.");
      setSaving(false);
      return;
    }

    let newAvatarUrl = avatar;

    // Faz o upload da foto se o usuário selecionou uma nova
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
      .update({ full_name: trimmedName, avatar_url: newAvatarUrl })
      .eq("user_id", user.id);

    if (error) {
      setSaveMessage("Não foi possível salvar. Tente novamente.");
      setSaving(false);
      return;
    }

    setNome(trimmedName);
    setAvatar(newAvatarUrl);
    setAvatarFile(null);
    setSaveMessage("Perfil atualizado com sucesso!");
    setSaving(false);
  }

  return (
    <div className="relative space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-neutral-900">Perfil</h1>
        <p className="mt-2 text-sm text-neutral-600">
          Visualize e edite seus dados cadastrais.
        </p>
      </div>

      <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-medium text-neutral-900">Dados do usuário</h2>

        {loading ? (
          <p className="mt-4 text-sm text-neutral-600">Carregando dados...</p>
        ) : (
          <div className="mt-6 flex items-start gap-6">
            {/* Coluna da foto */}
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

            {/* Coluna dos campos */}
            <div className="flex-1 space-y-4">
              <div>
                <label
                  className="text-sm font-medium text-neutral-700"
                  htmlFor="nome"
                >
                  Nome
                </label>
                <input
                  id="nome"
                  type="text"
                  value={nomeInput}
                  onChange={(e) => setNomeInput(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2 text-base text-neutral-900 outline-none focus:border-neutral-400"
                />
              </div>

              <div>
                <p className="text-sm font-medium text-neutral-700">Email</p>
                <p className="mt-1 text-base text-neutral-500">
                  {email || "Email não disponível"}
                </p>
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={saving}
                  className="rounded-lg bg-black px-5 py-2 text-sm font-medium text-white transition-opacity hover:opacity-80 disabled:opacity-60"
                >
                  {saving ? "Salvando..." : "Salvar alterações"}
                </button>
              </div>
            </div>
          </div>
        )}

        {saveMessage && (
          <div className="fixed bottom-6 right-6 z-50 rounded-lg border border-neutral-200 bg-white px-4 py-3 text-sm text-neutral-800 shadow-lg">
            {saveMessage}
          </div>
        )}
      </div>
    </div>
  );
}