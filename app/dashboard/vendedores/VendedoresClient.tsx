"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter, useSearchParams } from "next/navigation";
import { AnimatePresence } from "framer-motion";
import ImageEditorModal from "@/components/dashboard/ImageEditorModal";
import { BusinessHours, TimeShift } from "@/lib/utils/time";
import VendedoresListView from "@/components/dashboard/vendedores/VendedoresListView";

type Seller = {
  id: string;
  full_name: string | null;
  email: string | null;
  whatsapp: string | null;
  avatar_url: string | null;
  bio: string | null;
  slug: string | null;
  job_title: string | null;
  can_customize_hours: boolean | null;
  is_available: boolean | null;
  custom_business_hours: any;
  role: string;
  dash_access_catalog: boolean | null;
  dash_access_analytics: boolean | null;
  dash_access_company: boolean | null;
  status: string | null;
  redirect_leads: boolean | null;
  hide_prices: boolean | null;
  recess_ends_at: string | null;
  whatsapp_template: string | null;
  accepts_messages_when_closed: boolean | null;
  public_banner_url: string | null;
};

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

import { createSeller, updateSeller, getSellers, toggleSellerStatus, terminateSeller, uploadAvatarAction, uploadPublicBannerAction } from "@/lib/dashboard/sellerActions";
import VendedoresForm from "@/components/dashboard/vendedores/VendedoresForm";
import { useFeatureGate } from "@/hooks/useFeatureGate";
import UpgradeModal from "@/components/dashboard/upsell/UpgradeModal";
import { Sparkles, Lock } from "lucide-react";

export default function VendedoresClient({
  initialSellerLimit = 0,
  initialSellerCount = 0,
  customDomain = null,
}: {
  initialSellerLimit?: number;
  initialSellerCount?: number;
  customDomain?: string | null;
}) {
  const supabase = createClient();
  const [loading, setLoading] = useState(true);
  const [vendedores, setVendedores] = useState<Seller[]>([]);
  const [orgId, setOrgId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isB2C, setIsB2C] = useState(false);
  const [sellerLimit] = useState(initialSellerLimit);
  const [sellerCount, setSellerCount] = useState(initialSellerCount);
  const router = useRouter();
  
  // View State: 'list' | 'form'
  const [view, setView] = useState<'list' | 'form'>('list');
  const [selectedSeller, setSelectedSeller] = useState<Seller | null>(null);
  
  // Form State
  const [formEmail, setFormEmail] = useState("");
  const [formName, setFormName] = useState("");
  const [formJobTitle, setFormJobTitle] = useState("");
  const [formBio, setFormBio] = useState("");
  const [formWhatsapp, setFormWhatsapp] = useState("");
  const [formSlug, setFormSlug] = useState("");
  const [formRole, setFormRole] = useState("seller");
  const [formAvatar, setFormAvatar] = useState<string | null>(null);
  const [formAvatarFile, setFormAvatarFile] = useState<File | null>(null);
  const [formPublicBanner, setFormPublicBanner] = useState<string | null>(null);
  const [formPublicBannerFile, setFormPublicBannerFile] = useState<File | null>(null);
  const [formCanCustomize, setFormCanCustomize] = useState(false);
  const [formHours, setFormHours] = useState<BusinessHours>(defaultBusinessHours);
  const [formWhatsappTemplate, setFormWhatsappTemplate] = useState("");
  const [formRedirectLeads, setFormRedirectLeads] = useState(false);
  const [formHidePrices, setFormHidePrices] = useState(false);
  const [formAvailable, setFormAvailable] = useState(true);
  const [formAcceptsMessagesWhenClosed, setFormAcceptsMessagesWhenClosed] = useState(true);
  const [formRecessActive, setFormRecessActive] = useState(false);
  const [formRecessDays, setFormRecessDays] = useState(0);
  const [formRecessHours, setFormRecessHours] = useState(0);
  const [showImageEditor, setShowImageEditor] = useState(false);
  const [activeUploadType, setActiveUploadType] = useState<"avatar" | "public_banner">("avatar");
  
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [showHoursConfig, setShowHoursConfig] = useState(false);
  const [showTerminateConfirm, setShowTerminateConfirm] = useState(false);
  const [terminating, setTerminating] = useState(false);
  const searchParams = useSearchParams();
  const editSellerId = searchParams?.get("editSeller");

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (editSellerId && vendedores.length > 0) {
      const target = vendedores.find((v) => v.id === editSellerId);
      if (target) {
        handleOpenForm(target);
      }
    }
  }, [editSellerId, vendedores]);

  const [debugData, setDebugData] = useState<any>(null);

  async function fetchData() {
    setLoading(true);
    
    // 1. Buscar via Server Action (Ignora RLS)
    const result = await getSellers();
    
    if (result.error) {
      console.error("❌ Erro ao buscar vendedores:", result.error);
    } else if (result.sellers) {
      const sellers = result.sellers as Seller[];
      setVendedores(sellers);
      setDebugData(result.debug);
      // Atualiza contagem real de vendedores
      setSellerCount(sellers.filter(s => s.role === 'seller').length);
    }

    // 2. Verificar permissões e B2C (Para redirecionamento se necessário)
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("organization_id, role")
        .eq("user_id", user.id)
        .maybeSingle();

      const shadowOrgId = document.cookie
        .split("; ")
        .find((row) => row.startsWith("shadow_org_id="))
        ?.split("=")[1];

      const isSuperAdmin = profile?.role === "main_admin";
      const activeOrgId = (isSuperAdmin && shadowOrgId) ? shadowOrgId : profile?.organization_id;

      if (activeOrgId) {
        setOrgId(activeOrgId);
        const { data: org } = await supabase
          .from("organizations")
          .select("business_model")
          .eq("id", activeOrgId)
          .maybeSingle();
        
        if (org?.business_model === "B2C" || (isSuperAdmin && shadowOrgId) || profile?.role === "b2c_admin") {
          // Se for B2C simulado ou real, ou se a role for b2c_admin, redireciona
          const isB2CModel = org?.business_model === "B2C";
          if (isB2CModel) {
            setIsB2C(true);
            router.push("/dashboard");
          }
        }
      }
    }
    
    setLoading(false);
  }

  const formatWhatsApp = (value: string) => {
    const digits = value.replace(/\D/g, "");
    if (digits.length <= 11) {
      return digits
        .replace(/^(\d{2})(\d)/g, "($1) $2")
        .replace(/(\d{5})(\d)/, "$1-$2");
    }
    return digits.slice(0, 11)
      .replace(/^(\d{2})(\d)/g, "($1) $2")
      .replace(/(\d{5})(\d)/, "$1-$2");
  };

  async function handleToggleStatus(seller: Seller) {
    const newStatus = !seller.is_available;
    
    // Atualiza localmente para feedback instantâneo
    setVendedores(prev => prev.map(v => v.id === seller.id ? { ...v, is_available: newStatus, status: newStatus ? 'active' : 'paused' } : v));

    const result = await toggleSellerStatus(seller.id, newStatus);
    if (result.error) {
      setMessage(`Erro ao mudar status: ${result.error}`);
      // Reverte se der erro
      fetchData();
    }
  }

  async function handleTerminate() {
    if (!selectedSeller) return;
    setTerminating(true);
    const result = await terminateSeller(selectedSeller.id);
    if (result.error) {
      setMessage(`Erro ao desligar vendedor: ${result.error}`);
      setTerminating(false);
      setShowTerminateConfirm(false);
      return;
    }
    
    setMessage("Vendedor desligado com sucesso. Dados Pessoais removidos.");
    setShowTerminateConfirm(false);
    setTerminating(false);
    fetchData();
    setTimeout(() => setView('list'), 2000);
  }

  function handleOpenForm(seller?: Seller, initialRole: string = "seller") {
    setMessage("");

    // Guard de limite de vendedores (somente para novos cadastros)
    if (!seller && sellerLimit > 0 && sellerCount >= sellerLimit) {
      setMessage(
        `Limite atingido: seu plano permite ${sellerLimit} colaborador${sellerLimit !== 1 ? 'es' : ''}. Faça upgrade para continuar.`
      );
      return;
    }

    if (seller) {
      setSelectedSeller(seller);
      setFormEmail(seller.email || "");
      setFormName(seller.full_name || "");
      setFormJobTitle(seller.job_title || "");
      setFormBio(seller.bio || "");
      setFormWhatsapp(seller.whatsapp ? formatWhatsApp(seller.whatsapp) : "");
      setFormSlug(seller.slug || "");
      setFormRole(seller.role || "seller");
      setFormAvatar(seller.avatar_url || null);
      setFormPublicBanner(seller.public_banner_url || null);
      setFormCanCustomize(seller.can_customize_hours ?? false);
      setFormHours(seller.custom_business_hours || defaultBusinessHours);
      setFormWhatsappTemplate(seller.whatsapp_template || "");
      setFormRedirectLeads(seller.redirect_leads || false);
      setFormHidePrices(seller.hide_prices || false);
      setFormAvailable(seller.is_available ?? true);
      setFormAcceptsMessagesWhenClosed(seller.accepts_messages_when_closed ?? true);
      if (seller.recess_ends_at) {
        const remainingMs = new Date(seller.recess_ends_at).getTime() - Date.now();
        if (remainingMs > 0) {
          const totalHours = Math.floor(remainingMs / (1000 * 60 * 60));
          const days = Math.floor(totalHours / 24);
          const hours = totalHours % 24;
          setFormRecessActive(true);
          setFormRecessDays(days);
          setFormRecessHours(hours);
        } else {
          setFormRecessActive(false);
          setFormRecessDays(0);
          setFormRecessHours(0);
        }
      } else {
        setFormRecessActive(false);
        setFormRecessDays(0);
        setFormRecessHours(0);
      }
    } else {
      setSelectedSeller(null);
      setFormEmail("");
      setFormName("");
      setFormJobTitle("");
      setFormBio("");
      setFormWhatsapp("");
      setFormSlug("");
      setFormRole(initialRole);
      setFormAvatar(null);
      setFormAvatarFile(null);
      setFormPublicBanner(null);
      setFormPublicBannerFile(null);
      setFormCanCustomize(false);
      setFormHours(defaultBusinessHours);
      setFormWhatsappTemplate("");
      setFormRedirectLeads(false);
      setFormHidePrices(false);
      setFormAvailable(true);
      setFormAcceptsMessagesWhenClosed(true);
      setFormRecessActive(false);
      setFormRecessDays(0);
      setFormRecessHours(0);
    }
    setView('form');
  }

  const isFormValid = !!(formName && formBio && formWhatsapp && formSlug);

  async function handleSave() {
    if (!isFormValid) {
      setMessage("Preencha todos os campos obrigatórios (Nome, Bio, WhatsApp e Link).");
      return;
    }
    setSaving(true);
    
    let finalAvatarUrl = formAvatar;
    let finalPublicBannerUrl = formPublicBanner;
    
    // Se for NOVO, primeiro criamos o usuário para pegar o ID
    if (!selectedSeller) {
      const formData = new FormData();
      formData.append("fullName", formName);
      formData.append("slug", formSlug);
      formData.append("jobTitle", formJobTitle);
      formData.append("bio", formBio);
      formData.append("whatsapp", formWhatsapp.replace(/\D/g, ""));
      formData.append("role", formRole);
      formData.append("whatsappTemplate", formWhatsappTemplate);
      formData.append("redirectLeads", String(formRedirectLeads));
      formData.append("hidePrices", String(formHidePrices));
      formData.append("acceptsMessagesWhenClosed", String(formAcceptsMessagesWhenClosed));
      formData.append("publicBannerUrl", formPublicBanner || "");

      const result = await createSeller(formData);
      
      if (result.error) {
        setMessage(`Erro: ${result.error}`);
        setSaving(false);
        return;
      }

      // Agora que temos o ID, fazemos o upload da foto se houver um NOVO arquivo
      if (formAvatarFile && result.id) {
        const formData = new FormData();
        formData.append("file", formAvatarFile);
        const uploadResult = await uploadAvatarAction(result.id, formData);

        if (!uploadResult.error && uploadResult.url) {
          finalAvatarUrl = uploadResult.url;
          // Atualiza o perfil com a URL real via SERVER ACTION (para ignorar RLS)
          await updateSeller(result.id, { avatar_url: finalAvatarUrl });
        }
      }
      
      if (formPublicBannerFile && result.id) {
        const bannerFormData = new FormData();
        bannerFormData.append("file", formPublicBannerFile);
        const uploadResult = await uploadPublicBannerAction(result.id, bannerFormData);
        if (uploadResult.url) {
          finalPublicBannerUrl = uploadResult.url;
          await updateSeller(result.id, { public_banner_url: finalPublicBannerUrl });
        }
      }

      await fetchData();
    } else {
      // EDIÇÃO
      if (formAvatarFile) {
        const formData = new FormData();
        formData.append("file", formAvatarFile);
        const uploadResult = await uploadAvatarAction(selectedSeller.id, formData);

        if (!uploadResult.error && uploadResult.url) {
          finalAvatarUrl = uploadResult.url;
        }
      }

      if (formPublicBannerFile) {
        const bannerFormData = new FormData();
        bannerFormData.append("file", formPublicBannerFile);
        const uploadResult = await uploadPublicBannerAction(selectedSeller.id, bannerFormData);
        if (uploadResult.url) {
          finalPublicBannerUrl = uploadResult.url;
        }
      }

      const recessEndsAt = formRecessActive
        ? new Date(Date.now() + (formRecessDays * 24 * 60 * 60 * 1000) + (formRecessHours * 60 * 60 * 1000)).toISOString()
        : null;

      const profileData = {
        full_name: formName,
        job_title: formJobTitle,
        bio: formBio,
        whatsapp: formWhatsapp.replace(/\D/g, ""),
        slug: formSlug,
        role: formRole,
        avatar_url: finalAvatarUrl,
        can_customize_hours: formCanCustomize,
        custom_business_hours: formHours,
        whatsapp_template: formWhatsappTemplate,
        redirect_leads: formRedirectLeads,
        hide_prices: formHidePrices,
        accepts_messages_when_closed: formAcceptsMessagesWhenClosed,
        public_banner_url: finalPublicBannerUrl,
        recess_ends_at: recessEndsAt,
        ...(formRecessActive 
          ? { is_available: false, status: "paused" } 
          : { is_available: formAvailable, status: formAvailable ? "active" : "paused" }),
      };

      // USA SERVER ACTION para ignorar RLS
      const result = await updateSeller(selectedSeller.id, profileData);
      
      if (result.error) {
        setMessage(`Erro no servidor: ${result.error}`);
        setSaving(false);
        return;
      }
    }

    setMessage("Vendedor salvo com sucesso!");
    router.refresh();
    fetchData();
    setTimeout(() => setView('list'), 1500);
    setSaving(false);
  }

  // Handlers de Horários (Copiados do Perfil para consistência total)
  function handleDayToggle(day: keyof BusinessHours["schedule"]) {
    setFormHours(prev => ({
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
    setFormHours(prev => {
      const newShifts = [...prev.schedule[day].shifts];
      newShifts[shiftIndex] = { ...newShifts[shiftIndex], [field]: value };
      return { ...prev, schedule: { ...prev.schedule, [day]: { ...prev.schedule[day], shifts: newShifts } } };
    });
  }

  const { requestFeature, isOpen: isUpgradeOpen, closeModal: closeUpgradeModal, requestedFeature } = useFeatureGate();

  return (
    <div className="space-y-6 pb-20">
      <UpgradeModal
        isOpen={isUpgradeOpen}
        onClose={closeUpgradeModal}
        feature={requestedFeature}
      />

      {sellerLimit === 1 && (
        <div className="relative overflow-hidden rounded-[27px] border border-amber-500/30 bg-gradient-to-br from-amber-500/10 via-amber-500/5 to-transparent p-6 shadow-lg">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded bg-amber-500/20 text-amber-400 text-[10px] font-black uppercase tracking-wider">
                <Lock size={12} /> Plano Starter (1 Usuário - Gestor)
              </div>
              <h3 className="text-base font-bold text-[var(--dash-text-primary)]">
                Adicione Colaboradores e Vendedores à sua Equipe
              </h3>
              <p className="text-xs text-[var(--dash-text-muted)] leading-relaxed max-w-2xl">
                Seu plano atual permite apenas 1 usuário (o Gestor). Faça o upgrade para o plano <strong className="text-amber-400">PRO</strong> (até 3 colaboradores) ou <strong className="text-amber-400">Sales Team</strong> (até 10 colaboradores) para criar perfis para seus vendedores.
              </p>
            </div>
            <button
              onClick={() => requestFeature("sales_team")}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded bg-gradient-to-r from-amber-500 to-emerald-500 text-[var(--dash-text-primary)] font-extrabold text-xs shadow-md transition-transform active:scale-95 whitespace-nowrap"
            >
              <Sparkles size={14} /> Fazer Upgrade de Plano
            </button>
          </div>
        </div>
      )}

      <AnimatePresence mode="wait">
        {view === 'list' ? (
          <VendedoresListView
            vendedores={vendedores}
            sellerLimit={sellerLimit}
            sellerCount={sellerCount}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            handleOpenForm={handleOpenForm}
            handleToggleStatus={handleToggleStatus}
            customDomain={customDomain}
            loading={loading}
          />
        ) : (
          <VendedoresForm
            selectedSeller={selectedSeller}
            setView={setView}
            isB2C={isB2C}
            formAvatar={formAvatar}
            formAvatarFile={formAvatarFile}
            setActiveUploadType={setActiveUploadType}
            setShowImageEditor={setShowImageEditor}
            formPublicBanner={formPublicBanner}
            formPublicBannerFile={formPublicBannerFile}
            formRecessDays={formRecessDays}
            formRecessHours={formRecessHours}
            setShowTerminateConfirm={setShowTerminateConfirm}
            showTerminateConfirm={showTerminateConfirm}
            terminating={terminating}
            handleTerminateSeller={handleTerminate}
            formName={formName}
            setFormName={setFormName}
            formEmail={formEmail}
            setFormEmail={setFormEmail}
            formJobTitle={formJobTitle}
            setFormJobTitle={setFormJobTitle}
            formWhatsapp={formWhatsapp}
            setFormWhatsapp={setFormWhatsapp}
            formWhatsappTemplate={formWhatsappTemplate}
            setFormWhatsappTemplate={setFormWhatsappTemplate}
            formBio={formBio}
            setFormBio={setFormBio}
            formAvailable={formAvailable}
            setFormAvailable={setFormAvailable}
            formRecessActive={formRecessActive}
            setFormRecessActive={setFormRecessActive}
            setFormRecessDays={setFormRecessDays}
            setFormRecessHours={setFormRecessHours}
            formAcceptsMessagesWhenClosed={formAcceptsMessagesWhenClosed}
            setFormAcceptsMessagesWhenClosed={setFormAcceptsMessagesWhenClosed}
            formCanCustomize={formCanCustomize}
            setFormCanCustomize={setFormCanCustomize}
            formRedirectLeads={formRedirectLeads}
            setFormRedirectLeads={setFormRedirectLeads}
            formHidePrices={formHidePrices}
            setFormHidePrices={setFormHidePrices}
            formSlug={formSlug}
            setFormSlug={setFormSlug}
            formRole={formRole}
            setFormRole={setFormRole}
            saving={saving}
            handleSaveSeller={handleSave}
            customDomain={customDomain}
            setFormAvatar={setFormAvatar}
            setFormAvatarFile={setFormAvatarFile}
            setFormPublicBanner={setFormPublicBanner}
            setFormPublicBannerFile={setFormPublicBannerFile}
            setShowHoursConfig={setShowHoursConfig}
            showHoursConfig={showHoursConfig}
            formHours={formHours}
            message={message}
            isFormValid={isFormValid}
            handleTerminate={handleTerminate}
            handleSave={handleSave}
            handleDayToggle={handleDayToggle}
            handleShiftChange={handleShiftChange}
          />
        )}
      </AnimatePresence>

      {showImageEditor && (
        <ImageEditorModal
          isOpen={showImageEditor}
          onClose={() => setShowImageEditor(false)}
          aspectRatio={activeUploadType === "avatar" ? 1 : 3}
          minWidth={activeUploadType === "avatar" ? 400 : 1200}
          minHeight={activeUploadType === "avatar" ? 400 : 400}
          onConfirm={(file: File) => {
            if (activeUploadType === "avatar") {
              setFormAvatarFile(file);
              setFormAvatar(URL.createObjectURL(file));
            } else {
              setFormPublicBannerFile(file);
              setFormPublicBanner(URL.createObjectURL(file));
            }
          }}
        />
      )}
    </div>
  );
}
