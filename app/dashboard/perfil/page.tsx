"use client";

import { useEffect, useState, Suspense } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { BusinessHours, TimeShift, DaySchedule } from "@/lib/utils/time";
import ImageEditorModal from "@/components/dashboard/ImageEditorModal";
import { Upload, X, Camera, Calendar, Info, Clock, Users, Phone, ExternalLink, ShieldCheck, ChevronDown, Package, Globe, Copy } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { getOrganizationById } from "@/lib/admin-actions";
import { getPublicUrl } from "@/lib/utils/url";

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
  user_id?: string | null;
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
  recess_ends_at?: string | null;
  status?: string | null;
  redirect_leads?: boolean | null;
  is_accepting_orders?: boolean | null;
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
  const [recessActive, setRecessActive] = useState(false);
  const [recessDays, setRecessDays] = useState(0);
  const [recessHours, setRecessHours] = useState(0);
  const [useCompanyHours, setUseCompanyHours] = useState(true);
  const [isAcceptingOrders, setIsAcceptingOrders] = useState(true);
  const [redirectLeads, setRedirectLeads] = useState(false);
  const [showHoursConfig, setShowHoursConfig] = useState(false);
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
  const [activeProfileUserId, setActiveProfileUserId] = useState<string | null>(null);
  const [customDomain, setCustomDomain] = useState<string | null>(null);
  
  // Password State
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [changingPassword, setChangingPassword] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState("");
  const [accountName, setAccountName] = useState("");
  
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
      setAccountName(user.user_metadata?.full_name || "");

      let profileResult: ProfileData | null = null;
      const { data: initialProfile } = await supabase
        .from("profiles")
        .select("user_id, full_name, avatar_url, bio, whatsapp, whatsapp_template, slug, is_available, custom_business_hours, can_customize_hours, role, organization_id, recess_ends_at, status, redirect_leads, is_accepting_orders")
        .eq("user_id", user.id)
        .maybeSingle<ProfileData>();
      profileResult = initialProfile;

      if (profileResult) {
        let profile: ProfileData = profileResult;
        let targetProfileUserId = user.id;

        const shadowOrgId = document.cookie
          .split("; ")
          .find((row) => row.startsWith("shadow_org_id="))
          ?.split("=")[1];

        const isSuperAdmin = profile.role === "main_admin";
        const activeOrgId = (isSuperAdmin && shadowOrgId) ? shadowOrgId : profile.organization_id;

        if (isSuperAdmin && shadowOrgId) {
          const { data: simulatedProfile } = await supabase
            .from("profiles")
            .select("user_id, full_name, avatar_url, bio, whatsapp, whatsapp_template, slug, is_available, custom_business_hours, can_customize_hours, role, organization_id, recess_ends_at, status, redirect_leads, is_accepting_orders")
            .eq("organization_id", shadowOrgId)
            .in("role", ["b2b_admin", "b2c_admin", "admin"])
            .limit(1)
            .maybeSingle<ProfileData>();

          if (simulatedProfile) {
            targetProfileUserId = simulatedProfile.user_id || user.id;
            profile = {
              ...profile,
              user_id: simulatedProfile.user_id,
              full_name: simulatedProfile.full_name,
              avatar_url: simulatedProfile.avatar_url,
              bio: simulatedProfile.bio,
              whatsapp: simulatedProfile.whatsapp,
              whatsapp_template: simulatedProfile.whatsapp_template,
              slug: simulatedProfile.slug,
              is_available: simulatedProfile.is_available,
              custom_business_hours: simulatedProfile.custom_business_hours,
              can_customize_hours: simulatedProfile.can_customize_hours,
              organization_id: simulatedProfile.organization_id,
              recess_ends_at: simulatedProfile.recess_ends_at,
              status: simulatedProfile.status,
              redirect_leads: simulatedProfile.redirect_leads,
              is_accepting_orders: simulatedProfile.is_accepting_orders,
            };
          }
        }

        setActiveProfileUserId(targetProfileUserId);

        if (activeOrgId) {
          const { data: orgData } = await supabase
            .from("organizations")
            .select("custom_domain")
            .eq("id", activeOrgId)
            .maybeSingle();
          if (orgData) {
            setCustomDomain(orgData.custom_domain);
          }
        }

        setNome(profile.full_name || "Cliente");
        setNomeInput(profile.full_name || "");
        setBioInput(profile.bio || "");
        setWhatsappInput(profile.whatsapp || "");
        setSlugInput(profile.slug || "");
        setSlugOriginal(profile.slug || "");
        setWhatsappTemplateInput(profile.whatsapp_template || "");
        setAvatar(profile.avatar_url || null);
        setIsAvailable(profile.is_available ?? true);
        setIsAcceptingOrders(profile.is_accepting_orders ?? true);

        const recessEndsAt = profile.recess_ends_at ?? null;
        if (recessEndsAt) {
          const remainingMs = new Date(recessEndsAt).getTime() - Date.now();
          if (remainingMs > 0) {
            const totalHours = Math.floor(remainingMs / (1000 * 60 * 60));
            const days = Math.floor(totalHours / 24);
            const hours = totalHours % 24;
            setRecessActive(true);
            setRecessDays(days);
            setRecessHours(hours);
          setRedirectLeads(profile.redirect_leads || false);
          } else {
            setRecessActive(false);
            setRecessDays(0);
            setRecessHours(0);
          }
        } else {
          setRecessActive(false);
          setRecessDays(0);
          setRecessHours(0);
        }

        const hasPermission = profile.can_customize_hours ?? false;
        setCanCustomize(hasPermission);

        if (profile.custom_business_hours) {
          setCustomBusinessHours(profile.custom_business_hours as BusinessHours);
        }

        // Buscar modelo de negócio separadamente para garantir sincronia com PanelLayout
        if (activeOrgId) {
          try {
            const org = await getOrganizationById(activeOrgId);
            if (org?.business_model) {
              setBusinessModel(org.business_model as "B2B" | "B2C");
            }
          } catch (e) {
            console.error("Erro ao buscar org via action:", e);
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

  function handleCopyMondayToWeek() {
    setCustomBusinessHours(prev => {
      const mondayData = prev.schedule.monday;
      return {
        ...prev,
        schedule: {
          ...prev.schedule,
          tuesday: JSON.parse(JSON.stringify(mondayData)),
          wednesday: JSON.parse(JSON.stringify(mondayData)),
          thursday: JSON.parse(JSON.stringify(mondayData)),
          friday: JSON.parse(JSON.stringify(mondayData)),
        }
      };
    });
  }

  const avatarPreview = avatarFile ? URL.createObjectURL(avatarFile) : avatar;
  const slugPreview = slugInput ? getPublicUrl(slugInput, customDomain, true, false) : null;

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

    const targetUserId = activeProfileUserId || user.id;

    const recessEndsAt = recessActive
      ? new Date(Date.now() + (recessDays * 24 * 60 * 60 * 1000) + (recessHours * 60 * 60 * 1000)).toISOString()
      : null;

    const { error } = await supabase
      .from("profiles")
      .update({
        full_name: trimmedName,
        avatar_url: newAvatarUrl,
        bio: bioInput.trim() || null,
        whatsapp: whatsappInput.trim() || null,
        whatsapp_template: whatsappTemplateInput.trim() || null,
        slug: trimmedSlug || null,
        is_available: recessActive ? false : isAvailable,
        status: recessActive ? "paused" : (isAvailable ? "active" : "paused"),
        recess_ends_at: recessEndsAt,
        custom_business_hours: customBusinessHours,
        is_accepting_orders: isAcceptingOrders,
        redirect_leads: redirectLeads,
      })
      .eq("user_id", targetUserId);

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
    
    if (newPassword.length < 6) {
      setSaveMessage("A senha deve ter pelo menos 6 caracteres.");
      return;
    }

    setChangingPassword(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email);

    if (error) {
      setSaveMessage("Erro ao solicitar troca: " + error.message);
    } else {
      setSaveMessage("Código enviado! Verifique seu e-mail.");
      setOtpSent(true);
    }
    setChangingPassword(false);
  }

  async function handleVerifyOtp() {
    if (otpCode.length < 6) {
      setSaveMessage("O código deve ter pelo menos 6 dígitos.");
      return;
    }

    setChangingPassword(true);
    const { error } = await supabase.auth.verifyOtp({
      email,
      token: otpCode,
      type: "recovery",
    });

    if (error) {
      setSaveMessage("Código inválido: " + error.message);
      setChangingPassword(false);
      return;
    }

    const { error: updateError } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (updateError) {
      setSaveMessage("Erro ao alterar senha: " + updateError.message);
    } else {
      setSaveMessage("Senha alterada com sucesso!");
      setNewPassword("");
      setConfirmNewPassword("");
      setOtpCode("");
      setOtpSent(false);
    }
    setChangingPassword(false);
  }

  async function handleSaveAccountName() {
    if (!accountName.trim()) {
      setSaveMessage("O nome da conta não pode ser vazio.");
      return;
    }
    setSaving(true);
    const { error } = await supabase.auth.updateUser({
      data: { full_name: accountName.trim() }
    });
    if (error) {
      setSaveMessage("Erro ao salvar nome: " + error.message);
    } else {
      setSaveMessage("Nome da conta atualizado com sucesso!");
    }
    setSaving(false);
  }

  async function handleSignOutOtherSessions() {
    setSaving(true);
    const { error } = await supabase.auth.signOut({ scope: "others" });
    if (error) {
      setSaveMessage("Erro ao desconectar: " + error.message);
    } else {
      setSaveMessage("Todos os outros dispositivos foram desconectados!");
    }
    setSaving(false);
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
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="max-w-4xl mx-auto space-y-6"
            >
              {/* Header com Toggle */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-3xl border shadow-sm" style={{ background: "var(--dash-surface)", borderColor: "var(--dash-border)" }}>
                <div>
                  <h2 className="text-xl font-bold" style={{ color: "var(--dash-text-primary)" }}>
                    Editar Cartão Público
                  </h2>
                  <p className="text-xs text-[var(--dash-text-muted)] mt-1">
                    Gerencie a disponibilidade e acesse o seu cartão virtual diretamente.
                  </p>
                </div>

                {/* Controles de Acesso Rápido */}
                <div className="flex flex-wrap items-center gap-3">
                  {/* Switch de Disponibilidade */}
                  <div className="flex items-center gap-3 bg-zinc-50 dark:bg-zinc-800/20 px-4 py-2 rounded-2xl border border-[var(--dash-border)]">
                    <span className={`text-[10px] font-bold uppercase tracking-wider ${isAvailable && !recessActive ? 'text-emerald-500 font-extrabold' : 'text-slate-400'}`}>
                      {isAvailable && !recessActive ? 'Disponível' : 'Indisponível'}
                    </span>
                    <button 
                      type="button"
                      disabled={recessActive}
                      onClick={() => !recessActive && setIsAvailable(!isAvailable)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${isAvailable && !recessActive ? 'bg-emerald-500' : 'bg-slate-300'} ${recessActive ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${isAvailable && !recessActive ? 'translate-x-6' : 'translate-x-1'}`} />
                    </button>
                  </div>

                  {/* Link de Cartão Público */}
                  {slugInput && (
                    <a 
                      href={getPublicUrl(slugInput, customDomain, true, true)} 
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center justify-center gap-2 px-4 py-2 rounded-2xl bg-primary/10 text-primary text-xs font-bold hover:bg-primary/20 transition-all border border-primary/20 shadow-sm"
                    >
                      <ExternalLink size={14} /> Cartão Virtual
                    </a>
                  )}
                </div>
              </div>

              {/* Card 1: Identidade */}
              <div className="rounded-3xl border p-6 shadow-sm" style={{ background: "var(--dash-surface)", borderColor: "var(--dash-border)" }}>
                <h3 className="font-bold mb-4 flex items-center gap-2" style={{ color: "var(--dash-text-primary)" }}>
                  <Users size={18} className="text-primary" /> Identidade do Vendedor
                </h3>
                <div className="flex flex-col md:flex-row gap-8">
                  <div className="flex flex-col items-center gap-3">
                    <div 
                      className="group relative h-28 w-28 rounded-3xl border overflow-hidden bg-zinc-50 transition-all hover:border-primary/50 cursor-pointer" 
                      style={{ borderColor: "var(--dash-border)", background: "var(--dash-input-bg)" }}
                      onClick={() => setShowImageEditor(true)}
                    >
                      {avatarPreview ? (
                        <>
                          <img src={avatarPreview} alt="Avatar" className="h-full w-full object-cover" />
                          <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Upload className="text-white" size={24} />
                          </div>
                        </>
                      ) : (
                        <div className="h-full w-full flex flex-col items-center justify-center text-zinc-300 gap-1">
                          <Upload size={32} />
                        </div>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-4">
                      <button 
                        type="button"
                        onClick={() => setShowImageEditor(true)}
                        className="text-xs font-bold text-primary hover:underline"
                      >
                        {avatarPreview ? "Alterar Foto" : "Enviar Foto"}
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
                  <div className="flex-1 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs font-bold uppercase tracking-wider text-[var(--dash-text-muted)] mb-1 block">Nome do Vendedor</label>
                        <input 
                          type="text" value={nomeInput} onChange={e => setNomeInput(e.target.value)}
                          className="w-full px-4 py-2 rounded-xl border outline-none bg-[var(--dash-bg)]"
                          style={{ borderColor: "var(--dash-border)", color: "var(--dash-text-primary)" }}
                        />
                      </div>
                      <div>
                        <label className="text-xs font-bold uppercase tracking-wider text-[var(--dash-text-muted)] mb-1 flex justify-between items-center">
                          <span>Bio / Cargo</span>
                          <span className={`text-[10px] ${bioInput.length >= 70 ? 'text-amber-500 font-bold' : 'text-[var(--dash-text-muted)]'}`}>
                            {bioInput.length}/80
                          </span>
                        </label>
                        <textarea 
                          value={bioInput} onChange={e => setBioInput(e.target.value.slice(0, 80))}
                          placeholder="um pequeno texto sobre o vendedor"
                          maxLength={80}
                          rows={2}
                          className="w-full px-4 py-2 rounded-xl border outline-none bg-[var(--dash-bg)] resize-none"
                          style={{ borderColor: "var(--dash-border)", color: "var(--dash-text-primary)" }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Card 2: Contato e Link */}
              <div className="rounded-3xl border p-6 shadow-sm" style={{ background: "var(--dash-surface)", borderColor: "var(--dash-border)" }}>
                <h3 className="font-bold mb-4 flex items-center gap-2" style={{ color: "var(--dash-text-primary)" }}>
                  <Phone size={18} className="text-primary" /> Contato e Link
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold uppercase tracking-wider text-[var(--dash-text-muted)] mb-1 block">WhatsApp</label>
                    <input 
                      type="tel" 
                      value={whatsappInput} 
                      onChange={e => setWhatsappInput(e.target.value.replace(/\D/g, ""))}
                      placeholder="(00) 00000-0000"
                      className="w-full px-4 py-2 rounded-xl border outline-none bg-[var(--dash-bg)]"
                      style={{ borderColor: "var(--dash-border)", color: "var(--dash-text-primary)" }}
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold uppercase tracking-wider text-[var(--dash-text-muted)] mb-1 flex justify-between">
                      <span>Link do Cartão (Slug)</span>
                      {slugChecking && <span className="text-[10px] lowercase">verificando...</span>}
                    </label>
                    <input 
                      type="text" value={slugInput} onChange={e => handleSlugChange(e.target.value)}
                      placeholder="ex: nome_do_vendedor"
                      className="w-full px-4 py-2 rounded-xl border outline-none bg-[var(--dash-bg)]"
                      style={{ borderColor: slugError ? "#ef4444" : "var(--dash-border)", color: "var(--dash-text-primary)" }}
                    />
                    {slugError ? (
                      <p className="mt-2 text-[10px] font-bold text-red-500 truncate">{slugError}</p>
                    ) : slugInput ? (
                      <p className="mt-2 text-xs font-medium text-[var(--dash-text-muted)] truncate max-w-[200px] sm:max-w-none">
                        Link: <span className="font-bold">{getPublicUrl(slugInput, customDomain, true, false)}</span>
                      </p>
                    ) : null}
                  </div>
                </div>

                <div className="mt-6 border-t pt-6" style={{ borderColor: "var(--dash-border)" }}>
                  <label className="text-xs font-bold uppercase tracking-wider text-[var(--dash-text-muted)] mb-2 block">
                    Modelo de Mensagem (WhatsApp)
                  </label>
                  <textarea 
                    value={whatsappTemplateInput} 
                    onChange={e => setWhatsappTemplateInput(e.target.value)}
                    placeholder="Ex: Olá! Vi o item {nome} no valor de {preco} e tenho interesse."
                    rows={3}
                    className="w-full px-4 py-3 rounded-xl border outline-none bg-[var(--dash-bg)] text-sm"
                    style={{ borderColor: "var(--dash-border)", color: "var(--dash-text-primary)" }}
                  />
                  <div className="mt-2 flex flex-wrap gap-2">
                    {['{nome}', '{preco}', '{sku}', '{link}', '{tipo}'].map(tag => (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => setWhatsappTemplateInput(prev => prev + tag)}
                        className="px-2 py-1 rounded-md bg-zinc-100 dark:bg-zinc-800 text-[10px] font-mono text-zinc-500 hover:text-primary transition-colors"
                      >
                        {tag}
                      </button>
                    ))}
                  </div>
                  <p className="mt-2 text-[10px] text-[var(--dash-text-muted)] leading-relaxed">
                    Personalize a mensagem que o cliente envia ao clicar no WhatsApp. Deixe vazio para usar o padrão.
                  </p>
                </div>

                <div className="mt-6 border-t pt-6" style={{ borderColor: "var(--dash-border)" }}>
                  <label className={`flex items-start gap-3 p-4 rounded-2xl border cursor-pointer transition-all ${redirectLeads ? 'border-primary bg-primary/5' : 'border-[var(--dash-border)] bg-[var(--dash-bg)]'}`}>
                    <div className="mt-0.5">
                      <input 
                        type="checkbox" 
                        checked={redirectLeads} 
                        onChange={e => setRedirectLeads(e.target.checked)} 
                        className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary" 
                      />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-bold" style={{ color: "var(--dash-text-primary)" }}>Redirecionar Cliente (Em caso de Pausa)</span>
                      </div>
                      <p className="text-[10px] leading-relaxed text-[var(--dash-text-muted)]">
                        Se ativado, quando este vendedor for marcado como Inativo (pausado), os clientes que acessarem o link dele serão redirecionados para a lista de consultores ativos da loja, evitando a perda do lead.
                      </p>
                    </div>
                  </label>
                </div>

                {/* Automação de Recesso */}
                <div className="mt-6 border-t pt-6" style={{ borderColor: "var(--dash-border)" }}>
                  <div className="flex items-center gap-2 mb-3">
                    <Calendar size={16} className="text-purple-500" />
                    <span className="text-xs font-bold" style={{ color: "var(--dash-text-primary)" }}>Programar Recesso Temporário</span>
                  </div>
                  
                  <label className={`flex items-start gap-3 p-4 rounded-2xl border cursor-pointer transition-all ${recessActive ? 'border-purple-500 bg-purple-500/5' : 'border-[var(--dash-border)] bg-[var(--dash-bg)]'}`}>
                    <div className="mt-0.5">
                      <input 
                        type="checkbox" 
                        checked={recessActive} 
                        onChange={e => {
                          const val = e.target.checked;
                          setRecessActive(val);
                          if (val) {
                            setIsAvailable(false);
                            setRedirectLeads(true);
                            if (recessDays === 0 && recessHours === 0) setRecessDays(7);
                          }
                        }} 
                        className="h-4 w-4 rounded border-gray-300 text-purple-600 focus:ring-purple-500" 
                      />
                    </div>
                    <div className="flex-1">
                      <span className="text-xs font-bold" style={{ color: "var(--dash-text-primary)" }}>Ativar recesso para este vendedor</span>
                      <p className="text-[10px] leading-relaxed text-[var(--dash-text-muted)] mt-0.5">
                        Ao salvar com o recesso ativo, o vendedor ficará pausado (Indisponível) e o redirecionamento de clientes será ativado automaticamente durante o período.
                      </p>
                    </div>
                  </label>

                  {recessActive && (
                    <div className="mt-4 p-4 rounded-2xl bg-zinc-50/50 dark:bg-zinc-800/20 border border-[var(--dash-border)] space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-[10px] font-bold uppercase tracking-wider text-[var(--dash-text-muted)] mb-1 block">Dias de Recesso</label>
                          <input 
                            type="number" 
                            min="0"
                            max="365"
                            value={recessDays} 
                            onChange={e => setRecessDays(Math.max(0, parseInt(e.target.value) || 0))}
                            className="w-full px-3 py-1.5 rounded-xl border outline-none bg-[var(--dash-bg)] text-xs text-center font-semibold"
                            style={{ borderColor: "var(--dash-border)", color: "var(--dash-text-primary)" }}
                          />
                        </div>
                        <div>
                          <label className="text-[10px] font-bold uppercase tracking-wider text-[var(--dash-text-muted)] mb-1 block">Horas Adicionais</label>
                          <input 
                            type="number" 
                            min="0"
                            max="23"
                            value={recessHours} 
                            onChange={e => setRecessHours(Math.max(0, Math.min(23, parseInt(e.target.value) || 0)))}
                            className="w-full px-3 py-1.5 rounded-xl border outline-none bg-[var(--dash-bg)] text-xs text-center font-semibold"
                            style={{ borderColor: "var(--dash-border)", color: "var(--dash-text-primary)" }}
                          />
                        </div>
                      </div>
                      
                      <div className="text-[10px] bg-purple-500/10 border border-purple-500/20 rounded-xl p-3 text-purple-600 dark:text-purple-400 leading-relaxed">
                        <p className="font-semibold flex items-center gap-1">
                          <Info size={12} />
                          {recessDays === 0 && recessHours === 0 ? (
                            <span>Defina a duração para ver a data final do recesso.</span>
                          ) : (
                            <span>
                              Retorno previsto: <strong className="underline">
                                {new Date(Date.now() + (recessDays * 24 * 60 * 60 * 1000) + (recessHours * 60 * 60 * 1000)).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' })}
                              </strong>
                            </span>
                          )}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Card 3: Permissões e Horários (Colapsável) */}
              <div className="rounded-3xl border shadow-sm overflow-hidden" style={{ background: "var(--dash-surface)", borderColor: "var(--dash-border)" }}>
                <button 
                  type="button"
                  onClick={() => setShowHoursConfig(!showHoursConfig)}
                  className="w-full flex items-center justify-between p-6 hover:bg-zinc-50/50 dark:hover:bg-zinc-800/20 transition-colors"
                >
                  <h3 className="font-bold flex items-center gap-2" style={{ color: "var(--dash-text-primary)" }}>
                    <ShieldCheck size={18} className="text-primary" /> Horário de Atendimento
                  </h3>
                  <ChevronDown size={20} className={`text-zinc-400 transition-transform ${showHoursConfig ? 'rotate-180' : ''}`} />
                </button>

                <AnimatePresence>
                  {showHoursConfig && (
                    <motion.div 
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="p-6 pt-0 space-y-6 border-t" style={{ borderColor: "var(--dash-border)" }}>
                        
                        <div className="pt-4 space-y-4">
                          <p className="text-xs font-bold uppercase tracking-widest text-[var(--dash-text-muted)]">Quadro de Horários:</p>
                          {(Object.keys(dayNamesMap) as Array<keyof typeof dayNamesMap>).map((day) => {
                            const dayData = customBusinessHours.schedule[day];
                            return (
                              <div key={day} className="flex flex-col sm:flex-row sm:items-start gap-4 border-b pb-4 last:border-0 last:pb-0" style={{ borderColor: "var(--dash-border)" }}>
                                <div className="w-auto min-w-[12rem] shrink-0 flex flex-wrap items-center gap-2">
                                  <input type="checkbox" checked={dayData.isOpen} onChange={() => handleDayToggle(day)} className="h-4 w-4" />
                                  <span className="text-sm font-medium" style={{ color: dayData.isOpen ? "var(--dash-text-primary)" : "var(--dash-text-muted)" }}>{dayNamesMap[day]}</span>
                                  {day === 'monday' && (
                                    <button
                                      type="button"
                                      onClick={handleCopyMondayToWeek}
                                      className="ml-2 flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-blue-500 hover:text-blue-600 bg-blue-50 hover:bg-blue-100 px-2 py-1 rounded transition-colors"
                                      title="Copiar horário de Segunda para toda a semana (Ter-Sex)"
                                    >
                                      <Copy size={12} /> Copiar para a semana
                                    </button>
                                  )}
                                </div>
                                <div className="flex-1 flex flex-wrap gap-2">
                                  {dayData.isOpen && dayData.shifts.map((shift, idx) => (
                                    <div key={idx} className="flex items-center gap-2">
                                      <input 
                                        type="time" value={shift.open} onChange={e => handleShiftChange(day, idx, "open", e.target.value)}
                                        className="px-2 py-1 rounded-lg border text-xs" style={{ background: "var(--dash-bg)", borderColor: "var(--dash-border)", color: "var(--dash-text-primary)" }}
                                      />
                                      <span className="text-[10px]" style={{ color: "var(--dash-text-muted)" }}>até</span>
                                      <input 
                                        type="time" value={shift.close} onChange={e => handleShiftChange(day, idx, "close", e.target.value)}
                                        className="px-2 py-1 rounded-lg border text-xs" style={{ background: "var(--dash-bg)", borderColor: "var(--dash-border)", color: "var(--dash-text-primary)" }}
                                      />
                                    </div>
                                  ))}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Action */}
              <div className="flex items-center justify-start border-t pt-6" style={{ borderColor: "var(--dash-border)" }}>
                <button 
                  onClick={handleSave} 
                  disabled={saving || !nomeInput.trim()}
                  className={`px-8 py-3 rounded-2xl font-bold transition-all shadow-xl active:scale-95 ${
                    saving || !nomeInput.trim() 
                    ? "bg-zinc-200 text-zinc-400 cursor-not-allowed shadow-none" 
                    : "bg-zinc-900 text-white hover:scale-105 shadow-primary/20"
                  }`}
                >
                  {saving ? "Salvando..." : "Salvar Cartão Público"}
                </button>
              </div>

            </motion.div>
          )}
          {/* Fim do Bloco de Identidade/Card */}

          {/* Card Segurança */}
          {view === "security" && (
            <div className="space-y-6 max-w-4xl mx-auto">
              {/* Nome Administrativo */}
              <div
                className="rounded-2xl border p-6 shadow-sm transition-colors"
                style={{ background: "var(--dash-surface)", borderColor: "var(--dash-border)" }}
              >
                <h2 className="text-base font-semibold flex items-center gap-2" style={{ color: "var(--dash-text-primary)" }}>
                  <Users size={18} className="text-primary" /> Nome da Conta
                </h2>
                <p className="mt-1 text-sm text-[var(--dash-text-muted)] leading-relaxed">
                  Este é o nome administrativo do dono da conta (não altera a vitrine).
                </p>
                <div className="mt-4 max-w-md">
                  <input
                    type="text"
                    value={accountName}
                    onChange={(e) => setAccountName(e.target.value)}
                    className="w-full rounded-xl border px-4 py-3 text-sm outline-none transition-colors"
                    style={{ background: "var(--dash-input-bg)", borderColor: "var(--dash-border)", color: "var(--dash-text-primary)" }}
                  />
                  <button
                    type="button"
                    onClick={handleSaveAccountName}
                    disabled={saving}
                    className="mt-4 px-6 py-2 rounded-xl text-sm font-bold transition-all shadow-md active:scale-95 bg-zinc-900 text-white hover:bg-zinc-800 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {saving ? "Salvando..." : "Salvar Nome"}
                  </button>
                </div>
              </div>

              {/* Email de Acesso */}
              <div
                className="rounded-2xl border p-6 shadow-sm transition-colors"
                style={{ background: "var(--dash-surface)", borderColor: "var(--dash-border)" }}
              >
                <h2 className="text-base font-semibold flex items-center gap-2" style={{ color: "var(--dash-text-primary)" }}>
                  <Package size={18} className="text-primary" /> Email de Acesso
                </h2>
                <p className="mt-2 text-sm font-medium" style={{ color: "var(--dash-text-primary)" }}>
                  {email || "Email não disponível"}
                </p>
                <p className="mt-1 text-xs" style={{ color: "var(--dash-text-muted)" }}>
                  O e-mail é a chave primária da conta e não pode ser alterado por aqui.
                </p>
              </div>

              {/* Domínio Próprio */}
              <div
                className="rounded-2xl border p-6 shadow-sm transition-colors mb-6"
                style={{ background: "var(--dash-surface)", borderColor: "var(--dash-border)" }}
              >
                <h2 className="text-base font-semibold flex items-center gap-2" style={{ color: "var(--dash-text-primary)" }}>
                  <Globe size={18} className="text-primary" /> Domínio Próprio
                </h2>
                <p className="mt-1 text-sm text-[var(--dash-text-muted)] leading-relaxed">
                  Configure um domínio personalizado (ex: meu-nome.com.br) para o seu cartão virtual, transmitindo ainda mais profissionalismo.
                </p>
                <div className="mt-6">
                  <a
                    href="/dashboard/perfil/dominio"
                    className="inline-flex px-6 py-3 rounded-xl text-sm font-bold transition-all shadow-md active:scale-95 bg-primary text-white hover:opacity-90"
                  >
                    Configurar Domínio
                  </a>
                </div>
              </div>

              {/* Sessões e Dispositivos */}
              <div
                className="rounded-2xl border p-6 shadow-sm transition-colors"
                style={{ background: "var(--dash-surface)", borderColor: "var(--dash-border)" }}
              >
                <h2 className="text-base font-semibold flex items-center gap-2" style={{ color: "var(--dash-text-primary)" }}>
                  <Clock size={18} className="text-primary" /> Sessões e Dispositivos
                </h2>
                <p className="mt-1 text-sm text-[var(--dash-text-muted)] leading-relaxed">
                  Gerencie onde a sua conta está logada. Se você esqueceu sua conta aberta em outro computador, pode desconectar todos os outros dispositivos remotamente.
                </p>
                <div className="mt-6 flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 rounded-xl border bg-emerald-500/5" style={{ borderColor: "var(--dash-border)" }}>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-emerald-500/20 text-emerald-500 flex items-center justify-center">
                      <ShieldCheck size={20} />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-emerald-600 dark:text-emerald-400">Sessão Atual Segura</p>
                      <p className="text-xs text-[var(--dash-text-muted)] mt-0.5">Você está logado neste navegador agora.</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleSignOutOtherSessions}
                    disabled={saving}
                    className="px-4 py-2 rounded-xl text-xs font-bold text-red-500 hover:bg-red-500/10 border border-red-500/20 transition-all active:scale-95 disabled:opacity-50"
                  >
                    Desconectar Outros Dispositivos
                  </button>
                </div>
              </div>

              {/* Segurança (Troca de Senha com OTP) */}
              <div
                className="rounded-2xl border p-6 shadow-sm transition-colors"
                style={{ background: "var(--dash-surface)", borderColor: "var(--dash-border)" }}
              >
                <h2 className="text-base font-semibold flex items-center gap-2" style={{ color: "var(--dash-text-primary)" }}>
                  <ShieldCheck size={18} className="text-primary" /> Troca de Senha
                </h2>
                <p className="mt-1 text-sm text-[var(--dash-text-muted)] leading-relaxed">
                  Sua senha será alterada de forma segura usando um código de verificação enviado ao seu e-mail.
                </p>

                <div className="mt-6 max-w-md">
                  <AnimatePresence mode="wait">
                    {!otpSent ? (
                      <motion.div
                        key="password-inputs"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="space-y-4"
                      >
                        <div>
                          <label className="text-xs font-bold uppercase tracking-wider text-[var(--dash-text-muted)] mb-1 block">Nova Senha</label>
                          <input
                            type="password"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            placeholder="Mínimo 6 caracteres"
                            className="w-full rounded-xl border px-4 py-3 text-sm outline-none transition-colors"
                            style={{ background: "var(--dash-input-bg)", borderColor: "var(--dash-border)", color: "var(--dash-text-primary)" }}
                          />
                        </div>
                        <div>
                          <label className="text-xs font-bold uppercase tracking-wider text-[var(--dash-text-muted)] mb-1 block">Confirmar Nova Senha</label>
                          <input
                            type="password"
                            value={confirmNewPassword}
                            onChange={(e) => setConfirmNewPassword(e.target.value)}
                            placeholder="Repita a senha"
                            className="w-full rounded-xl border px-4 py-3 text-sm outline-none transition-colors"
                            style={{ background: "var(--dash-input-bg)", borderColor: "var(--dash-border)", color: "var(--dash-text-primary)" }}
                          />
                        </div>
                        <button
                          type="button"
                          onClick={handleChangePassword}
                          disabled={changingPassword || !newPassword || newPassword !== confirmNewPassword}
                          className="w-full px-6 py-3 rounded-xl text-sm font-bold transition-all shadow-md active:scale-95 bg-primary text-white hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed mt-2"
                        >
                          {changingPassword ? "Enviando Código..." : "Alterar Senha"}
                        </button>
                      </motion.div>
                    ) : (
                      <motion.div
                        key="otp-input"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        className="space-y-4 p-6 rounded-2xl border border-primary/20 bg-primary/5"
                      >
                        <div className="text-center">
                          <ShieldCheck size={40} className="text-primary mx-auto mb-3" />
                          <h3 className="text-sm font-bold" style={{ color: "var(--dash-text-primary)" }}>Código de Verificação Enviado</h3>
                          <p className="text-xs text-[var(--dash-text-muted)] mt-1">Verifique o seu e-mail e insira o código de 6 dígitos abaixo.</p>
                        </div>
                        <div>
                          <input
                            type="text"
                            maxLength={8}
                            value={otpCode}
                            onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ""))}
                            placeholder="Ex: 123456"
                            className="w-full rounded-xl border px-4 py-4 text-center text-2xl tracking-widest font-bold outline-none transition-colors"
                            style={{ background: "var(--dash-input-bg)", borderColor: "var(--dash-border)", color: "var(--dash-text-primary)" }}
                          />
                        </div>
                        <button
                          type="button"
                          onClick={handleVerifyOtp}
                          disabled={changingPassword || otpCode.length < 6}
                          className="w-full px-6 py-3 rounded-xl text-sm font-bold transition-all shadow-md active:scale-95 bg-primary text-white hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {changingPassword ? "Verificando..." : "Validar e Atualizar Senha"}
                        </button>
                        <button
                          type="button"
                          onClick={() => setOtpSent(false)}
                          className="w-full text-xs text-[var(--dash-text-muted)] hover:text-primary transition-colors mt-2 font-semibold"
                        >
                          Cancelar e voltar
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
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
