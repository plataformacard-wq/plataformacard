import { useEffect, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { BusinessHours, TimeShift, DEFAULT_BUSINESS_HOURS } from "@/lib/utils/time";
import { getOrganizationById } from "@/lib/admin-actions";
import { getPublicUrl } from "@/lib/utils/url";

type ProfileData = {
  user_id?: string | null;
  full_name: string | null;
  avatar_url: string | null;
  bio: string | null;
  job_title: string | null;
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
  public_banner_url?: string | null;
  accepts_messages_when_closed?: boolean | null;
  organizations?: {
    business_model: string;
  };
  dash_access_profile?: boolean | null;
  granular_permissions?: any;
};

export function sanitizeSlug(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9-]/g, "-")
    .replace(/-{2,}/g, "-")
    .replace(/^-|-$/g, "");
}

export function useProfileManager() {
  const supabase = createClient();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState<string | null>(null);
  const [nome, setNome] = useState("Cliente");
  const [nameInput, setNameInput] = useState("");
  const [jobTitleInput, setJobTitleInput] = useState("");
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
  const [acceptsMessagesWhenClosed, setAcceptsMessagesWhenClosed] = useState(true);
  const [redirectLeads, setRedirectLeads] = useState(false);
  const [showHoursConfig, setShowHoursConfig] = useState(false);
  const [canCustomize, setCanCustomize] = useState(false);
  const [customBusinessHours, setCustomBusinessHours] = useState<BusinessHours>(DEFAULT_BUSINESS_HOURS);
  const [email, setEmail] = useState("");
  const [avatar, setAvatar] = useState<string | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [publicBanner, setPublicBanner] = useState<string | null>(null);
  const [publicBannerFile, setPublicBannerFile] = useState<File | null>(null);
  const [activeUploadType, setActiveUploadType] = useState<"avatar" | "public_banner">("avatar");
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState("");
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [showImageEditor, setShowImageEditor] = useState(false);
  const [businessModel, setBusinessModel] = useState<"B2B" | "B2C">("B2B");
  const [activeProfileUserId, setActiveProfileUserId] = useState<string | null>(null);
  const [customDomain, setCustomDomain] = useState<string | null>(null);
  const [profileAccess, setProfileAccess] = useState<boolean>(true);
  const [granularPermissions, setGranularPermissions] = useState<any>(null);
  
  // Password State
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
      if (hash === "#cartao") {
        setView("card");
      } else {
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
      const { data: profile } = await supabase
        .from("profiles")
        .select("user_id, full_name, avatar_url, bio, job_title, whatsapp, whatsapp_template, slug, is_available, custom_business_hours, can_customize_hours, role, organization_id, recess_ends_at, status, redirect_leads, is_accepting_orders, public_banner_url, accepts_messages_when_closed, dash_access_profile, granular_permissions")
        .eq("user_id", user.id)
        .maybeSingle<ProfileData>();
      profileResult = profile;

      if (profileResult) {
        let profileData: ProfileData = profileResult;
        let targetProfileUserId = user.id;

        const shadowOrgId = document.cookie
          .split("; ")
          .find((row) => row.startsWith("shadow_org_id="))
          ?.split("=")[1];

        const isSuperAdmin = profileData.role === "main_admin";
        const activeOrgId = (isSuperAdmin && shadowOrgId) ? shadowOrgId : profileData.organization_id;

        if (isSuperAdmin && shadowOrgId) {
          const { data: simulatedProfile } = await supabase
            .from("profiles")
            .select("user_id, full_name, avatar_url, bio, job_title, whatsapp, whatsapp_template, slug, is_available, custom_business_hours, can_customize_hours, role, organization_id, recess_ends_at, status, redirect_leads, is_accepting_orders, accepts_messages_when_closed, dash_access_profile, granular_permissions")
            .eq("organization_id", shadowOrgId)
            .in("role", ["b2b_admin", "b2c_admin", "admin"])
            .limit(1)
            .maybeSingle<ProfileData>();

          if (simulatedProfile) {
            targetProfileUserId = simulatedProfile.user_id || user.id;
            profileData = {
              ...profileData,
              ...simulatedProfile
            };
          }
        }

        setRole(profileData.role || null);
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

        setNome(profileData.full_name || "Cliente");
        setNameInput(profileData.full_name || "");
        setJobTitleInput(profileData.job_title || "");
        setBioInput(profileData.bio || "");
        setWhatsappInput(profileData.whatsapp || "");
        setSlugInput(profileData.slug || "");
        setSlugOriginal(profileData.slug || "");
        setWhatsappTemplateInput(profileData.whatsapp_template || "");
        setAvatar(profileData.avatar_url || null);
        setPublicBanner(profileData.public_banner_url || null);
        setIsAvailable(profileData.is_available ?? true);
        setIsAcceptingOrders(profileData.is_accepting_orders ?? true);
        setAcceptsMessagesWhenClosed(profileData.accepts_messages_when_closed ?? true);
        
        setProfileAccess(profileData.dash_access_profile ?? true);
        setGranularPermissions(profileData.granular_permissions || {});

        const recessEndsAt = profileData.recess_ends_at ?? null;
        if (recessEndsAt) {
          const remainingMs = new Date(recessEndsAt).getTime() - Date.now();
          if (remainingMs > 0) {
            const totalHours = Math.floor(remainingMs / (1000 * 60 * 60));
            const days = Math.floor(totalHours / 24);
            const hours = totalHours % 24;
            setRecessActive(true);
            setRecessDays(days);
            setRecessHours(hours);
            setRedirectLeads(profileData.redirect_leads || false);
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

        const hasPermission = profileData.can_customize_hours ?? false;
        setCanCustomize(hasPermission);

        if (profileData.custom_business_hours) {
          setCustomBusinessHours(profileData.custom_business_hours as BusinessHours);
        }

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
      } as BusinessHours;
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
      } as BusinessHours;
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

    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      setSaveMessage("Usuário não autenticado.");
      setSaving(false);
      return;
    }

    const trimmedName = nameInput.trim();
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
    let newPublicBannerUrl = publicBanner;

    if (publicBannerFile) {
      const fileExt = publicBannerFile.name.split(".").pop();
      const filePath = `${user.id}/public-banner.${fileExt}`;

      const { error: uploadError } = await supabase.storage.from("avatars").upload(filePath, publicBannerFile, { upsert: true });

      if (uploadError) {
        setSaveMessage("Erro ao fazer upload do banner. Tente novamente.");
        setSaving(false);
        return;
      }

      const { data: urlData } = supabase.storage.from("avatars").getPublicUrl(filePath);
      newPublicBannerUrl = urlData.publicUrl;
    }

    if (avatarFile) {
      const fileExt = avatarFile.name.split(".").pop();
      const filePath = `${user.id}/avatar.${fileExt}`;

      const { error: uploadError } = await supabase.storage.from("avatars").upload(filePath, avatarFile, { upsert: true });

      if (uploadError) {
        setSaveMessage("Erro ao fazer upload da foto. Tente novamente.");
        setSaving(false);
        return;
      }

      const { data: urlData } = supabase.storage.from("avatars").getPublicUrl(filePath);
      newAvatarUrl = urlData.publicUrl;
    }

    const targetUserId = activeProfileUserId || user.id;
    const recessEndsAt = recessActive
      ? new Date(Date.now() + (recessDays * 24 * 60 * 60 * 1000) + (recessHours * 60 * 60 * 1000)).toISOString()
      : null;

    const { error } = await supabase
      .from("profiles")
      .update({
        full_name: nameInput.trim() || null,
        job_title: jobTitleInput.trim() || null,
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
        public_banner_url: newPublicBannerUrl,
        redirect_leads: redirectLeads,
        accepts_messages_when_closed: acceptsMessagesWhenClosed,
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
    setPublicBanner(newPublicBannerUrl);
    setPublicBannerFile(null);
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

  function onImageEditorConfirm(file: File) {
    if (activeUploadType === "avatar") {
      setAvatarFile(file);
    } else {
      setPublicBannerFile(file);
      setPublicBanner(URL.createObjectURL(file));
    }
  }

  return {
    loading, role, nome, nameInput, setNameInput, jobTitleInput, setJobTitleInput,
    bioInput, setBioInput, whatsappInput, setWhatsappInput, slugInput, handleSlugChange,
    whatsappTemplateInput, setWhatsappTemplateInput, slugOriginal, slugError, slugChecking,
    isAvailable, setIsAvailable, recessActive, setRecessActive, recessDays, setRecessDays,
    recessHours, setRecessHours, useCompanyHours, setUseCompanyHours, isAcceptingOrders, setIsAcceptingOrders,
    acceptsMessagesWhenClosed, setAcceptsMessagesWhenClosed, redirectLeads, setRedirectLeads,
    showHoursConfig, setShowHoursConfig, canCustomize, customBusinessHours, setCustomBusinessHours,
    handleDayToggle, handleShiftChange, handleAddShift, handleRemoveShift, handleCopyMondayToWeek,
    email, avatar, setAvatar, avatarFile, setAvatarFile, publicBanner, setPublicBanner, publicBannerFile, setPublicBannerFile,
    activeUploadType, setActiveUploadType, saving, saveMessage, saveSuccess, showImageEditor, setShowImageEditor,
    businessModel, activeProfileUserId, customDomain, profileAccess, granularPermissions,
    newPassword, setNewPassword, confirmNewPassword, setConfirmNewPassword, changingPassword,
    handleChangePassword, otpSent, setOtpSent, otpCode, setOtpCode, handleVerifyOtp,
    accountName, setAccountName, handleSaveAccountName, handleSignOutOtherSessions,
    view, setView, avatarPreview, slugPreview, handleSave, onImageEditorConfirm
  };
}
