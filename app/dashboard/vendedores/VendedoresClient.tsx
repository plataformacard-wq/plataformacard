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
  AlertCircle
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

export default function VendedoresClient() {
  const supabase = createClient();
  const [loading, setLoading] = useState(true);
  const [vendedores, setVendedores] = useState<Seller[]>([]);
  const [orgId, setOrgId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isB2C, setIsB2C] = useState(false);
  const router = useRouter(); // Import useRouter if not present
  
  // View State: 'list' | 'form'
  const [view, setView] = useState<'list' | 'form'>('list');
  const [selectedSeller, setSelectedSeller] = useState<Seller | null>(null);
  
  // Form State (Ficha completa igual ao perfil)
  const [formEmail, setFormEmail] = useState("");
  const [formName, setFormName] = useState("");
  const [formBio, setFormBio] = useState("");
  const [formWhatsapp, setFormWhatsapp] = useState("");
  const [formSlug, setFormSlug] = useState("");
  const [formAvatar, setFormAvatar] = useState<string | null>(null);
  const [formAvatarFile, setFormAvatarFile] = useState<File | null>(null);
  const [formCanCustomize, setFormCanCustomize] = useState(false);
  const [formHours, setFormHours] = useState<BusinessHours>(defaultBusinessHours);
  const [showImageEditor, setShowImageEditor] = useState(false);
  
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data: profile } = await supabase
      .from("profiles")
      .select("organization_id")
      .eq("id", user.id)
      .single();

    if (profile?.organization_id) {
      setOrgId(profile.organization_id);
      
      const { data: sellers } = await supabase
        .from("profiles")
        .select("*")
        .eq("organization_id", profile.organization_id)
        .eq("role", "seller")
        .order("full_name");

      if (sellers) setVendedores(sellers as Seller[]);

      // Verificar se é B2C para bloquear acesso à página
      const { data: org } = await supabase
        .from("organizations")
        .select("business_model")
        .eq("id", profile.organization_id)
        .maybeSingle();
      
      if (org?.business_model === "B2C" || profile.role === "b2c_admin") {
        setIsB2C(true);
        // Redirecionar após um pequeno delay ou imediatamente
        router.push("/dashboard");
      }
    }
    setLoading(false);
  }

  function handleOpenForm(seller?: Seller) {
    if (seller) {
      setSelectedSeller(seller);
      setFormEmail(seller.email || "");
      setFormName(seller.full_name || "");
      setFormBio(seller.bio || "");
      setFormWhatsapp(seller.whatsapp || "");
      setFormSlug(seller.slug || "");
      setFormAvatar(seller.avatar_url);
      setFormCanCustomize(seller.can_customize_hours || false);
      setFormHours(seller.custom_business_hours || defaultBusinessHours);
    } else {
      setSelectedSeller(null);
      setFormEmail("");
      setFormName("");
      setFormBio("");
      setFormWhatsapp("");
      setFormSlug("");
      setFormAvatar(null);
      setFormCanCustomize(false);
      setFormHours(defaultBusinessHours);
    }
    setView('form');
  }

  async function handleSave() {
    if (!orgId || !formName) {
      setMessage("O nome é obrigatório.");
      return;
    }
    setSaving(true);
    
    // Se for um novo vendedor, em um cenário real precisaríamos criar o Auth User.
    // Como estamos focando no cadastro de perfil, vamos simular ou atualizar se já existir.
    
    let finalAvatarUrl = formAvatar;
    if (formAvatarFile && selectedSeller) {
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

    const profileData = {
      full_name: formName,
      bio: formBio,
      whatsapp: formWhatsapp,
      slug: formSlug,
      avatar_url: finalAvatarUrl,
      can_customize_hours: formCanCustomize,
      custom_business_hours: formHours,
      organization_id: orgId,
      role: 'seller'
    };

    let error;
    if (selectedSeller) {
      const { error: err } = await supabase
        .from("profiles")
        .update(profileData)
        .eq("id", selectedSeller.id);
      error = err;
    } else {
      // Para novo, precisaríamos do user_id do Auth. 
      // Mostraremos um alerta de que o convite deve ser enviado.
      alert("Para criar um NOVO vendedor, o sistema enviará um convite por e-mail (Simulado).");
      setSaving(false);
      setView('list');
      return;
    }

    if (error) {
      setMessage("Erro ao salvar dados.");
    } else {
      setMessage("Dados salvos com sucesso!");
      setTimeout(() => {
        setView('list');
        fetchData();
      }, 1500);
    }
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
              <button 
                onClick={() => handleOpenForm()}
                className="flex items-center justify-center gap-2 rounded-xl px-5 py-2.5 text-sm font-bold shadow-lg shadow-black/5 hover:scale-[1.02] active:scale-[0.98] transition-all"
                style={{ background: "var(--dash-text-primary)", color: "var(--dash-bg)" }}
              >
                <UserPlus size={18} />
                Novo Vendedor
              </button>
            </div>

            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--dash-text-muted)]" size={18} />
              <input 
                type="text"
                placeholder="Buscar por nome ou e-mail..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 rounded-2xl border outline-none"
                style={{ background: "var(--dash-surface)", borderColor: "var(--dash-border)", color: "var(--dash-text-primary)" }}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {vendedores.map(v => (
                <div 
                  key={v.id} 
                  onClick={() => handleOpenForm(v)}
                  className="group cursor-pointer rounded-3xl border p-5 transition-all hover:shadow-md hover:border-primary/30"
                  style={{ background: "var(--dash-surface)", borderColor: "var(--dash-border)" }}
                >
                  <div className="flex items-center gap-4">
                    {v.avatar_url ? (
                      <img src={v.avatar_url} className="h-14 w-14 rounded-2xl object-cover border" style={{ borderColor: "var(--dash-border)" }} />
                    ) : (
                      <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary font-bold text-xl">
                        {v.full_name?.charAt(0) || "V"}
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="font-bold truncate text-[var(--dash-text-primary)]">{v.full_name || "Sem nome"}</p>
                      <p className="text-xs text-[var(--dash-text-muted)] truncate">{v.email}</p>
                    </div>
                  </div>
                  <div className="mt-4 pt-4 border-t flex items-center justify-between" style={{ borderColor: "var(--dash-border)" }}>
                    <div className="flex items-center gap-2">
                      <Clock size={14} className={v.can_customize_hours ? "text-green-500" : "text-zinc-400"} />
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--dash-text-muted)]">
                        {v.can_customize_hours ? "Horário Livre" : "Horário Fixo"}
                      </span>
                    </div>
                    <span className="text-xs font-medium text-primary opacity-0 group-hover:opacity-100 transition-opacity">Editar Ficha →</span>
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

            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold" style={{ color: "var(--dash-text-primary)" }}>
                {selectedSeller ? `Editando: ${formName}` : "Nova Ficha de Vendedor"}
              </h2>
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
                    <div className="h-24 w-24 rounded-3xl border overflow-hidden bg-zinc-50" style={{ borderColor: "var(--dash-border)" }}>
                      {formAvatar ? <img src={formAvatar} className="h-full w-full object-cover" /> : <div className="h-full w-full flex items-center justify-center text-zinc-300"><Upload size={32} /></div>}
                    </div>
                    <button 
                      onClick={() => setShowImageEditor(true)}
                      className="text-xs font-bold text-primary hover:underline"
                    >
                      Alterar Foto
                    </button>
                  </div>
                  <div className="flex-1 space-y-4">
                    <div>
                      <label className="text-xs font-bold uppercase tracking-wider text-[var(--dash-text-muted)] mb-1 block">Nome do Vendedor</label>
                      <input 
                        type="text" value={formName} onChange={e => setFormName(e.target.value)}
                        className="w-full px-4 py-2 rounded-xl border outline-none bg-[var(--dash-bg)]"
                        style={{ borderColor: "var(--dash-border)", color: "var(--dash-text-primary)" }}
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold uppercase tracking-wider text-[var(--dash-text-muted)] mb-1 block">Bio / Cargo</label>
                      <input 
                        type="text" value={formBio} onChange={e => setFormBio(e.target.value)}
                        placeholder="Ex: Especialista em Mobilidade"
                        className="w-full px-4 py-2 rounded-xl border outline-none bg-[var(--dash-bg)]"
                        style={{ borderColor: "var(--dash-border)", color: "var(--dash-text-primary)" }}
                      />
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
                      type="tel" value={formWhatsapp} onChange={e => setFormWhatsapp(e.target.value)}
                      className="w-full px-4 py-2 rounded-xl border outline-none bg-[var(--dash-bg)]"
                      style={{ borderColor: "var(--dash-border)", color: "var(--dash-text-primary)" }}
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold uppercase tracking-wider text-[var(--dash-text-muted)] mb-1 block">Link do Cartão (Slug)</label>
                    <input 
                      type="text" value={formSlug} onChange={e => setFormSlug(e.target.value)}
                      className="w-full px-4 py-2 rounded-xl border outline-none bg-[var(--dash-bg)]"
                      style={{ borderColor: "var(--dash-border)", color: "var(--dash-text-primary)" }}
                    />
                  </div>
                </div>
              </div>

              {/* Card 3: Permissões e Horários */}
              <div className="rounded-3xl border p-6 shadow-sm" style={{ background: "var(--dash-surface)", borderColor: "var(--dash-border)" }}>
                <div className="flex items-center justify-between mb-6">
                  <h3 className="font-bold flex items-center gap-2" style={{ color: "var(--dash-text-primary)" }}>
                    <Clock size={18} className="text-primary" /> Horário e Permissões
                  </h3>
                </div>

                <div className="space-y-4">
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

              <div className="flex items-center gap-4">
                <button 
                  onClick={handleSave} disabled={saving}
                  className="px-8 py-3 rounded-2xl font-bold text-white shadow-xl shadow-primary/20 transition-all hover:scale-105 active:scale-95 disabled:opacity-50"
                  style={{ background: "var(--dash-text-primary)" }}
                >
                  {saving ? "Salvando..." : "Salvar Ficha do Vendedor"}
                </button>
                {message && <span className="text-sm font-medium text-green-600 flex items-center gap-1"><CheckCircle2 size={16} /> {message}</span>}
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
