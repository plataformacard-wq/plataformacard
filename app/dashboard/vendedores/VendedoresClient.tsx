"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { getPublicUrl } from "@/lib/utils/url";
import { 
  Users, 
  UserPlus, 
  Trash2, 
  Mail, 
  Phone, 
  Clock, 
  Search,
  X,
  Upload,
  ChevronLeft,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  ChevronDown,
  LayoutDashboard,
  BarChart3,
  Settings,
  ShieldCheck,
  Package,
  Shuffle,
  Calendar,
  Info,
  Image as ImageIcon
} from "lucide-react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import ImageEditorModal from "@/components/dashboard/ImageEditorModal";
import { BusinessHours, TimeShift } from "@/lib/utils/time";

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

const dayNamesMap = {
  monday: "Segunda-feira",
  tuesday: "Terça-feira",
  wednesday: "Quarta-feira",
  thursday: "Quinta-feira",
  friday: "Sexta-feira",
  saturday: "Sábado",
  sunday: "Domingo",
};

import { createSeller, updateSeller, getSellers, toggleSellerStatus, terminateSeller, uploadAvatarAction, uploadPublicBannerAction, updateSellerPassword } from "@/lib/dashboard/sellerActions";
import VendedoresForm from "@/components/dashboard/vendedores/VendedoresForm";

function RecessCountdown({ endsAt }: { endsAt: string }) {
  const [timeLeft, setTimeLeft] = useState("");

  useEffect(() => {
    function updateTimer() {
      const remainingMs = new Date(endsAt).getTime() - Date.now();
      if (remainingMs <= 0) {
        setTimeLeft("Recesso concluído");
        return;
      }

      const totalMinutes = Math.floor(remainingMs / (1000 * 60));
      const totalHours = Math.floor(totalMinutes / 60);
      const days = Math.floor(totalHours / 24);
      const hours = totalHours % 24;
      const minutes = totalMinutes % 60;

      let parts: string[] = [];
      if (days > 0) parts.push(`${days}d`);
      if (hours > 0 || days > 0) parts.push(`${hours}h`);
      parts.push(`${minutes}m`);

      setTimeLeft(`Volta em ${parts.join(" ")}`);
    }

    updateTimer();
    const interval = setInterval(updateTimer, 60000); // update every minute

    return () => clearInterval(interval);
  }, [endsAt]);

  if (!timeLeft) return null;

  return (
    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 text-[10px] font-bold uppercase tracking-wider border border-purple-200 dark:border-purple-800/30 shadow-sm animate-pulse">
      <Clock size={12} />
      {timeLeft}
    </span>
  );
}

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

  useEffect(() => {
    fetchData();
  }, []);

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

  function handleOpenForm(seller?: Seller) {
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

  return (
    <div className="space-y-6 pb-20">
      <AnimatePresence mode="wait">
        {view === 'list' ? (
          <motion.div 
            key="list"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="space-y-6"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold" style={{ color: "var(--dash-text-primary)" }}>Colaboradores</h1>
                <p className="text-sm mt-1" style={{ color: "var(--dash-text-secondary)" }}>
                  Gerencie a ficha completa e as permissões da sua equipe.
                </p>
              </div>
              <div className="flex flex-col items-end gap-2">
                {/* Widget de Capacidade de Vendedores */}
                {sellerLimit > 0 && (
                  <div className="text-right">
                    <span className={`text-xs font-black ${sellerCount >= sellerLimit ? 'text-red-500' : 'text-emerald-500'}`}>
                      {sellerCount} / {sellerLimit} colaboradores
                    </span>
                    <div className="mt-1 h-1.5 w-40 rounded-full bg-[var(--dash-border)] overflow-hidden">
                      <motion.div
                        className={`h-full rounded-full ${sellerCount >= sellerLimit ? 'bg-red-500' : 'bg-emerald-500'}`}
                        animate={{ width: `${Math.min((sellerCount / sellerLimit) * 100, 100)}%` }}
                        transition={{ duration: 0.6 }}
                      />
                    </div>
                  </div>
                )}
                <button 
                  onClick={() => handleOpenForm()}
                  disabled={sellerLimit > 0 && sellerCount >= sellerLimit}
                  className="flex items-center justify-center gap-2 rounded-xl px-5 py-2.5 text-sm font-bold shadow-lg shadow-black/5 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100"
                  style={{ background: "var(--dash-text-primary)", color: "var(--dash-bg)" }}
                >
                  <UserPlus size={18} />
                  Novo Colaborador
                </button>
              </div>
            </div>

            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--dash-text-muted)]" size={18} />
              <input 
                type="text"
                placeholder="Buscar por nome ou telefone..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 rounded-2xl border outline-none"
                style={{ background: "var(--dash-surface)", borderColor: "var(--dash-border)", color: "var(--dash-text-primary)" }}
              />
            </div>

            <div className="space-y-4">
              {vendedores
                .filter(v => v.role === 'seller')
                .filter(v => {
                  const query = searchQuery.toLowerCase();
                  return (
                    v.full_name?.toLowerCase().includes(query) || 
                    v.whatsapp?.includes(query.replace(/\D/g, ""))
                  );
                })
                .map(v => (
                <div 
                  key={v.id} 
                  onClick={() => handleOpenForm(v)}
                  className="group relative flex flex-col md:flex-row items-center gap-6 p-5 rounded-[27px] border transition-all hover:shadow-xl hover:border-primary/30 cursor-pointer"
                  style={{ background: "var(--dash-surface)", borderColor: "var(--dash-border)" }}
                >
                  {/* Foto e Info Principal */}
                  <div className="flex items-center gap-4 w-full md:w-auto md:min-w-[280px] md:max-w-[300px]">
                    <div className="relative flex-shrink-0">
                      {v.avatar_url ? (
                        <img src={v.avatar_url} className="h-20 w-20 rounded-[27px] object-cover border-2 border-white shadow-md" />
                      ) : (
                        <div className="h-20 w-20 rounded-[27px] bg-primary/10 flex items-center justify-center text-primary font-bold text-2xl">
                          {v.full_name?.charAt(0) || "V"}
                        </div>
                      )}
                      <div className={`absolute -bottom-1 -right-1 h-5 w-5 rounded-full border-2 border-white shadow-sm ${v.is_available ? 'bg-emerald-500' : 'bg-slate-300'}`} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h4 className="font-bold text-lg truncate" style={{ color: "var(--dash-text-primary)" }}>{v.full_name || "Sem nome"}</h4>
                      <p className="text-xs text-[var(--dash-text-muted)] truncate mb-1 pr-2" title={v.bio || ""}>
                        {v.bio || "Consultor de Vendas"}
                      </p>
                      <span className="inline-block px-2 py-0.5 rounded-lg bg-primary/5 text-[10px] font-bold text-primary truncate max-w-full">
                        {getPublicUrl(v.slug || "", customDomain, false, false)}
                      </span>
                      {v.recess_ends_at && new Date(v.recess_ends_at) > new Date() && (
                        <div className="mt-2.5 flex items-center gap-2 flex-wrap">
                          <RecessCountdown endsAt={v.recess_ends_at} />
                          {v.redirect_leads && (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-900 dark:bg-zinc-800 text-white text-[10px] font-bold uppercase tracking-wider border border-transparent shadow-sm">
                              <Shuffle size={12} className="text-purple-400" />
                              Redirecionamento ativo
                            </span>
                          )}
                        </div>
                      )}
                      {v.redirect_leads && !v.is_available && !(v.recess_ends_at && new Date(v.recess_ends_at) > new Date()) && (
                        <div className="mt-2.5 flex items-center">
                          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-900 dark:bg-zinc-800 text-white text-[10px] font-bold uppercase tracking-wider border border-transparent shadow-sm">
                            <Shuffle size={12} className="text-purple-400" />
                            Redirecionamento de clientes ativo
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Dados Analíticos (Placeholders zerados para realidade) */}
                  <div className="flex-1 grid grid-cols-3 gap-2 px-6 border-x border-dashed hidden lg:grid" style={{ borderColor: "var(--dash-border)" }}>
                    <div className="text-center">
                      <p className="text-[9px] font-bold uppercase tracking-tight text-[var(--dash-text-muted)] mb-1 whitespace-nowrap">Cliques no Link</p>
                      <p className="text-xl font-black" style={{ color: "var(--dash-text-primary)" }}>0</p>
                    </div>
                    <div className="text-center">
                      <p className="text-[9px] font-bold uppercase tracking-tight text-[var(--dash-text-muted)] mb-1 whitespace-nowrap">Contatos Realizados</p>
                      <p className="text-xl font-black" style={{ color: "var(--dash-text-primary)" }}>0</p>
                    </div>
                    <div className="text-center">
                      <p className="text-[9px] font-bold uppercase tracking-tight text-[var(--dash-text-muted)] mb-1 whitespace-nowrap">Conversão</p>
                      <p className="text-xl font-black text-emerald-500">0%</p>
                    </div>
                  </div>

                  {/* Ações Rápidas */}
                  <div className="flex flex-row md:flex-col items-center gap-3 min-w-[140px]">
                    <div className="flex items-center gap-3 mr-4 md:mr-0">
                      <span className={`text-[10px] font-bold uppercase tracking-tighter ${
                        v.status === 'terminated' ? 'text-red-500' : 
                        (v.recess_ends_at && new Date(v.recess_ends_at) > new Date()) ? 'text-purple-500 font-extrabold' :
                        v.is_available ? 'text-emerald-500' : 'text-slate-400'
                      }`}>
                        {v.status === 'terminated' ? 'Desligado' : 
                         (v.recess_ends_at && new Date(v.recess_ends_at) > new Date()) ? 'Em Recesso' :
                         v.is_available ? 'Disponível' : 'Indisponível'}
                      </span>
                      {v.status !== 'terminated' && (
                        <button 
                          onClick={(e) => { e.stopPropagation(); handleToggleStatus(v); }}
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${v.is_available ? 'bg-emerald-500' : 'bg-slate-300'}`}
                        >
                          <span className={`inline-block h-4 w-4 transform rounded-full bg-[var(--dash-surface)] transition-transform ${v.is_available ? 'translate-x-6' : 'translate-x-1'}`} />
                        </button>
                      )}
                    </div>
                    
                    <div className="flex flex-col gap-2 w-full">
                      <a 
                        href={getPublicUrl(v.slug || "", customDomain, false, true)} 
                        target="_blank"
                        onClick={(e) => e.stopPropagation()}
                        className="flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-primary/10 text-primary text-xs font-bold hover:bg-primary/20 transition-all"
                      >
                        <ExternalLink size={14} /> Cartão Virtual
                      </a>
                      <button 
                        onClick={() => handleOpenForm(v)}
                        className="px-4 py-2 rounded-xl bg-zinc-900 text-white text-xs font-bold hover:bg-black transition-all"
                      >
                        Editar Ficha
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
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
