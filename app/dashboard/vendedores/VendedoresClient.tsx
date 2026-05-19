"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
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
  Info
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
  can_customize_hours: boolean | null;
  is_available: boolean | null;
  custom_business_hours: any;
  role: string;
  dash_access_catalog: boolean | null;
  dash_access_analytics: boolean | null;
  dash_access_company: boolean | null;
  status: string | null;
  redirect_leads: boolean | null;
  recess_ends_at: string | null;
  whatsapp_template: string | null;
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

import { createSeller, updateSeller, getSellers, toggleSellerStatus, terminateSeller } from "@/lib/dashboard/sellerActions";

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
}: {
  initialSellerLimit?: number;
  initialSellerCount?: number;
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
  const [formPassword, setFormPassword] = useState("");
  const [formName, setFormName] = useState("");
  const [formBio, setFormBio] = useState("");
  const [formWhatsapp, setFormWhatsapp] = useState("");
  const [formSlug, setFormSlug] = useState("");
  const [formAvatar, setFormAvatar] = useState<string | null>(null);
  const [formAvatarFile, setFormAvatarFile] = useState<File | null>(null);
  const [formCanCustomize, setFormCanCustomize] = useState(false);
  const [formAccessCatalog, setFormAccessCatalog] = useState(false);
  const [formAccessAnalytics, setFormAccessAnalytics] = useState(false);
  const [formAccessCompany, setFormAccessCompany] = useState(false);
  const [formHours, setFormHours] = useState<BusinessHours>(defaultBusinessHours);
  const [formWhatsappTemplate, setFormWhatsappTemplate] = useState("");
  const [formRedirectLeads, setFormRedirectLeads] = useState(false);
  const [formAvailable, setFormAvailable] = useState(true);
  const [formRecessActive, setFormRecessActive] = useState(false);
  const [formRecessDays, setFormRecessDays] = useState(0);
  const [formRecessHours, setFormRecessHours] = useState(0);
  const [showImageEditor, setShowImageEditor] = useState(false);
  
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

      if (profile?.organization_id) {
        setOrgId(profile.organization_id);
        const { data: org } = await supabase
          .from("organizations")
          .select("business_model")
          .eq("id", profile.organization_id)
          .maybeSingle();
        
        if (org?.business_model === "B2C" || profile.role === "b2c_admin") {
          setIsB2C(true);
          router.push("/dashboard");
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
        `Limite atingido: seu plano permite ${sellerLimit} vendedor${sellerLimit !== 1 ? 'es' : ''}. Faça upgrade para continuar.`
      );
      return;
    }

    if (seller) {
      setSelectedSeller(seller);
      setFormEmail(seller.email || "");
      setFormPassword("");
      setFormName(seller.full_name || "");
      setFormBio(seller.bio || "");
      setFormWhatsapp(seller.whatsapp ? formatWhatsApp(seller.whatsapp) : "");
      setFormSlug(seller.slug || "");
      setFormAvatar(seller.avatar_url || null);
      setFormCanCustomize(seller.can_customize_hours || false);
      setFormAccessCatalog(seller.dash_access_catalog || false);
      setFormAccessAnalytics(seller.dash_access_analytics || false);
      setFormAccessCompany(seller.dash_access_company || false);
      setFormHours(seller.custom_business_hours || defaultBusinessHours);
      setFormWhatsappTemplate(seller.whatsapp_template || "");
      setFormRedirectLeads(seller.redirect_leads || false);
      setFormAvailable(seller.is_available ?? true);
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
      setFormPassword("");
      setFormName("");
      setFormBio("");
      setFormWhatsapp("");
      setFormSlug("");
      setFormAvatar(null);
      setFormCanCustomize(false);
      setFormAccessCatalog(false);
      setFormAccessAnalytics(false);
      setFormAccessCompany(false);
      setFormHours(defaultBusinessHours);
      setFormWhatsappTemplate("");
      setFormRedirectLeads(false);
      setFormAvailable(true);
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
    
    // Se for NOVO, primeiro criamos o usuário para pegar o ID
    if (!selectedSeller) {
      const formData = new FormData();
      formData.append("fullName", formName);
      formData.append("slug", formSlug);
      formData.append("bio", formBio);
      formData.append("whatsapp", formWhatsapp.replace(/\D/g, ""));
      formData.append("avatarUrl", formAvatar || ""); // Envia a foto se houver (mesmo blob)
      formData.append("dashAccessCatalog", String(formAccessCatalog));
      formData.append("dashAccessAnalytics", String(formAccessAnalytics));
      formData.append("dashAccessCompany", String(formAccessCompany));
      formData.append("whatsappTemplate", formWhatsappTemplate);
      formData.append("redirectLeads", String(formRedirectLeads));

      const result = await createSeller(formData);
      
      if (result.error) {
        setMessage(`Erro: ${result.error}`);
        setSaving(false);
        return;
      }

      // Agora que temos o ID, fazemos o upload da foto se houver um NOVO arquivo
      if (formAvatarFile && result.id) {
        const fileExt = formAvatarFile.name.split(".").pop();
        const filePath = `${result.id}/avatar.${fileExt}`;
        const { error: uploadError } = await supabase.storage
          .from("avatars")
          .upload(filePath, formAvatarFile, { upsert: true });

        if (!uploadError) {
          const { data: urlData } = supabase.storage.from("avatars").getPublicUrl(filePath);
          finalAvatarUrl = urlData.publicUrl;
          
          // Atualiza o perfil com a URL real via SERVER ACTION (para ignorar RLS)
          await updateSeller(result.id, { avatar_url: finalAvatarUrl });
        }
      }
    } else {
      // EDIÇÃO
      if (formAvatarFile) {
        const fileExt = formAvatarFile.name.split(".").pop();
        const filePath = `${selectedSeller.id}/avatar.${fileExt}`;
        const { error: uploadError } = await supabase.storage
          .from("avatars")
          .upload(filePath, formAvatarFile, { upsert: true });

        if (!uploadError) {
          const { data: urlData } = supabase.storage.from("avatars").getPublicUrl(filePath);
          finalAvatarUrl = urlData.publicUrl;
        }
      }

      const recessEndsAt = formRecessActive
        ? new Date(Date.now() + (formRecessDays * 24 * 60 * 60 * 1000) + (formRecessHours * 60 * 60 * 1000)).toISOString()
        : null;

      const profileData = {
        full_name: formName,
        bio: formBio,
        whatsapp: formWhatsapp.replace(/\D/g, ""),
        slug: formSlug,
        avatar_url: finalAvatarUrl,
        can_customize_hours: formCanCustomize,
        custom_business_hours: formHours,
        dash_access_catalog: formAccessCatalog,
        dash_access_analytics: formAccessAnalytics,
        dash_access_company: formAccessCompany,
        whatsapp_template: formWhatsappTemplate,
        redirect_leads: formRedirectLeads,
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
                <h1 className="text-2xl font-bold" style={{ color: "var(--dash-text-primary)" }}>Vendedores</h1>
                <p className="text-sm mt-1" style={{ color: "var(--dash-text-secondary)" }}>
                  Gerencie a ficha completa e as permissões da sua equipe.
                </p>
              </div>
              <div className="flex flex-col items-end gap-2">
                {/* Widget de Capacidade de Vendedores */}
                {sellerLimit > 0 && (
                  <div className="text-right">
                    <span className={`text-xs font-black ${sellerCount >= sellerLimit ? 'text-red-500' : 'text-emerald-500'}`}>
                      {sellerCount} / {sellerLimit} vendedores
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
                  Novo Vendedor
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
                  className="group relative flex flex-col md:flex-row items-center gap-6 p-5 rounded-[32px] border transition-all hover:shadow-xl hover:border-primary/30 cursor-pointer"
                  style={{ background: "var(--dash-surface)", borderColor: "var(--dash-border)" }}
                >
                  {/* Foto e Info Principal */}
                  <div className="flex items-center gap-4 w-full md:w-auto md:min-w-[280px] md:max-w-[300px]">
                    <div className="relative flex-shrink-0">
                      {v.avatar_url ? (
                        <img src={v.avatar_url} className="h-20 w-20 rounded-[24px] object-cover border-2 border-white shadow-md" />
                      ) : (
                        <div className="h-20 w-20 rounded-[24px] bg-primary/10 flex items-center justify-center text-primary font-bold text-2xl">
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
                        anotameucontato.com.br/{v.slug}
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
                          <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${v.is_available ? 'translate-x-6' : 'translate-x-1'}`} />
                        </button>
                      )}
                    </div>
                    
                    <div className="flex flex-col gap-2 w-full">
                      <a 
                        href={`/${v.slug}`} 
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
          <motion.div 
            key="form"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="max-w-4xl mx-auto space-y-6"
          >
            <button 
              onClick={() => setView('list')}
              className="flex items-center gap-2 text-sm font-medium text-[var(--dash-text-secondary)] hover:text-primary transition-colors"
            >
              <ChevronLeft size={18} /> Voltar para a lista
            </button>

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-3xl border shadow-sm" style={{ background: "var(--dash-surface)", borderColor: "var(--dash-border)" }}>
              <div>
                <h2 className="text-xl font-bold" style={{ color: "var(--dash-text-primary)" }}>
                  {selectedSeller ? `Editando: ${formName}` : "Nova Ficha de Vendedor"}
                </h2>
                {selectedSeller && (
                  <p className="text-xs text-[var(--dash-text-muted)] mt-1">
                    Gerencie a disponibilidade e acesse o cartão virtual do vendedor sem sair desta página.
                  </p>
                )}
              </div>

              {/* Controles de Acesso Rápido */}
              <div className="flex flex-wrap items-center gap-3">
                {/* Switch de Disponibilidade */}
                <div className="flex items-center gap-3 bg-zinc-50 dark:bg-zinc-800/20 px-4 py-2 rounded-2xl border border-[var(--dash-border)]">
                  <span className={`text-[10px] font-bold uppercase tracking-wider ${formAvailable ? 'text-emerald-500 font-extrabold' : 'text-slate-400'}`}>
                    {formAvailable ? 'Disponível' : 'Indisponível'}
                  </span>
                  <button 
                    type="button"
                    onClick={() => setFormAvailable(!formAvailable)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${formAvailable ? 'bg-emerald-500' : 'bg-slate-300'}`}
                  >
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${formAvailable ? 'translate-x-6' : 'translate-x-1'}`} />
                  </button>
                </div>

                {/* Link de Cartão Público */}
                {selectedSeller && (
                  <a 
                    href={`/${formSlug}`} 
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center justify-center gap-2 px-4 py-2 rounded-2xl bg-primary/10 text-primary text-xs font-bold hover:bg-primary/20 transition-all border border-primary/20 shadow-sm"
                  >
                    <ExternalLink size={14} /> Cartão Virtual
                  </a>
                )}
              </div>
            </div>

            {/* Ficha Completa (Igual ao Perfil) */}
            <div className="space-y-6">
              {/* Card 1: Identidade */}
              <div className="rounded-3xl border p-6 shadow-sm" style={{ background: "var(--dash-surface)", borderColor: "var(--dash-border)" }}>
                <h3 className="font-bold mb-4 flex items-center gap-2" style={{ color: "var(--dash-text-primary)" }}>
                  <Users size={18} className="text-primary" /> Identidade do Vendedor
                </h3>
                <div className="flex flex-col md:flex-row gap-8">
                  <div className="flex flex-col items-center gap-3">
                    <div 
                      className="group relative h-28 w-28 rounded-3xl border overflow-hidden bg-zinc-50 transition-all hover:border-primary/50 cursor-pointer" 
                      style={{ borderColor: "var(--dash-border)" }}
                      onClick={() => setShowImageEditor(true)}
                    >
                      {formAvatar ? (
                        <>
                          <img src={formAvatar} className="h-full w-full object-cover" />
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
                        onClick={() => setShowImageEditor(true)}
                        className="text-xs font-bold text-primary hover:underline"
                      >
                        {formAvatar ? "Alterar Foto" : "Enviar Foto"}
                      </button>
                      
                      {formAvatar && (
                        <button 
                          onClick={() => {
                            setFormAvatar(null);
                            setFormAvatarFile(null);
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
                          type="text" value={formName} onChange={e => setFormName(e.target.value)}
                          className="w-full px-4 py-2 rounded-xl border outline-none bg-[var(--dash-bg)]"
                          style={{ borderColor: "var(--dash-border)", color: "var(--dash-text-primary)" }}
                        />
                      </div>
                      <div>
                        <label className="text-xs font-bold uppercase tracking-wider text-[var(--dash-text-muted)] mb-1 flex justify-between items-center">
                          <span>Bio / Cargo</span>
                          <span className={`text-[10px] ${formBio.length >= 70 ? 'text-amber-500 font-bold' : 'text-zinc-400'}`}>
                            {formBio.length}/80
                          </span>
                        </label>
                        <textarea 
                          value={formBio} onChange={e => setFormBio(e.target.value.slice(0, 80))}
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
                      value={formWhatsapp} 
                      onChange={e => setFormWhatsapp(formatWhatsApp(e.target.value))}
                      placeholder="(00) 00000-0000"
                      className="w-full px-4 py-2 rounded-xl border outline-none bg-[var(--dash-bg)]"
                      style={{ borderColor: "var(--dash-border)", color: "var(--dash-text-primary)" }}
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold uppercase tracking-wider text-[var(--dash-text-muted)] mb-1 block">Link do Cartão (Slug)</label>
                    <input 
                      type="text" value={formSlug} onChange={e => setFormSlug(e.target.value.toLowerCase().replace(/\s+/g, '-'))}
                      placeholder="ex: nome_do_vendedor"
                      className="w-full px-4 py-2 rounded-xl border outline-none bg-[var(--dash-bg)]"
                      style={{ borderColor: "var(--dash-border)", color: "var(--dash-text-primary)" }}
                    />
                    {formSlug && (
                      <p className="mt-2 text-[10px] font-medium text-primary/60 truncate">
                        Link: <span className="font-bold">anotameucontato.com.br/{formSlug}</span>
                      </p>
                    )}
                  </div>
                </div>

                <div className="mt-6 border-t pt-6" style={{ borderColor: "var(--dash-border)" }}>
                  <label className="text-xs font-bold uppercase tracking-wider text-[var(--dash-text-muted)] mb-2 block">
                    Modelo de Mensagem (WhatsApp)
                  </label>
                  <textarea 
                    value={formWhatsappTemplate} 
                    onChange={e => setFormWhatsappTemplate(e.target.value)}
                    placeholder="Ex: Olá! Vi o item {item_nome} no valor de {item_preco} e tenho interesse."
                    rows={3}
                    className="w-full px-4 py-3 rounded-xl border outline-none bg-[var(--dash-bg)] text-sm"
                    style={{ borderColor: "var(--dash-border)", color: "var(--dash-text-primary)" }}
                  />
                  <div className="mt-2 flex flex-wrap gap-2">
                    {['{nome}', '{preco}', '{sku}', '{link}', '{tipo}', '{vendedor}'].map(tag => (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => setFormWhatsappTemplate(prev => prev + tag)}
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
                  <label className={`flex items-start gap-3 p-4 rounded-2xl border cursor-pointer transition-all ${formRedirectLeads ? 'border-primary bg-primary/5' : 'border-[var(--dash-border)] bg-[var(--dash-bg)]'}`}>
                    <div className="mt-0.5">
                      <input 
                        type="checkbox" 
                        checked={formRedirectLeads} 
                        onChange={e => setFormRedirectLeads(e.target.checked)} 
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
                  
                  <label className={`flex items-start gap-3 p-4 rounded-2xl border cursor-pointer transition-all ${formRecessActive ? 'border-purple-500 bg-purple-500/5' : 'border-[var(--dash-border)] bg-[var(--dash-bg)]'}`}>
                    <div className="mt-0.5">
                      <input 
                        type="checkbox" 
                        checked={formRecessActive} 
                        onChange={e => {
                          const val = e.target.checked;
                          setFormRecessActive(val);
                          if (val) {
                            setFormRedirectLeads(true);
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

                  {formRecessActive && (
                    <div className="mt-4 p-4 rounded-2xl bg-zinc-50/50 dark:bg-zinc-800/20 border border-[var(--dash-border)] space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-[10px] font-bold uppercase tracking-wider text-[var(--dash-text-muted)] mb-1 block">Dias de Recesso</label>
                          <input 
                            type="number" 
                            min="0"
                            max="365"
                            value={formRecessDays} 
                            onChange={e => setFormRecessDays(Math.max(0, parseInt(e.target.value) || 0))}
                            className="w-full px-3 py-1.5 rounded-xl border outline-none bg-[var(--dash-bg)] text-xs text-center font-semibold"
                            style={{ borderColor: "var(--dash-border)", color: "var(--dash-text-primary)" }}
                          />
                        </div>
                        <div>
                          <label className="text-[10px] font-bold uppercase tracking-wider text-[var(--dash-text-muted)] mb-1 block">Horas de Recesso</label>
                          <input 
                            type="number" 
                            min="0"
                            max="23"
                            value={formRecessHours} 
                            onChange={e => setFormRecessHours(Math.max(0, Math.min(23, parseInt(e.target.value) || 0)))}
                            className="w-full px-3 py-1.5 rounded-xl border outline-none bg-[var(--dash-bg)] text-xs text-center font-semibold"
                            style={{ borderColor: "var(--dash-border)", color: "var(--dash-text-primary)" }}
                          />
                        </div>
                      </div>
                      
                      <div className="text-[10px] bg-purple-500/10 border border-purple-500/20 rounded-xl p-3 text-purple-600 dark:text-purple-400 leading-relaxed">
                        <p className="font-semibold flex items-center gap-1">
                          <Info size={12} />
                          {formRecessDays === 0 && formRecessHours === 0 ? (
                            <span>Defina a duração para calcular a data final.</span>
                          ) : (
                            <span>
                              Terminará em: <strong className="underline">
                                {new Date(Date.now() + (formRecessDays * 24 * 60 * 60 * 1000) + (formRecessHours * 60 * 60 * 1000)).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' })}
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
                  onClick={() => setShowHoursConfig(!showHoursConfig)}
                  className="w-full flex items-center justify-between p-6 hover:bg-zinc-50/50 transition-colors"
                >
                  <h3 className="font-bold flex items-center gap-2" style={{ color: "var(--dash-text-primary)" }}>
                    <ShieldCheck size={18} className="text-primary" /> Nível de Acesso e Horário
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
                        {/* Gestão de Permissões (Delegated Access) */}
                        <div className="pt-6 space-y-4">
                          <p className="text-xs font-bold uppercase tracking-widest text-[var(--dash-text-muted)] mb-4">Módulos que este vendedor pode acessar:</p>
                          
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <label 
                              className={`flex items-start gap-3 p-4 rounded-2xl border cursor-pointer transition-all ${formAccessCatalog ? 'border-primary bg-primary/5' : 'border-[var(--dash-border)] bg-[var(--dash-bg)]'}`}
                            >
                              <div className="mt-0.5">
                                <input type="checkbox" checked={formAccessCatalog} onChange={e => setFormAccessCatalog(e.target.checked)} className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary" />
                              </div>
                              <div>
                                <div className="flex items-center gap-2 mb-1">
                                  <Package size={14} className={formAccessCatalog ? 'text-primary' : 'text-zinc-400'} />
                                  <span className="text-xs font-bold" style={{ color: "var(--dash-text-primary)" }}>Catálogo</span>
                                </div>
                                <p className="text-[10px] leading-tight text-[var(--dash-text-muted)]">Pode gerenciar produtos, categorias e preços.</p>
                              </div>
                            </label>

                            <label 
                              className={`flex items-start gap-3 p-4 rounded-2xl border cursor-pointer transition-all ${formAccessAnalytics ? 'border-primary bg-primary/5' : 'border-[var(--dash-border)] bg-[var(--dash-bg)]'}`}
                            >
                              <div className="mt-0.5">
                                <input type="checkbox" checked={formAccessAnalytics} onChange={e => setFormAccessAnalytics(e.target.checked)} className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary" />
                              </div>
                              <div>
                                <div className="flex items-center gap-2 mb-1">
                                  <BarChart3 size={14} className={formAccessAnalytics ? 'text-primary' : 'text-zinc-400'} />
                                  <span className="text-xs font-bold" style={{ color: "var(--dash-text-primary)" }}>Analytics</span>
                                </div>
                                <p className="text-[10px] leading-tight text-[var(--dash-text-muted)]">Ver métricas de acessos e performance da empresa.</p>
                              </div>
                            </label>

                            <label 
                              className={`flex items-start gap-3 p-4 rounded-2xl border cursor-pointer transition-all ${formAccessCompany ? 'border-primary bg-primary/5' : 'border-[var(--dash-border)] bg-[var(--dash-bg)]'}`}
                            >
                              <div className="mt-0.5">
                                <input type="checkbox" checked={formAccessCompany} onChange={e => setFormAccessCompany(e.target.checked)} className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary" />
                              </div>
                              <div>
                                <div className="flex items-center gap-2 mb-1">
                                  <Settings size={14} className={formAccessCompany ? 'text-primary' : 'text-zinc-400'} />
                                  <span className="text-xs font-bold" style={{ color: "var(--dash-text-primary)" }}>Empresa</span>
                                </div>
                                <p className="text-[10px] leading-tight text-[var(--dash-text-muted)]">Editar logotipo, cores e dados corporativos.</p>
                              </div>
                            </label>
                          </div>
                        </div>

                        <div className="pt-4 space-y-4 border-t" style={{ borderColor: "var(--dash-border)" }}>
                          <p className="text-xs font-bold uppercase tracking-widest text-[var(--dash-text-muted)]">Horário de Atendimento:</p>
                          <div className="flex items-center gap-2 mb-4">
                            <input type="checkbox" checked={formCanCustomize} onChange={e => setFormCanCustomize(e.target.checked)} id="can_customize" className="h-4 w-4" />
                            <label htmlFor="can_customize" className="text-xs font-medium" style={{ color: "var(--dash-text-secondary)" }}>Permitir que este vendedor personalize seu próprio horário</label>
                          </div>
                          {(Object.keys(dayNamesMap) as Array<keyof typeof dayNamesMap>).map((day) => {
                            const dayData = formHours.schedule[day];
                            return (
                              <div key={day} className="flex flex-col sm:flex-row sm:items-start gap-4 border-b pb-4 last:border-0 last:pb-0" style={{ borderColor: "var(--dash-border)" }}>
                                <div className="w-32 flex items-center gap-2">
                                  <input type="checkbox" checked={dayData.isOpen} onChange={() => handleDayToggle(day)} className="h-4 w-4" />
                                  <span className="text-sm font-medium" style={{ color: dayData.isOpen ? "var(--dash-text-primary)" : "var(--dash-text-muted)" }}>{dayNamesMap[day]}</span>
                                </div>
                                <div className="flex-1 flex flex-wrap gap-2">
                                  {dayData.isOpen && dayData.shifts.map((shift, idx) => (
                                    <div key={idx} className="flex items-center gap-2">
                                      <input 
                                        type="time" value={shift.open} onChange={e => handleShiftChange(day, idx, "open", e.target.value)}
                                        className="px-2 py-1 rounded-lg border text-xs" style={{ background: "var(--dash-bg)", borderColor: "var(--dash-border)" }}
                                      />
                                      <span className="text-[10px]">até</span>
                                      <input 
                                        type="time" value={shift.close} onChange={e => handleShiftChange(day, idx, "close", e.target.value)}
                                        className="px-2 py-1 rounded-lg border text-xs" style={{ background: "var(--dash-bg)", borderColor: "var(--dash-border)" }}
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

              <div className="flex items-center justify-between border-t pt-6" style={{ borderColor: "var(--dash-border)" }}>
                <div className="flex items-center gap-4">
                  <button 
                    onClick={handleSave} 
                    disabled={saving || !isFormValid}
                    className={`px-8 py-3 rounded-2xl font-bold transition-all shadow-xl active:scale-95 ${
                      saving || !isFormValid 
                      ? "bg-zinc-200 text-zinc-400 cursor-not-allowed shadow-none" 
                      : "bg-zinc-900 text-white hover:scale-105 shadow-primary/20"
                    }`}
                  >
                    {saving ? "Salvando..." : "Salvar Ficha do Vendedor"}
                  </button>
                  {message && (
                    <div className={`flex items-center gap-2 px-4 py-2 rounded-xl border ${
                      message.toLowerCase().includes("erro") || 
                      message.toLowerCase().includes("negada") || 
                      message.toLowerCase().includes("banco") 
                      ? "bg-red-500/10 border-red-500/20 text-red-500" 
                      : "bg-emerald-500/10 border-emerald-500/20 text-emerald-600"
                    }`}>
                      {message.toLowerCase().includes("erro") || 
                       message.toLowerCase().includes("negada") || 
                       message.toLowerCase().includes("banco") 
                        ? <X size={16} /> 
                        : <CheckCircle2 size={16} />
                      }
                      <span className="text-sm font-bold">{message}</span>
                    </div>
                  )}
                </div>

                {selectedSeller && selectedSeller.status !== 'terminated' && (
                  <div className="relative">
                    {!showTerminateConfirm ? (
                      <button 
                        onClick={() => setShowTerminateConfirm(true)}
                        className="px-6 py-3 rounded-2xl font-bold transition-all border border-red-500/30 text-red-500 hover:bg-red-500/10 flex items-center gap-2"
                      >
                        <Trash2 size={18} /> Desligar Vendedor
                      </button>
                    ) : (
                      <div className="flex items-center gap-3 bg-red-50 dark:bg-red-950/30 p-2 rounded-2xl border border-red-200 dark:border-red-900 absolute right-0 bottom-0 whitespace-nowrap z-10 shadow-2xl">
                        <span className="text-xs font-bold text-red-600 dark:text-red-400 px-2">
                          Desligar permanentemente? Os dados pessoais serão removidos.
                        </span>
                        <button 
                          onClick={handleTerminate}
                          disabled={terminating}
                          className="px-4 py-2 bg-red-600 text-white text-xs font-bold rounded-xl hover:bg-red-700 disabled:opacity-50"
                        >
                          {terminating ? "Desligando..." : "Confirmar"}
                        </button>
                        <button 
                          onClick={() => setShowTerminateConfirm(false)}
                          className="px-4 py-2 bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 text-xs font-bold rounded-xl hover:bg-zinc-300 dark:hover:bg-zinc-700"
                        >
                          Cancelar
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <ImageEditorModal
        isOpen={showImageEditor}
        onClose={() => setShowImageEditor(false)}
        onConfirm={(file) => { setFormAvatarFile(file); setFormAvatar(URL.createObjectURL(file)); }}
        aspectRatio={1}
      />
    </div>
  );
}
