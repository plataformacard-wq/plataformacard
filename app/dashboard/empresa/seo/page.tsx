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
import { uploadStorageFile, updateOrganizationSEO } from "@/lib/dashboard/sellerActions";
import AiReviewModal from "@/components/dashboard/AiReviewModal";
import SeoBrandAssets from "@/components/dashboard/empresa/seo/SeoBrandAssets";
import SeoAiGenerator from "@/components/dashboard/empresa/seo/SeoAiGenerator";

export default function SEOPage() {
  const supabase = createClient();
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: "success" | "error" | "info" } | null>(null);
  const [orgId, setOrgId] = useState<string | null>(null);
  const [showFaviconHintModal, setShowFaviconHintModal] = useState(false);
  const [orgName, setOrgName] = useState("");
  const [orgSlug, setOrgSlug] = useState("seulink.com");
  const [businessModel, setBusinessModel] = useState<string | null>(null);
  const [businessNiche, setBusinessNiche] = useState("");

  // Form State
  const [formData, setFormData] = useState({
    meta_title: "",
    meta_description: "",
    meta_keywords: "",
    favicon_url: "",
    logo_url: "",
    og_image_url: "",
    public_banner_url: "",
    social_instagram: "",
    social_facebook: "",
    social_tiktok: "",
    social_youtube: "",
    centralize_leads: false,
    whatsapp: "",
  });
  const [faviconFile, setFaviconFile] = useState<File | null>(null);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [bannerFile, setBannerFile] = useState<File | null>(null);
  const [publicBannerFile, setPublicBannerFile] = useState<File | null>(null);
  const [activeUploadType, setActiveUploadType] = useState<"favicon" | "logo" | "banner" | "public_banner">("favicon");
  const [showImageEditor, setShowImageEditor] = useState(false);
  const [usedAIAssistant, setUsedAIAssistant] = useState(false);
  const [showAIWarning, setShowAIWarning] = useState(false);
  const [reviewData, setReviewData] = useState<any>(null);

  useEffect(() => {
    async function loadData() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data: profile } = await supabase
          .from("profiles")
          .select("organization_id, role, granular_permissions")
          .eq("user_id", user.id)
          .maybeSingle();

        const shadowOrgId = document.cookie
          .split("; ")
          .find((row) => row.startsWith("shadow_org_id="))
          ?.split("=")[1];

        const isSuperAdmin = profile?.role === "main_admin";
        const activeOrgId = (isSuperAdmin && shadowOrgId) ? shadowOrgId : profile?.organization_id;

        if (profile?.role === "seller") {
          const seoAllowed = profile?.granular_permissions?.company?.seo !== false;
          if (!seoAllowed) {
            window.location.href = "/dashboard/perfil";
            return;
          }
        }

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
              public_banner_url: org.public_banner_url || "",
              social_instagram: org.social_instagram || "",
              social_facebook: org.social_facebook || "",
              social_tiktok: org.social_tiktok || "",
              social_youtube: org.social_youtube || "",
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
    if (!orgName.trim() || !businessNiche.trim()) return;
    setGenerating(true);
    setMessage(null);

    const niche = businessNiche.trim();
    const model = (businessModel === "B2C" ? "B2C" : "B2B") as "B2B" | "B2C";
    const result = await generateSEOWithAI(orgName, niche, model);

    if (result.error) {
      setMessage({ text: result.error, type: "error" });
    } else if (result.data) {
      setReviewData({
        title: "Sugestões de SEO com IA",
        explanation: "O assistente de IA gerou sugestões otimizadas de SEO com base no nome e segmento informados. Revise e selecione as alterações que deseja aplicar.",
        changes: [
          { id: "title", field: "Título da página (Google)", from: formData.meta_title, to: result.data.title },
          { id: "description", field: "Descrição SEO", from: formData.meta_description, to: result.data.description },
          { id: "keywords", field: "Palavras-chave (Tags)", from: formData.meta_keywords, to: result.data.keywords }
        ],
        payload: {
          title: result.data.title,
          description: result.data.description,
          keywords: result.data.keywords
        }
      });
      setMessage({ text: "IA gerou sugestões com sucesso!", type: "success" });
      setTimeout(() => setMessage(null), 5000);
    }
    setGenerating(false);
  }

  function handleSaveClick() {
    if (usedAIAssistant) {
      setShowAIWarning(true);
    } else {
      handleSave();
    }
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
      const filePath = `${user.id}/favicon-${orgId}.${fileExt}`;
      
      const uploadFormData = new FormData();
      uploadFormData.append("file", faviconFile);
      uploadFormData.append("bucket", "avatars");
      uploadFormData.append("path", filePath);

      const result = await uploadStorageFile(uploadFormData);
      if (result.error || !result.publicUrl) {
        setMessage({ text: `Erro no favicon: ${result.error || "Falha no upload"}`, type: "error" });
        setSaving(false);
        return;
      }
      newFaviconUrl = result.publicUrl;
    }

    let newLogoUrl = formData.logo_url;
    if (logoFile) {
      const fileExt = logoFile.name.split(".").pop();
      const filePath = `${user.id}/logo-${orgId}.${fileExt}`;
      
      const uploadFormData = new FormData();
      uploadFormData.append("file", logoFile);
      uploadFormData.append("bucket", "avatars");
      uploadFormData.append("path", filePath);

      const result = await uploadStorageFile(uploadFormData);
      if (result.error || !result.publicUrl) {
        setMessage({ text: `Erro no logotipo: ${result.error || "Falha no upload"}`, type: "error" });
        setSaving(false);
        return;
      }
      newLogoUrl = result.publicUrl;
    }

    
    let newPublicBannerUrl = formData.public_banner_url;
    if (publicBannerFile) {
      const fileExt = publicBannerFile.name.split(".").pop();
      const filePath = `${user.id}/public-banner-${orgId}.${fileExt}`;
      
      const uploadFormData = new FormData();
      uploadFormData.append("file", publicBannerFile);
      uploadFormData.append("bucket", "avatars");
      uploadFormData.append("path", filePath);

      const result = await uploadStorageFile(uploadFormData);
      if (result.error || !result.publicUrl) {
        setMessage({ text: `Erro no banner público: ${result.error || "Falha no upload"}`, type: "error" });
        setSaving(false);
        return;
      }
      newPublicBannerUrl = result.publicUrl;
    }

    let newOgImageUrl = formData.og_image_url;
    if (bannerFile) {
      const fileExt = bannerFile.name.split(".").pop();
      const filePath = `${user.id}/og-image-${orgId}.${fileExt}`;
      
      const uploadFormData = new FormData();
      uploadFormData.append("file", bannerFile);
      uploadFormData.append("bucket", "avatars");
      uploadFormData.append("path", filePath);

      const result = await uploadStorageFile(uploadFormData);
      if (result.error || !result.publicUrl) {
        setMessage({ text: `Erro no banner: ${result.error || "Falha no upload"}`, type: "error" });
        setSaving(false);
        return;
      }
      newOgImageUrl = result.publicUrl;
    }

    const result = await updateOrganizationSEO(orgId, {
      meta_title: formData.meta_title,
      meta_description: formData.meta_description,
      meta_keywords: formData.meta_keywords,
      favicon_url: newFaviconUrl,
      logo_url: newLogoUrl,
      og_image_url: newOgImageUrl,
      public_banner_url: newPublicBannerUrl,
      social_instagram: formData.social_instagram,
      social_facebook: formData.social_facebook,
      social_tiktok: formData.social_tiktok,
      social_youtube: formData.social_youtube,
      centralize_leads: formData.centralize_leads,
      whatsapp: formData.whatsapp,
    });

    if (result.error) {
      setMessage({ text: `Erro ao salvar: ${result.error}`, type: "error" });
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
        og_image_url: getFinalUrl(newOgImageUrl) || "",
        public_banner_url: getFinalUrl(newPublicBannerUrl) || "" 
      });
      setFaviconFile(null);
      setLogoFile(null);
      setBannerFile(null);
      setPublicBannerFile(null);
      setUsedAIAssistant(false);
      setMessage({ text: "Configurações salvas com sucesso!", type: "success" });
      setTimeout(() => setMessage(null), 3000);
    }
    setSaving(false);
  }

  function onImageEditorConfirm(file: File) {
    if (activeUploadType === "favicon") {
      setFaviconFile(file);
      setFormData({ ...formData, favicon_url: URL.createObjectURL(file) });
      setShowFaviconHintModal(true);
    } else if (activeUploadType === "logo") {
      setLogoFile(file);
      setFormData({ ...formData, logo_url: URL.createObjectURL(file) });
    } else if (activeUploadType === "public_banner") {
      setPublicBannerFile(file);
      setFormData({ ...formData, public_banner_url: URL.createObjectURL(file) });
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
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-semibold" style={{ color: "var(--dash-text-primary)" }}>
          {businessModel === "B2C" ? "Configurações de SEO e Cartão Público" : "Configurações de SEO e Marca"}
        </h1>
        <p className="mt-2 text-sm" style={{ color: "var(--dash-text-secondary)" }}>
          {businessModel === "B2C" 
            ? "Configure e otimize as informações de busca e compartilhamento do seu perfil público." 
            : "Configure o SEO da sua empresa, logotipo, favicon e configurações de leads."}
        </p>
      </div>

      <SeoAiGenerator 
        businessModel={businessModel}
        orgName={orgName}
        setOrgName={setOrgName}
        businessNiche={businessNiche}
        setBusinessNiche={setBusinessNiche}
        generating={generating}
        handleGenerateAI={handleGenerateAI}
      />

      {/* 02 - Conteúdo SEO & Ativos de Marca */}
      <div className="rounded-2xl border p-6 shadow-sm space-y-8" style={{ background: "var(--dash-surface)", borderColor: "var(--dash-border)" }}>
        {/* Conteúdo SEO */}
        <section className="space-y-6">
          <h2 className="text-base font-semibold" style={{ color: "var(--dash-text-primary)" }}>01. Conteúdo da Página</h2>
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

        <SeoBrandAssets 
          formData={formData}
          setFormData={setFormData}
          businessModel={businessModel}
          setActiveUploadType={setActiveUploadType}
          setShowImageEditor={setShowImageEditor}
        />
      </div>

      {/* Redes Sociais */}
      <div className="rounded-2xl border p-6 shadow-sm mt-6" style={{ background: "var(--dash-surface)", borderColor: "var(--dash-border)" }}>
        <h2 className="text-base font-semibold mb-1" style={{ color: "var(--dash-text-primary)" }}>03. Redes Sociais da Empresa</h2>
        <p className="text-sm mb-6" style={{ color: "var(--dash-text-secondary)" }}>
          Os links das redes sociais aparecerão publicamente nos cartões de todos os vendedores e no catálogo da empresa. Deixe em branco se não quiser exibir.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-xs font-bold" style={{ color: "var(--dash-text-secondary)" }}>Instagram (URL completa)</label>
            <input 
              type="url" 
              placeholder="Ex: https://instagram.com/suaempresa"
              value={formData.social_instagram}
              onChange={(e) => setFormData({ ...formData, social_instagram: e.target.value })}
              className="w-full p-3 rounded-xl text-sm outline-none border transition-all hover:border-primary/50 focus:border-primary focus:ring-2 focus:ring-primary/20"
              style={{ background: "var(--dash-input-bg)", borderColor: "var(--dash-border)", color: "var(--dash-text-primary)" }}
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-bold" style={{ color: "var(--dash-text-secondary)" }}>Facebook (URL completa)</label>
            <input 
              type="url" 
              placeholder="Ex: https://facebook.com/suaempresa"
              value={formData.social_facebook}
              onChange={(e) => setFormData({ ...formData, social_facebook: e.target.value })}
              className="w-full p-3 rounded-xl text-sm outline-none border transition-all hover:border-primary/50 focus:border-primary focus:ring-2 focus:ring-primary/20"
              style={{ background: "var(--dash-input-bg)", borderColor: "var(--dash-border)", color: "var(--dash-text-primary)" }}
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-bold" style={{ color: "var(--dash-text-secondary)" }}>TikTok (URL completa)</label>
            <input 
              type="url" 
              placeholder="Ex: https://tiktok.com/@suaempresa"
              value={formData.social_tiktok}
              onChange={(e) => setFormData({ ...formData, social_tiktok: e.target.value })}
              className="w-full p-3 rounded-xl text-sm outline-none border transition-all hover:border-primary/50 focus:border-primary focus:ring-2 focus:ring-primary/20"
              style={{ background: "var(--dash-input-bg)", borderColor: "var(--dash-border)", color: "var(--dash-text-primary)" }}
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-bold" style={{ color: "var(--dash-text-secondary)" }}>YouTube (URL completa)</label>
            <input 
              type="url" 
              placeholder="Ex: https://youtube.com/@suaempresa"
              value={formData.social_youtube}
              onChange={(e) => setFormData({ ...formData, social_youtube: e.target.value })}
              className="w-full p-3 rounded-xl text-sm outline-none border transition-all hover:border-primary/50 focus:border-primary focus:ring-2 focus:ring-primary/20"
              style={{ background: "var(--dash-input-bg)", borderColor: "var(--dash-border)", color: "var(--dash-text-primary)" }}
            />
          </div>
        </div>
      </div>

      {/* 04 - CRM/Leads */}
      {businessModel === "B2B" && (
        <div className="rounded-2xl border p-6 shadow-sm mt-6" style={{ background: "var(--dash-surface)", borderColor: "var(--dash-border)" }}>
          <h2 className="text-base font-semibold mb-4" style={{ color: "var(--dash-text-primary)" }}>04. Configurações de Leads (CRM)</h2>
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
                  className={`inline-block h-4 w-4 transform rounded-full bg-[var(--dash-surface)] transition-transform ${
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
        </div>
      )}

      {/* 04 - Google Preview */}
      <div className="rounded-2xl border p-6 shadow-sm" style={{ background: "var(--dash-surface)", borderColor: "var(--dash-border)" }}>
        <h2 className="text-base font-semibold mb-4" style={{ color: "var(--dash-text-primary)" }}>Pré-visualização no Google</h2>
        <div className="rounded-2xl p-8 space-y-2 border shadow-sm transition-all" style={{ background: "var(--dash-input-bg)", borderColor: "var(--dash-border)" }}>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-4 h-4 rounded-full flex items-center justify-center bg-zinc-100 overflow-hidden">
              {formData.favicon_url ? <img src={formData.favicon_url} className="w-full h-full object-cover" /> : <Globe size={10} className="text-zinc-400" />}
            </div>
            <p className="text-xs" style={{ color: "var(--dash-text-muted)" }}>{orgSlug}.com</p>
          </div>
          <h3 className="text-xl font-medium leading-tight" style={{ color: "#1a0dab" }}>
            {formData.meta_title || (businessModel === "B2C" ? "Título do seu perfil" : "Título da sua empresa")}
          </h3>
          <p className="text-sm leading-relaxed line-clamp-2" style={{ color: "#4d5156" }}>
            {formData.meta_description || "A descrição que aparecerá nos resultados de busca do Google..."}
          </p>
        </div>
      </div>

      {/* Save Button Row */}
      <div className="flex items-center justify-end gap-4 mt-6">
        <button 
          onClick={handleSaveClick}
          disabled={saving}
          className="px-8 py-3 rounded-2xl text-sm font-black transition-all shadow-md hover:scale-105 active:scale-95 disabled:opacity-50 bg-emerald-500 hover:bg-emerald-600 text-white"
        >
          {saving ? <Loader2 size={18} className="animate-spin" /> : (businessModel === "B2C" ? "Salvar Cartão Público" : "Salvar Configurações")}
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
          activeUploadType === "logo" ? (businessModel === "B2C" ? "Editar Foto/Logo" : "Editar Logotipo") :
          activeUploadType === "public_banner" ? "Editar Banner do Cartão" : 
          "Editar Banner de SEO"
        }
        description={
          activeUploadType === "favicon" ? "Ícone que aparece na aba do navegador." : 
          activeUploadType === "logo" ? (businessModel === "B2C" ? "Foto ou logotipo exibido no seu cartão público." : "Logotipo exibido no topo do catálogo.") :
          activeUploadType === "public_banner" ? "Banner que aparece no topo do cartão público." : 
          "Banner para redes sociais."
        }
        targetWidth={activeUploadType === "favicon" ? 64 : activeUploadType === "logo" ? 400 : activeUploadType === "public_banner" ? 1200 : 1200}
        targetHeight={activeUploadType === "favicon" ? 64 : activeUploadType === "logo" ? 200 : activeUploadType === "public_banner" ? 400 : 630}
        minWidth={activeUploadType === "favicon" ? 128 : activeUploadType === "logo" ? 400 : activeUploadType === "public_banner" ? 1200 : 1200}
        minHeight={activeUploadType === "favicon" ? 128 : activeUploadType === "logo" ? 200 : activeUploadType === "public_banner" ? 400 : 630}
      />

      <AiReviewModal
        isOpen={!!reviewData}
        onClose={() => setReviewData(null)}
        onConfirm={(acceptedFields) => {
          const acceptedAny = acceptedFields["title"] || acceptedFields["description"] || acceptedFields["keywords"];
          setFormData(prev => ({
            ...prev,
            meta_title: acceptedFields["title"] ? reviewData.payload.title : prev.meta_title,
            meta_description: acceptedFields["description"] ? reviewData.payload.description : prev.meta_description,
            meta_keywords: acceptedFields["keywords"] ? reviewData.payload.keywords : prev.meta_keywords
          }));
          if (acceptedAny) {
            setUsedAIAssistant(true);
          }
          setReviewData(null);
        }}
        title={reviewData?.title || ""}
        explanation={reviewData?.explanation || ""}
        changes={reviewData?.changes}
      />

      {/* AI Warning Confirmation Modal */}
      <AnimatePresence>
        {showAIWarning && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="w-full max-w-md bg-[var(--dash-surface)] border border-[var(--dash-border)] rounded-3xl p-6 shadow-2xl relative overflow-hidden space-y-6"
            >
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center shrink-0">
                  <Sparkles size={20} />
                </div>
                <div>
                  <h3 className="text-sm font-bold uppercase tracking-wider" style={{ color: "var(--dash-text-primary)" }}>
                    Revisar Textos Gerados
                  </h3>
                  <span className="text-[10px] font-bold text-amber-500 uppercase tracking-widest">
                    Aviso do Assistente de IA
                  </span>
                </div>
              </div>

              <p className="text-xs font-semibold leading-relaxed" style={{ color: "var(--dash-text-secondary)" }}>
                Antes de salvar revise os textos gerados pelo assistente de IA pois o mesmo pode cometer erros.
              </p>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  onClick={() => {
                    setUsedAIAssistant(false);
                    setShowAIWarning(false);
                  }}
                  className="px-5 py-2.5 rounded-xl text-xs font-bold transition-all hover:bg-zinc-500/5"
                  style={{ color: "var(--dash-text-muted)" }}
                >
                  Revisar
                </button>
                <button
                  onClick={() => {
                    setShowAIWarning(false);
                    setUsedAIAssistant(false);
                    handleSave();
                  }}
                  className="px-6 py-2.5 rounded-xl text-xs font-black transition-all shadow-md hover:scale-105 active:scale-95"
                  style={{ background: "var(--dash-text-primary)", color: "var(--dash-surface)" }}
                >
                  Ok
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {message && (
        <div className={`fixed bottom-10 right-10 flex items-center gap-2 px-6 py-3 text-white rounded-2xl shadow-2xl z-50 animate-bounce ${
          message.type === "success" ? "bg-emerald-500" : message.type === "error" ? "bg-rose-500" : "bg-blue-500"
        }`}>
          {message.type === "success" ? <CheckCircle2 size={20} /> : <Info size={20} />}
          <span className="text-sm font-bold">{message.text}</span>
        </div>
      )}
    </div>
  );
}
