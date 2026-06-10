"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { 
  X, 
  Sparkles, 
  Upload, 
  Trash2, 
  Info,
  ChevronLeft,
  Save,
  CheckCircle2,
  Globe,
  Loader2,
  Image as ImageIcon
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { generateSEOWithAI } from "@/lib/ai-actions";
import ImageEditorModal from "@/components/dashboard/ImageEditorModal";

export default function SEOPage() {
  const supabase = createClient();
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: "success" | "error" | "info" } | null>(null);
  const [orgId, setOrgId] = useState<string | null>(null);
  const [orgName, setOrgName] = useState("");
  const [orgSlug, setOrgSlug] = useState("seulink.com");
  const [businessModel, setBusinessModel] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    meta_title: "",
    meta_description: "",
    meta_keywords: "",
    favicon_url: "",
    logo_url: "",
    og_image_url: "",
    centralize_leads: false,
    whatsapp: "",
  });
  const [faviconFile, setFaviconFile] = useState<File | null>(null);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [bannerFile, setBannerFile] = useState<File | null>(null);
  const [activeUploadType, setActiveUploadType] = useState<"favicon" | "logo" | "banner">("favicon");
  const [showImageEditor, setShowImageEditor] = useState(false);

  useEffect(() => {
    async function loadData() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data: profile } = await supabase
          .from("profiles")
          .select("organization_id, role")
          .eq("user_id", user.id)
          .maybeSingle();

        const shadowOrgId = document.cookie
          .split("; ")
          .find((row) => row.startsWith("shadow_org_id="))
          ?.split("=")[1];

        const isSuperAdmin = profile?.role === "superadmin";
        const activeOrgId = (isSuperAdmin && shadowOrgId) ? shadowOrgId : profile?.organization_id;

        if (activeOrgId) {
          setOrgId(activeOrgId);
          const { data: org } = await supabase
            .from("organizations")
            .select("*")
            .eq("id", activeOrgId)
            .maybeSingle();
          
          if (org) {
            setOrgName(org.name || "");
            setOrgSlug(org.slug || "seulink.com");
            setBusinessModel(org.business_model || "B2C");
            setFormData({
              meta_title: org.meta_title || "",
              meta_description: org.meta_description || "",
              meta_keywords: org.meta_keywords || "",
              favicon_url: org.favicon_url || "",
              logo_url: org.logo_url || "",
              og_image_url: org.og_image_url || "",
              centralize_leads: !!org.centralize_leads,
              whatsapp: org.whatsapp || "",
            });
          }
        }
      } catch (err) {
        console.error("Erro ao carregar dados:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [supabase]);

  async function handleGenerateAI() {
    if (!orgName) return;
    setGenerating(true);
    setMessage(null);

    const result = await generateSEOWithAI(orgName);

    if (result.error) {
      setMessage({ text: result.error, type: "error" });
    } else if (result.data) {
      setFormData({
        ...formData,
        meta_title: result.data.title,
        meta_description: result.data.description,
        meta_keywords: result.data.keywords
      });
      setMessage({ text: "IA gerou sugestões com sucesso!", type: "success" });
      setTimeout(() => setMessage(null), 5000);
    }
    setGenerating(false);
  }

  async function handleSave() {
    if (!orgId) return;
    setSaving(true);
    setMessage(null);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setMessage({ text: "Usuário não autenticado.", type: "error" });
      setSaving(false);
      return;
    }

    let newFaviconUrl = formData.favicon_url;
    if (faviconFile) {
      const fileExt = faviconFile.name.split(".").pop();
      const filePath = `favicon-${orgId}.${fileExt}`;
      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(filePath, faviconFile, { upsert: true });

      if (uploadError) {
        setMessage({ text: `Erro no favicon: ${uploadError.message}`, type: "error" });
        setSaving(false);
        return;
      }
      const { data: urlData } = supabase.storage.from("avatars").getPublicUrl(filePath);
      newFaviconUrl = urlData.publicUrl;
    }

    let newLogoUrl = formData.logo_url;
    if (logoFile) {
      const fileExt = logoFile.name.split(".").pop();
      const filePath = `logo-${orgId}.${fileExt}`;
      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(filePath, logoFile, { upsert: true });

      if (uploadError) {
        setMessage({ text: `Erro no logotipo: ${uploadError.message}`, type: "error" });
        setSaving(false);
        return;
      }
      const { data: urlData } = supabase.storage.from("avatars").getPublicUrl(filePath);
      newLogoUrl = urlData.publicUrl;
    }

    let newOgImageUrl = formData.og_image_url;
    if (bannerFile) {
      const fileExt = bannerFile.name.split(".").pop();
      const filePath = `og-image-${orgId}.${fileExt}`;
      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(filePath, bannerFile, { upsert: true });

      if (uploadError) {
        setMessage({ text: `Erro no banner: ${uploadError.message}`, type: "error" });
        setSaving(false);
        return;
      }
      const { data: urlData } = supabase.storage.from("avatars").getPublicUrl(filePath);
      newOgImageUrl = urlData.publicUrl;
    }

    const { error } = await supabase
      .from("organizations")
      .update({
        meta_title: formData.meta_title,
        meta_description: formData.meta_description,
        meta_keywords: formData.meta_keywords,
        favicon_url: newFaviconUrl,
        logo_url: newLogoUrl,
        og_image_url: newOgImageUrl,
        centralize_leads: formData.centralize_leads,
        whatsapp: formData.whatsapp,
      })
      .eq("id", orgId);

    if (error) {
      setMessage({ text: `Erro ao salvar: ${error.message}`, type: "error" });
    } else {
      const timestamp = Date.now();
      const getFinalUrl = (url: string | null) => {
        if (!url) return null;
        const baseUrl = url.split('?')[0];
        return `${baseUrl}?t=${timestamp}`;
      };

      setFormData({ 
        ...formData, 
        favicon_url: getFinalUrl(newFaviconUrl) || "", 
        logo_url: getFinalUrl(newLogoUrl) || "", 
        og_image_url: getFinalUrl(newOgImageUrl) || "" 
      });
      setFaviconFile(null);
      setLogoFile(null);
      setBannerFile(null);
      setMessage({ text: "Configurações salvas com sucesso!", type: "success" });
      setTimeout(() => setMessage(null), 3000);
    }
    setSaving(false);
  }

  function onImageEditorConfirm(file: File) {
    if (activeUploadType === "favicon") {
      setFaviconFile(file);
      setFormData({ ...formData, favicon_url: URL.createObjectURL(file) });
    } else if (activeUploadType === "logo") {
      setLogoFile(file);
      setFormData({ ...formData, logo_url: URL.createObjectURL(file) });
    } else if (activeUploadType === "banner") {
      setBannerFile(file);
      setFormData({ ...formData, og_image_url: URL.createObjectURL(file) });
    }
  }

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto rounded-3xl shadow-sm border overflow-hidden" style={{ background: "var(--dash-surface)", borderColor: "var(--dash-border)" }}>
      {/* Header */}
      <div className="px-6 py-4 border-b flex items-center justify-between" style={{ borderColor: "var(--dash-border)" }}>
        <h1 className="text-lg font-bold" style={{ color: "var(--dash-text-primary)" }}>Configurações de SEO e Marca</h1>
        <button className="p-1 rounded-full transition-colors" style={{ color: "var(--dash-text-secondary)" }}>
          <X size={20} />
        </button>
      </div>

      <div className="p-6 space-y-10">
        
        {/* 01 - IA Generator */}
        <section className="space-y-4">
          <h2 className="text-sm font-bold uppercase tracking-wider" style={{ color: "var(--dash-text-secondary)" }}>Assistente Inteligente</h2>
          <div className="border rounded-2xl p-5 space-y-4" style={{ background: "var(--dash-input-bg)", borderColor: "var(--dash-border)" }}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-emerald-500/10">
                  <Sparkles size={20} className="text-emerald-500" />
                </div>
                <div>
                  <span className="text-sm font-bold block" style={{ color: "var(--dash-text-primary)" }}>Gerador SEO Automático</span>
                  <span className="text-[10px]" style={{ color: "var(--dash-text-muted)" }}>Sugerir títulos e descrições com IA</span>
                </div>
              </div>
              <button 
                onClick={handleGenerateAI}
                disabled={generating}
                className="px-6 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 disabled:opacity-50 hover:scale-105 active:scale-95"
                style={{ background: "var(--dash-text-primary)", color: "var(--dash-surface)" }}
              >
                {generating ? <Loader2 size={16} className="animate-spin" /> : <><Sparkles size={14} /> Gerar Sugestões</>}
              </button>
            </div>
          </div>
        </section>

        {/* 02 - Conteúdo SEO */}
        <section className="space-y-6">
          <h2 className="text-sm font-bold uppercase tracking-wider" style={{ color: "var(--dash-text-secondary)" }}>01. Conteúdo da Página</h2>
          
          <div className="space-y-4">
            <div>
              <label className="text-xs font-medium mb-1.5 flex items-center gap-1.5" style={{ color: "var(--dash-text-secondary)" }}>
                Título da página (Google) <span className="text-red-500">*</span>
              </label>
              <input 
                type="text" 
                value={formData.meta_title}
                onChange={e => setFormData({ ...formData, meta_title: e.target.value })}
                placeholder="Ex: Maj Mobilidade - Atacado"
                className="w-full px-4 py-3 rounded-xl border outline-none text-sm transition-all"
                style={{ background: "var(--dash-input-bg)", borderColor: "var(--dash-border)", color: "var(--dash-text-primary)" }}
              />
            </div>

            <div>
              <label className="text-xs font-medium mb-1.5 flex items-center gap-1.5" style={{ color: "var(--dash-text-secondary)" }}>
                Descrição SEO
              </label>
              <textarea 
                value={formData.meta_description}
                onChange={e => setFormData({ ...formData, meta_description: e.target.value.slice(0, 320) })}
                placeholder="Descreva seu negócio para os resultados de busca..."
                rows={3}
                className="w-full px-4 py-3 rounded-xl border outline-none text-sm transition-all resize-none"
                style={{ background: "var(--dash-input-bg)", borderColor: "var(--dash-border)", color: "var(--dash-text-primary)" }}
              />
            </div>

            <div>
              <label className="text-xs font-medium mb-1.5" style={{ color: "var(--dash-text-secondary)" }}>Palavras-chave (Tags)</label>
              <input 
                type="text" 
                value={formData.meta_keywords}
                onChange={e => setFormData({ ...formData, meta_keywords: e.target.value })}
                placeholder="#atacado #bike #mobilidade"
                className="w-full px-4 py-3 rounded-xl border outline-none text-sm transition-all"
                style={{ background: "var(--dash-input-bg)", borderColor: "var(--dash-border)", color: "var(--dash-text-primary)" }}
              />
            </div>
          </div>
        </section>

        {/* 03 - Ativos de Marca */}
        <section className="space-y-6">
          <h2 className="text-sm font-bold uppercase tracking-wider" style={{ color: "var(--dash-text-secondary)" }}>02. Identidade e Logos</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Favicon */}
            <div className="space-y-3">
              <label className="text-xs font-bold" style={{ color: "var(--dash-text-secondary)" }}>Favicon (Ícone da Aba)</label>
              <div className="h-32 border-2 border-dashed rounded-2xl flex flex-col items-center justify-center gap-2 relative group cursor-pointer transition-all hover:bg-zinc-500/5"
                   style={{ borderColor: "var(--dash-border)", background: "var(--dash-input-bg)" }}
                   onClick={() => { setActiveUploadType("favicon"); setShowImageEditor(true); }}>
                {formData.favicon_url ? (
                  <img src={formData.favicon_url} className="w-12 h-12 object-contain" />
                ) : (
                  <Globe size={24} style={{ color: "var(--dash-text-muted)" }} />
                )}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center rounded-2xl transition-opacity">
                  <Upload size={20} className="text-white" />
                </div>
              </div>
            </div>

            {/* Logo */}
            <div className="space-y-3">
              <label className="text-xs font-bold" style={{ color: "var(--dash-text-secondary)" }}>Logotipo Principal</label>
              <div className="h-32 border-2 border-dashed rounded-2xl flex flex-col items-center justify-center gap-2 relative group cursor-pointer transition-all hover:bg-zinc-500/5"
                   style={{ borderColor: "var(--dash-border)", background: "var(--dash-input-bg)" }}
                   onClick={() => { setActiveUploadType("logo"); setShowImageEditor(true); }}>
                {formData.logo_url ? (
                  <img src={formData.logo_url} className="max-w-[80%] max-h-[60%] object-contain" />
                ) : (
                  <Upload size={24} style={{ color: "var(--dash-text-muted)" }} />
                )}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center rounded-2xl transition-opacity">
                  <Upload size={20} className="text-white" />
                </div>
              </div>
            </div>
          </div>

          {/* Banner SEO */}
          <div className="space-y-3">
            <label className="text-xs font-bold" style={{ color: "var(--dash-text-secondary)" }}>Banner de Compartilhamento (Redes Sociais)</label>
            <div className="h-40 border-2 border-dashed rounded-2xl flex flex-col items-center justify-center gap-2 relative group cursor-pointer transition-all hover:bg-zinc-500/5 overflow-hidden"
                 style={{ borderColor: "var(--dash-border)", background: "var(--dash-input-bg)" }}
                 onClick={() => { setActiveUploadType("banner"); setShowImageEditor(true); }}>
              {formData.og_image_url ? (
                <img src={formData.og_image_url} className="w-full h-full object-contain p-2" />
              ) : (
                <ImageIcon size={32} style={{ color: "var(--dash-text-muted)" }} />
              )}
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                <Upload size={24} className="text-white" />
              </div>
            </div>
          </div>
        </section>

        {/* 04 - Configurações de Leads (CRM) */}
        {businessModel === "B2B" && (
          <section className="space-y-6">
            <h2 className="text-sm font-bold uppercase tracking-wider" style={{ color: "var(--dash-text-secondary)" }}>03. Configurações de Leads (CRM)</h2>
            
            <div className="p-5 rounded-2xl border transition-all" style={{ background: "var(--dash-input-bg)", borderColor: "var(--dash-border)" }}>
              <div className="flex items-center justify-between">
                <div className="flex gap-3">
                  <div className={`mt-1 p-2 rounded-lg ${formData.centralize_leads ? "bg-emerald-500/10 text-emerald-600" : "bg-blue-500/10 text-blue-600"}`}>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={formData.centralize_leads ? "M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" : "M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"} />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-bold" style={{ color: "var(--dash-text-primary)" }}>
                      Centralizar Leads no WhatsApp da Empresa (CRM)
                    </p>
                    <p className="text-xs mt-0.5" style={{ color: "var(--dash-text-secondary)" }}>
                      {formData.centralize_leads 
                        ? "Leads serão enviados ao WhatsApp central com tag para transbordo no CRM." 
                        : "Leads serão enviados diretamente para o WhatsApp do vendedor."}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setFormData({ ...formData, centralize_leads: !formData.centralize_leads })}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
                    formData.centralize_leads ? "bg-emerald-500" : "bg-zinc-300 dark:bg-zinc-700"
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      formData.centralize_leads ? "translate-x-6" : "translate-x-1"
                    }`}
                  />
                </button>
              </div>

              {/* Input WhatsApp Central da Empresa */}
              <div className="mt-6 pt-5 border-t" style={{ borderColor: "var(--dash-border)" }}>
                <label className="text-xs font-bold mb-1.5 flex items-center gap-1.5" style={{ color: "var(--dash-text-secondary)" }}>
                  Número de WhatsApp da Empresa (Opcional)
                </label>
                <input 
                  type="text" 
                  value={formData.whatsapp}
                  onChange={e => setFormData({ ...formData, whatsapp: e.target.value })}
                  placeholder="(00) 00000-0000"
                  className="w-full px-4 py-3 rounded-xl border outline-none text-sm transition-all"
                  style={{ background: "var(--dash-surface)", borderColor: "var(--dash-border)", color: "var(--dash-text-primary)" }}
                />
                <p className="text-[10px] mt-1.5" style={{ color: "var(--dash-text-muted)" }}>
                  {formData.centralize_leads 
                    ? "Este número receberá TODOS os leads da empresa (Centralização Ativa)." 
                    : "Este número servirá como reserva caso algum vendedor esqueça de preencher o próprio WhatsApp."}
                </p>
              </div>
            </div>
          </section>
        )}

        {/* 05 - Google Preview */}
        <section className="space-y-4 pt-6">
          <h2 className="text-xs font-bold uppercase tracking-widest text-center" style={{ color: "var(--dash-text-muted)" }}>Pré-visualização no Google</h2>
          <div className="rounded-2xl p-8 space-y-2 border shadow-sm transition-all" style={{ background: "var(--dash-input-bg)", borderColor: "var(--dash-border)" }}>
            <div className="flex items-center gap-2 mb-1">
              <div className="w-4 h-4 rounded-full flex items-center justify-center bg-zinc-100 overflow-hidden">
                {formData.favicon_url ? <img src={formData.favicon_url} className="w-full h-full object-cover" /> : <Globe size={10} className="text-zinc-400" />}
              </div>
              <p className="text-xs" style={{ color: "var(--dash-text-muted)" }}>{orgSlug}.com</p>
            </div>
            <h3 className="text-xl font-medium leading-tight" style={{ color: "#1a0dab" }}>
              {formData.meta_title || "Título da sua empresa"}
            </h3>
            <p className="text-sm leading-relaxed line-clamp-2" style={{ color: "#4d5156" }}>
              {formData.meta_description || "A descrição que aparecerá nos resultados de busca do Google..."}
            </p>
          </div>
        </section>

      </div>

      {/* Footer */}
      <div className="p-6 border-t flex items-center justify-end gap-4" style={{ background: "rgba(0,0,0,0.02)", borderColor: "var(--dash-border)" }}>
        <button 
          onClick={handleSave}
          disabled={saving}
          className="px-10 py-3 rounded-xl text-sm font-black transition-all shadow-lg hover:scale-105 active:scale-95 disabled:opacity-50"
          style={{ background: "var(--dash-text-primary)", color: "var(--dash-surface)" }}
        >
          {saving ? <Loader2 size={18} className="animate-spin" /> : "Salvar Configurações"}
        </button>
      </div>

      <ImageEditorModal
        isOpen={showImageEditor}
        onClose={() => setShowImageEditor(false)}
        onConfirm={onImageEditorConfirm}
        aspectRatio={
          activeUploadType === "favicon" ? 1 : 
          activeUploadType === "logo" ? 2 : 
          1.91
        }
        title={
          activeUploadType === "favicon" ? "Editar Favicon" : 
          activeUploadType === "logo" ? "Editar Logotipo" : 
          "Editar Banner de SEO"
        }
        description={
          activeUploadType === "favicon" ? "Ícone que aparece na aba do navegador." : 
          activeUploadType === "logo" ? "Logotipo exibido no topo do catálogo." : 
          "Banner para redes sociais."
        }
        targetWidth={activeUploadType === "favicon" ? 64 : activeUploadType === "logo" ? 400 : 1200}
        targetHeight={activeUploadType === "favicon" ? 64 : activeUploadType === "logo" ? 200 : 630}
      />
    </div>
  );
}
