"use client";

import { useEffect, useState, Suspense } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { BusinessHours, TimeShift, DaySchedule } from "@/lib/utils/time";
import ImageEditorModal from "@/components/dashboard/ImageEditorModal";
import { Upload, X, Camera } from "lucide-react";

const defaultBusinessHours: BusinessHours = {
  timezone: "America/Sao_Paulo",
  manual_override: null,
  schedule: {
    monday: { isOpen: true, shifts: [{ open: "08:00", close: "18:00" }] },
    tuesday: { isOpen: true, shifts: [{ open: "08:00", close: "18:00" }] },
    wednesday: { isOpen: true, shifts: [{ open: "08:00", close: "18:00" }] },
    thursday: { isOpen: true, shifts: [{ open: "08:00", close: "18:00" }] },
    friday: { isOpen: true, shifts: [{ open: "08:00", close: "18:00" }] },
    saturday: { isOpen: true, shifts: [{ open: "08:00", close: "12:00" }] },
    sunday: { isOpen: false, shifts: [] },
  },
};

const dayNamesMap = {
  monday: "Segunda-feira",
  tuesday: "Terça-feira",
  wednesday: "Quarta-feira",
  thursday: "Quinta-feira",
  friday: "Sexta-feira",
  saturday: "Sábado",
  sunday: "Domingo",
};

type ProfileData = {
  full_name: string | null;
  avatar_url: string | null;
  bio: string | null;
  whatsapp: string | null;
  slug: string | null;
  is_available: boolean | null;
  custom_business_hours: any;
  can_customize_hours: boolean | null;
  role: string | null;
  whatsapp_template: string | null;
  organization_id: string | null;
  organizations?: {
    business_model: string;
  };
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

function PerfilContent() {
  const supabase = createClient();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [loading, setLoading] = useState(true);
  const [nome, setNome] = useState("Cliente");
  const [nomeInput, setNomeInput] = useState("");
  const [bioInput, setBioInput] = useState("");
  const [whatsappInput, setWhatsappInput] = useState("");
  const [slugInput, setSlugInput] = useState("");
  const [whatsappTemplateInput, setWhatsappTemplateInput] = useState("");
  const [slugOriginal, setSlugOriginal] = useState("");
  const [slugError, setSlugError] = useState("");
  const [slugChecking, setSlugChecking] = useState(false);
  const [isAvailable, setIsAvailable] = useState(true);
  const [useCompanyHours, setUseCompanyHours] = useState(true);
  const [canCustomize, setCanCustomize] = useState(false);
  const [customBusinessHours, setCustomBusinessHours] = useState<BusinessHours>(defaultBusinessHours);
  const [email, setEmail] = useState("");
  const [avatar, setAvatar] = useState<string | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState("");
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [showImageEditor, setShowImageEditor] = useState(false);
  const [businessModel, setBusinessModel] = useState<"B2B" | "B2C">("B2B");
  
  // Password State
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [changingPassword, setChangingPassword] = useState(false);
  
  // Detectar se veio pelo menu "Editar Cartão Público"
  const [view, setView] = useState<"all" | "card" | "security">("all");

  useEffect(() => {
    const handleHash = () => {
      const hash = window.location.hash;
      console.log("🔗 Hash detectado:", hash);
      if (hash === "#cartao") {
        setView("card");
      } else {
        // Padrão é segurança se não for cartão
        setView("security");
      }
    };

    handleHash();
    window.addEventListener("hashchange", handleHash);
    return () => window.removeEventListener("hashchange", handleHash);
  }, [pathname, searchParams]);

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
        .select("full_name, avatar_url, bio, whatsapp, whatsapp_template, slug, is_available, custom_business_hours, can_customize_hours, role, organization_id")
        .eq("user_id", user.id)
        .maybeSingle<ProfileData>();

      if (profile) {
        setNome(profile.full_name || "Cliente");
        setNomeInput(profile.full_name || "");
        setBioInput(profile.bio || "");
        setWhatsappInput(profile.whatsapp || "");
        setSlugInput(profile.slug || "");
        setSlugOriginal(profile.slug || "");
        setWhatsappTemplateInput(profile.whatsapp_template || "");
        setAvatar(profile.avatar_url || null);
        setIsAvailable(profile.is_available ?? true);
        
        const hasPermission = profile.can_customize_hours ?? false;
        setCanCustomize(hasPermission);

        if (profile.custom_business_hours) {
          setCustomBusinessHours(profile.custom_business_hours as BusinessHours);
        }


        // Buscar modelo de negócio separadamente para garantir sincronia com PanelLayout
        if (profile.organization_id) {
          const { data: org } = await supabase
            .from("organizations")
            .select("business_model")
            .eq("id", profile.organization_id)
            .maybeSingle();
          
          if (org?.business_model) {
            setBusinessModel(org.business_model as "B2B" | "B2C");
          }
        }
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

  async function checkSlugAvailability(slug: string): Promise<boolean> {
    if (!slug || slug === slugOriginal) return true;

    setSlugChecking(true);
    const { data } = await supabase
      .from("profiles")
      .select("slug")
      .eq("slug", slug)
      .maybeSingle();

    setSlugChecking(false);
    return !data;
  }

  function handleSlugChange(value: string) {
    const sanitized = sanitizeSlug(value);
    setSlugInput(sanitized);
    setSlugError("");
  }

  function handleDayToggle(day: keyof BusinessHours["schedule"]) {
    setCustomBusinessHours(prev => ({
      ...prev,
      schedule: {
        ...prev.schedule,
        [day]: {
          ...prev.schedule[day],
          isOpen: !prev.schedule[day].isOpen,
          shifts: !prev.schedule[day].isOpen && prev.schedule[day].shifts.length === 0 
            ? [{ open: "08:00", close: "18:00" }] 
            : prev.schedule[day].shifts
        }
      }
    }));
  }

  function handleShiftChange(day: keyof BusinessHours["schedule"], shiftIndex: number, field: keyof TimeShift, value: string) {
    setCustomBusinessHours(prev => {
      const newShifts = [...prev.schedule[day].shifts];
      newShifts[shiftIndex] = { ...newShifts[shiftIndex], [field]: value };
      return {
        ...prev,
        schedule: {
          ...prev.schedule,
          [day]: {
            ...prev.schedule[day],
            shifts: newShifts
          }
        }
      };
    });
  }

  function handleAddShift(day: keyof BusinessHours["schedule"]) {
    setCustomBusinessHours(prev => {
      if (prev.schedule[day].shifts.length >= 2) return prev;
      return {
        ...prev,
        schedule: {
          ...prev.schedule,
          [day]: {
            ...prev.schedule[day],
            shifts: [...prev.schedule[day].shifts, { open: "13:00", close: "18:00" }]
          }
        }
      };
    });
  }

  function handleRemoveShift(day: keyof BusinessHours["schedule"], shiftIndex: number) {
    setCustomBusinessHours(prev => {
      const newShifts = prev.schedule[day].shifts.filter((_, i) => i !== shiftIndex);
      return {
        ...prev,
        schedule: {
          ...prev.schedule,
          [day]: {
            ...prev.schedule[day],
            shifts: newShifts,
            isOpen: newShifts.length > 0
          }
        }
      };
    });
  }

  const avatarPreview = avatarFile ? URL.createObjectURL(avatarFile) : avatar;
  const slugPreview = slugInput ? `anotameucontato.com.br/${slugInput}` : null;

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
        whatsapp_template: whatsappTemplateInput.trim() || null,
        slug: trimmedSlug || null,
        is_available: isAvailable,
        custom_business_hours: customBusinessHours,
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

  async function handleChangePassword() {
    if (!newPassword || newPassword !== confirmNewPassword) {
      setSaveMessage("As senhas não coincidem ou estão vazias.");
      return;
    }

    setChangingPassword(true);
    const { error } = await supabase.auth.updateUser({
      password: newPassword
    });

    if (error) {
      setSaveMessage("Erro ao alterar senha: " + error.message);
    } else {
      setSaveMessage("Senha alterada com sucesso!");
      setNewPassword("");
      setConfirmNewPassword("");
      setCurrentPassword("");
    }
    setChangingPassword(false);
  }

  function onImageEditorConfirm(file: File, previewUrl: string) {
    setAvatarFile(file);
    // Note: avatarPreview uses avatarFile if present, so it will update automatically
  }

  return (
    <div className="relative space-y-6">
      <div>
        <h1 className="text-2xl font-semibold" style={{ color: "var(--dash-text-primary)" }}>
          {view === "card" ? "Editar Cartão Público" : "Meu Perfil"}
        </h1>
        <p className="mt-2 text-sm" style={{ color: "var(--dash-text-secondary)" }}>
          {view === "card" 
            ? "Gerencie as informações que aparecem para seus clientes." 
            : "Gerencie seus dados de acesso e informações administrativas."}
        </p>
      </div>

      {loading ? (
        <p className="text-sm" style={{ color: "var(--dash-text-secondary)" }}>
          Carregando dados...
        </p>
      ) : (
        <>
          {/* Card 1 — Identidade */}
          {view === "card" && (
          <div
            className="rounded-2xl border p-6 shadow-sm transition-colors"
            style={{ background: "var(--dash-surface)", borderColor: "var(--dash-border)" }}
          >
            <h2 className="text-base font-semibold" style={{ color: "var(--dash-text-primary)" }}>
              Identidade
            </h2>
            <p className="mt-1 text-sm" style={{ color: "var(--dash-text-secondary)" }}>
              Foto, nome e bio que aparecem no seu cartão público.
            </p>

            <div className="mt-6 flex items-start gap-6">
              {/* Avatar */}
              <div className="flex flex-col items-center gap-3">
                <div 
                  className="group relative h-24 w-24 rounded-full border overflow-hidden transition-all hover:border-primary/50 cursor-pointer" 
                  style={{ background: "var(--dash-input-bg)", borderColor: "var(--dash-border)" }}
                  onClick={() => setShowImageEditor(true)}
                >
                  {avatarPreview ? (
                    <>
                      <img
                        src={avatarPreview}
                        alt={nome}
                        className="h-full w-full object-cover"
                      />
                      <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Upload className="text-white" size={20} />
                      </div>
                    </>
                  ) : (
                    <div
                      className="flex h-full w-full items-center justify-center text-3xl font-black"
                      style={{ background: "var(--dash-surface-secondary)", color: "var(--dash-text-secondary)" }}
                    >
                      <div className="flex items-center justify-center w-12 h-12 rounded-full border-2 border-dashed border-[var(--dash-text-muted)] opacity-50">
                        C
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-4">
                  <button
                    type="button"
                    onClick={() => setShowImageEditor(true)}
                    className="text-xs font-bold text-primary hover:underline"
                  >
                    {avatarPreview ? "Alterar foto" : "Adicionar foto"}
                  </button>
                  
                  {avatarPreview && (
                    <button 
                      type="button"
                      onClick={() => {
                        setAvatar(null);
                        setAvatarFile(null);
                      }}
                      className="text-xs font-bold text-red-500 hover:underline flex items-center gap-1"
                    >
                      <X size={12} /> Remover
                    </button>
                  )}
                </div>
              </div>

              {/* Campos */}
              <div className="flex-1 space-y-4">
                <div>
                  <label
                    htmlFor="nome"
                    className="text-sm font-medium"
                    style={{ color: "var(--dash-text-primary)" }}
                  >
                    Nome completo
                  </label>
                  <input
                    id="nome"
                    type="text"
                    value={nomeInput}
                    onChange={(e) => setNomeInput(e.target.value)}
                    placeholder="Seu nome"
                    className="mt-1 w-full rounded-lg border px-3 py-2 text-sm outline-none transition-colors"
                    style={{
                      background: "var(--dash-input-bg)",
                      borderColor: "var(--dash-input-border)",
                      color: "var(--dash-text-primary)",
                    }}
                  />
                </div>

                {businessModel === "B2C" && (
                  <div>
                    <label
                      htmlFor="bio"
                      className="text-sm font-medium"
                      style={{ color: "var(--dash-text-primary)" }}
                    >
                      Bio{" "}
                      <span className="font-normal" style={{ color: "var(--dash-text-muted)" }}>
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
                      className="mt-1 w-full resize-none rounded-lg border px-3 py-2 text-sm outline-none transition-colors"
                      style={{
                        background: "var(--dash-input-bg)",
                        borderColor: "var(--dash-input-border)",
                        color: "var(--dash-text-primary)",
                      }}
                    />
                    <p className="mt-1 text-right text-xs" style={{ color: "var(--dash-text-muted)" }}>
                      {bioInput.length}/120
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

          {/* Botão salvar Identidade - Apenas se não estiver na aba de segurança */}
          {businessModel === "B2B" && view !== "security" && (
            <div className="flex justify-start">
              <button
                type="button"
                onClick={handleSave}
                disabled={saving}
                className="rounded-xl px-6 py-2 text-sm font-medium transition-opacity hover:opacity-80 disabled:opacity-60"
                style={{ background: "var(--dash-text-primary)", color: "var(--dash-surface)" }}
              >
                {saving ? "Salvando..." : "Atualizar Nome"}
              </button>
            </div>
          )}

          {/* Card 2 — Contato e Link (Apenas B2C e se view for card) */}
          {businessModel === "B2C" && view === "card" && (
            <>
              <div
                className="rounded-2xl border p-6 shadow-sm transition-colors"
                style={{ background: "var(--dash-surface)", borderColor: "var(--dash-border)" }}
              >
                <h2 className="text-base font-semibold" style={{ color: "var(--dash-text-primary)" }}>
                  Contato e link do cartão
                </h2>
                <p className="mt-1 text-sm" style={{ color: "var(--dash-text-secondary)" }}>
                  Como seus clientes entram em contato e acessam seu cartão.
                </p>

                <div className="mt-6 space-y-5">
                  {/* WhatsApp */}
                  <div>
                    <label
                      htmlFor="whatsapp"
                      className="text-sm font-medium"
                      style={{ color: "var(--dash-text-primary)" }}
                    >
                      WhatsApp
                    </label>
                    <div className="relative mt-1">
                      <span
                        className="absolute inset-y-0 left-3 flex items-center text-sm"
                        style={{ color: "var(--dash-text-muted)" }}
                      >
                        +55
                      </span>
                      <input
                        id="whatsapp"
                        type="tel"
                        value={whatsappInput}
                        onChange={(e) => setWhatsappInput(e.target.value.replace(/\D/g, ""))}
                        placeholder="27999999999"
                        maxLength={13}
                        className="w-full rounded-lg border py-2 pl-10 pr-3 text-sm outline-none transition-colors"
                        style={{
                          background: "var(--dash-input-bg)",
                          borderColor: "var(--dash-input-border)",
                          color: "var(--dash-text-primary)",
                        }}
                      />
                    </div>
                    <p className="mt-1 text-xs" style={{ color: "var(--dash-text-muted)" }}>
                      Apenas números, com DDD. Ex: 27999887766
                    </p>
                  </div>

                  {/* WhatsApp Template */}
                  <div>
                    <label
                      htmlFor="whatsapp_template"
                      className="text-sm font-medium"
                      style={{ color: "var(--dash-text-primary)" }}
                    >
                      Modelo de Mensagem personalizada
                    </label>
                    <textarea
                      id="whatsapp_template"
                      value={whatsappTemplateInput}
                      onChange={(e) => setWhatsappTemplateInput(e.target.value)}
                      placeholder="Ex: Olá! Tenho interesse no item {nome}..."
                      rows={3}
                      className="mt-1 w-full rounded-lg border px-3 py-2 text-sm outline-none transition-colors"
                      style={{
                        background: "var(--dash-input-bg)",
                        borderColor: "var(--dash-input-border)",
                        color: "var(--dash-text-primary)",
                      }}
                    />
                    <div className="mt-2 flex flex-wrap gap-2">
                      {['{nome}', '{preco}', '{sku}', '{link}', '{tipo}'].map(tag => (
                        <button
                          key={tag}
                          type="button"
                          onClick={() => setWhatsappTemplateInput((prev: string) => prev + tag)}
                          className="px-2 py-1 rounded-md bg-zinc-100 dark:bg-zinc-800 text-[10px] font-mono text-zinc-500 hover:text-primary transition-colors"
                        >
                          {tag}
                        </button>
                      ))}
                    </div>
                    <p className="mt-2 text-xs" style={{ color: "var(--dash-text-muted)" }}>
                      Use as tags acima para inserir dados automáticos do item. Deixe vazio para usar a mensagem padrão.
                    </p>
                  </div>

                  {/* Slug */}
                  <div>
                    <label
                      htmlFor="slug"
                      className="text-sm font-medium"
                      style={{ color: "var(--dash-text-primary)" }}
                    >
                      Link personalizado do cartão
                    </label>
                    <div className="relative mt-1">
                      <span
                        className="absolute inset-y-0 left-3 flex items-center text-xs"
                        style={{ color: "var(--dash-text-muted)" }}
                      >
                        /
                      </span>
                      <input
                        id="slug"
                        type="text"
                        value={slugInput}
                        onChange={(e) => handleSlugChange(e.target.value)}
                        placeholder="seu-nome"
                        maxLength={40}
                        className="w-full rounded-lg border py-2 pl-9 pr-3 text-sm outline-none transition-colors"
                        style={{
                          background: "var(--dash-input-bg)",
                          borderColor: slugError ? "#ef4444" : "var(--dash-input-border)",
                          color: "var(--dash-text-primary)",
                        }}
                      />
                      {slugChecking && (
                        <span
                          className="absolute inset-y-0 right-3 flex items-center text-xs"
                          style={{ color: "var(--dash-text-muted)" }}
                        >
                          verificando...
                        </span>
                      )}
                    </div>

                    {slugError ? (
                      <p className="mt-1 text-xs text-red-500">{slugError}</p>
                    ) : slugPreview ? (
                      <p className="mt-1 text-xs" style={{ color: "var(--dash-text-muted)" }}>
                        Seu link:{" "}
                        <span className="font-medium" style={{ color: "var(--dash-text-primary)" }}>
                          {slugPreview}
                        </span>
                      </p>
                    ) : (
                      <p className="mt-1 text-xs" style={{ color: "var(--dash-text-muted)" }}>
                        Use letras minúsculas, números e hífens. Ex: joao-silva
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Status de Atendimento & Horários (Apenas se view for card) */}
            </>
          )}
          
          {/* Fim do Bloco de Identidade/Card */}
          {view === "card" && (
            <div className="flex justify-start">
              <button
                type="button"
                onClick={handleSave}
                disabled={saving}
                className="rounded-xl px-8 py-3 text-sm font-bold text-white shadow-lg transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
                style={{ background: "var(--dash-text-primary)", color: "var(--dash-surface)" }}
              >
                {saving ? "Salvando..." : "Salvar Alterações"}
              </button>
            </div>
          )}
          
          {/* Card Segurança */}
          {view === "security" && (
            <div
              className="rounded-2xl border p-6 shadow-sm transition-colors"
              style={{ background: "var(--dash-surface)", borderColor: "var(--dash-border)" }}
            >
              <h2 className="text-base font-semibold" style={{ color: "var(--dash-text-primary)" }}>
                Segurança
              </h2>
            <p className="mt-1 text-sm" style={{ color: "var(--dash-text-secondary)" }}>
              Altere sua senha de acesso ao painel.
            </p>

            <div className="mt-6 space-y-4 max-w-md">
              <div>
                <label className="text-sm font-medium" style={{ color: "var(--dash-text-primary)" }}>Nova Senha</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="mt-1 w-full rounded-lg border px-3 py-2 text-sm outline-none transition-colors"
                  style={{ background: "var(--dash-input-bg)", borderColor: "var(--dash-input-border)", color: "var(--dash-text-primary)" }}
                />
              </div>
              <div>
                <label className="text-sm font-medium" style={{ color: "var(--dash-text-primary)" }}>Confirmar Nova Senha</label>
                <input
                  type="password"
                  value={confirmNewPassword}
                  onChange={(e) => setConfirmNewPassword(e.target.value)}
                  className="mt-1 w-full rounded-lg border px-3 py-2 text-sm outline-none transition-colors"
                  style={{ background: "var(--dash-input-bg)", borderColor: "var(--dash-input-border)", color: "var(--dash-text-primary)" }}
                />
              </div>
              <button
                type="button"
                onClick={handleChangePassword}
                disabled={changingPassword}
                className="rounded-lg border px-4 py-2 text-xs font-bold transition-colors hover:bg-[rgba(255,255,255,0.05)]"
                style={{ borderColor: "var(--dash-border)", color: "var(--dash-text-primary)" }}
              >
                {changingPassword ? "Alterando..." : "Alterar Senha"}
              </button>
            </div>
          </div>
          )}

          {/* Email */}
          {view === "security" && (
          <div
            className="rounded-2xl border p-6 shadow-sm transition-colors"
            style={{ background: "var(--dash-surface)", borderColor: "var(--dash-border)" }}
          >
            <p className="text-sm font-medium" style={{ color: "var(--dash-text-primary)" }}>
              Email de Acesso
            </p>
            <p className="mt-1 text-sm" style={{ color: "var(--dash-text-secondary)" }}>
              {email || "Email não disponível"}
            </p>
            <p className="mt-0.5 text-xs" style={{ color: "var(--dash-text-muted)" }}>
              O email é usado para login e não pode ser alterado aqui.
            </p>
          </div>
          )}

        </>
      )}

      {saveMessage && (
        <div
          className="fixed bottom-6 right-6 z-50 rounded-xl border px-4 py-3 text-sm shadow-lg transition-colors"
          style={{
            background: "var(--dash-surface)",
            borderColor: "var(--dash-border)",
            color: "var(--dash-text-primary)",
          }}
        >
          {saveMessage}
        </div>
      )}
      <ImageEditorModal
        isOpen={showImageEditor}
        onClose={() => setShowImageEditor(false)}
        onConfirm={onImageEditorConfirm}
        aspectRatio={1}
        minWidth={400}
        minHeight={400}
      />
    </div>
  );
}
export default function PerfilPage() {
  return (
    <Suspense fallback={null}>
      <PerfilContent />
    </Suspense>
  );
}
