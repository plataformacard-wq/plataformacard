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

  // Form State
  const [formData, setFormData] = useState({
    meta_title: "",
    meta_description: "",
    meta_keywords: "",
    favicon_url: "",
    logo_url: "",
    og_image_url: "",
    accent_color: "#25D366"
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
          .select("organization_id")
          .eq("user_id", user.id)
          .maybeSingle();

        if (profile?.organization_id) {
          setOrgId(profile.organization_id);
          const { data: org } = await supabase
            .from("organizations")
            .select("*")
            .eq("id", profile.organization_id)
            .maybeSingle();
          
          if (org) {
            setOrgName(org.name || "");
            setOrgSlug(org.slug || "seulink.com");
            setFormData({
              meta_title: org.meta_title || "",
              meta_description: org.meta_description || "",
              meta_keywords: org.meta_keywords || "",
              favicon_url: org.favicon_url || "",
              logo_url: org.logo_url || "",
              og_image_url: org.og_image_url || "",
              accent_color: org.accent_color || "#25D366"
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
        accent_color: formData.accent_color
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
        
        {/* 01 - IA Generator (NOW FIRST) */}
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
            
            <AnimatePresence>
              {message && (message.type === "success" || message.type === "error") && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className={`pt-2 border-t flex items-center gap-2 text-xs font-bold ${
                    message.type === "success" ? "text-emerald-500" : "text-red-500"
                  }`}
                  style={{ borderColor: "var(--dash-border)" }}
                >
                  {message.type === "success" ? <CheckCircle2 size={14} /> : <X size={14} />}
                  {message.text}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </section>

        {/* 02 - Informações Gerais */}
        <section className="space-y-6">
          <h2 className="text-sm font-bold uppercase tracking-wider" style={{ color: "var(--dash-text-secondary)" }}>01. Conteúdo da Página</h2>
          
          <div className="space-y-4">
            <div>
              <label className="text-xs font-medium mb-1.5 flex items-center gap-1.5" style={{ color: "var(--dash-text-secondary)" }}>
                Título da página <span className="text-red-500">*</span>
                <Info size={14} style={{ color: "var(--dash-text-muted)" }} />
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
                Descrição da página
                <Info size={14} style={{ color: "var(--dash-text-muted)" }} />
              </label>
              <textarea 
                value={formData.meta_description}
                onChange={e => setFormData({ ...formData, meta_description: e.target.value.slice(0, 320) })}
                placeholder="Descreva seu negócio para o Google..."
                rows={4}
                className="w-full px-4 py-3 rounded-xl border outline-none text-sm transition-all resize-none"
                style={{ background: "var(--dash-input-bg)", borderColor: "var(--dash-border)", color: "var(--dash-text-primary)" }}
              />
              <div className="flex justify-end mt-1">
                <span className="text-[10px] font-medium" style={{ color: "var(--dash-text-muted)" }}>{formData.meta_description.length}/320</span>
              </div>
            </div>

            <div>
              <label className="text-xs font-medium mb-1.5 flex items-center gap-1.5" style={{ color: "var(--dash-text-secondary)" }}>
                Palavras-chave
                <Info size={14} style={{ color: "var(--dash-text-muted)" }} />
              </label>
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

        {/* 03 - Identidade Visual (Cores) */}
        <section className="space-y-6">
          <h2 className="text-sm font-bold uppercase tracking-wider" style={{ color: "var(--dash-text-secondary)" }}>02. Marca e Cores</h2>
          
          <div className="border rounded-2xl p-6 space-y-6" style={{ background: "var(--dash-input-bg)", borderColor: "var(--dash-border)" }}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-bold" style={{ color: "var(--dash-text-primary)" }}>Cor de Destaque</p>
                <p className="text-xs" style={{ color: "var(--dash-text-secondary)" }}>Cor principal do seu catálogo e cartões.</p>
              </div>
              <div className="relative group">
                <div 
                  className="absolute inset-0 rounded-full blur-md opacity-20 group-hover:opacity-40 transition-opacity"
                  style={{ background: "conic-gradient(from 0deg, #ff0000, #ffff00, #00ff00, #00ffff, #0000ff, #ff00ff, #ff0000)" }}
                />
                <input 
                  type="color" 
                  value={formData.accent_color}
                  onChange={(e) => setFormData({ ...formData, accent_color: e.target.value })}
                  className="w-14 h-14 rounded-full border-4 shadow-xl cursor-pointer overflow-hidden p-0 relative z-10 appearance-none bg-transparent [&::-webkit-color-swatch-wrapper]:p-0 [&::-webkit-color-swatch]:border-none [&::-webkit-color-swatch]:rounded-full"
                  style={{ 
                    borderColor: "var(--dash-surface)", 
                    background: "conic-gradient(from 0deg, #ff0000, #ffff00, #00ff00, #00ffff, #0000ff, #ff00ff, #ff0000)" 
                  }}
                />
              </div>
            </div>

            <div className="flex items-center gap-4">
              {[
                { name: "Maj Orange", color: "#F37021" },
                { name: "Standard Green", color: "#25D366" },
                { name: "Royal Purple", color: "#8B5CF6" }
              ].map((preset) => (
                <button
                  key={preset.color}
                  onClick={() => setFormData({ ...formData, accent_color: preset.color })}
                  className={`flex-1 group flex items-center justify-center gap-2 px-3 py-3 rounded-xl border transition-all ${
                    formData.accent_color === preset.color 
                      ? "ring-2 ring-offset-2 ring-offset-[var(--dash-surface)]" 
                      : "hover:border-[var(--dash-text-muted)]"
                  }`}
                  style={{ 
                    borderColor: formData.accent_color === preset.color ? "var(--dash-text-primary)" : "var(--dash-border)",
                    background: "var(--dash-surface)",
                    ringColor: preset.color
                  }}
                >
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: preset.color }} />
                  <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: "var(--dash-text-primary)" }}>{preset.name.split(' ')[1] || preset.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Ativos Visuais (Favicon, Logo, Banner) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Favicon */}
            <div className="space-y-3">
              <label className="text-xs font-bold" style={{ color: "var(--dash-text-secondary)" }}>Favicon</label>
              <div className="h-32 border-2 border-dashed rounded-2xl flex flex-col items-center justify-center gap-2 relative group cursor-pointer transition-all hover:bg-zinc-500/5"
                   style={{ borderColor: "var(--dash-border)", background: "var(--dash-input-bg)" }}
                   onClick={() => { setActiveUploadType("favicon"); setShowImageEditor(true); }}>
                {formData.favicon_url ? (
                  <img src={formData.favicon_url} className="w-12 h-12 object-contain" />
                ) : (
                  <Globe size={24} style={{ color: "var(--dash-text-muted)" }} />
                )}
                <span className="text-[10px] font-bold" style={{ color: "var(--dash-text-muted)" }}>64 x 64 px</span>
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center rounded-2xl transition-opacity">
                  <Upload size={20} className="text-white" />
                </div>
              </div>
            </div>

            {/* Logo */}
            <div className="space-y-3">
              <label className="text-xs font-bold" style={{ color: "var(--dash-text-secondary)" }}>Logotipo</label>
              <div className="h-32 border-2 border-dashed rounded-2xl flex flex-col items-center justify-center gap-2 relative group cursor-pointer transition-all hover:bg-zinc-500/5"
                   style={{ borderColor: "var(--dash-border)", background: "var(--dash-input-bg)" }}
                   onClick={() => { setActiveUploadType("logo"); setShowImageEditor(true); }}>
                {formData.logo_url ? (
                  <img src={formData.logo_url} className="max-w-[80%] max-h-[60%] object-contain" />
                ) : (
                  <Upload size={24} style={{ color: "var(--dash-text-muted)" }} />
                )}
                <span className="text-[10px] font-bold" style={{ color: "var(--dash-text-muted)" }}>400 x 200 px</span>
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center rounded-2xl transition-opacity">
                  <Upload size={20} className="text-white" />
                </div>
              </div>
            </div>
          </div>

          {/* Banner SEO */}
          <div className="space-y-3">
            <label className="text-xs font-bold" style={{ color: "var(--dash-text-secondary)" }}>Banner de Compartilhamento (SEO)</label>
            <div className="h-44 border-2 border-dashed rounded-2xl flex flex-col items-center justify-center gap-2 relative group cursor-pointer transition-all hover:bg-zinc-500/5 overflow-hidden"
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
              <div className="absolute bottom-3 right-3 bg-black/60 px-2 py-1 rounded text-[10px] text-white font-bold backdrop-blur-md">1200 x 630 px</div>
            </div>
          </div>
        </section>

        {/* 04 - Google Preview */}
        <section className="space-y-4 pt-6">
          <h2 className="text-xs font-bold uppercase tracking-widest text-center" style={{ color: "var(--dash-text-muted)" }}>Pré-visualização no Google</h2>
          <div className="rounded-2xl p-8 space-y-2 border shadow-sm transition-all" style={{ background: "var(--dash-input-bg)", borderColor: "var(--dash-border)" }}>
            <div className="flex items-center gap-2 mb-1">
              <div className="w-4 h-4 rounded-full flex items-center justify-center bg-zinc-100 overflow-hidden">
                {formData.favicon_url ? <img src={formData.favicon_url} className="w-full h-full object-cover" /> : <Globe size={10} className="text-zinc-400" />}
              </div>
              <p className="text-xs" style={{ color: "var(--dash-text-muted)" }}>{orgSlug}.com</p>
            </div>
            <h3 className="text-xl font-medium leading-tight hover:underline cursor-pointer" style={{ color: "#1a0dab" }}>
              {formData.meta_title || "Título da sua empresa"}
            </h3>
            <p className="text-sm leading-relaxed line-clamp-3" style={{ color: "#4d5156" }}>
              {formData.meta_description || "A descrição que aparecerá nos resultados de busca do Google..."}
            </p>
          </div>
        </section>

      </div>

      {/* Footer */}
      <div className="p-6 border-t flex items-center justify-between" style={{ background: "rgba(0,0,0,0.02)", borderColor: "var(--dash-border)" }}>
        <button 
          className="px-6 py-2.5 border rounded-xl text-sm font-bold transition-all hover:bg-zinc-500/5"
          style={{ background: "var(--dash-surface)", borderColor: "var(--dash-border)", color: "var(--dash-text-primary)" }}
        >
          Cancelar
        </button>
        <div className="flex items-center gap-4">
          <button 
            onClick={handleSave}
            disabled={saving}
            className="px-10 py-2.5 rounded-xl text-sm font-bold transition-all shadow-lg hover:scale-105 active:scale-95 disabled:opacity-50"
            style={{ background: "var(--dash-text-primary)", color: "var(--dash-surface)" }}
          >
            {saving ? <Loader2 size={18} className="animate-spin" /> : "Salvar Alterações"}
          </button>
        </div>
      </div>

      {/* Floating Message */}
      <AnimatePresence>
        {message && (message.type === "success" || message.type === "error") && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-10 right-10 z-[100]"
          >
            <div className={`px-6 py-4 rounded-2xl shadow-2xl border flex items-center gap-3 font-bold text-sm ${
              message.type === "success" ? "bg-emerald-500 text-white border-emerald-400" : "bg-red-500 text-white border-red-400"
            }`}>
              {message.type === "success" ? <CheckCircle2 size={20} /> : <X size={20} />}
              {message.text}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

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
          activeUploadType === "favicon" ? "O favicon é o ícone que aparece na aba do navegador." : 
          activeUploadType === "logo" ? "O logotipo será exibido no topo do seu catálogo." : 
          "Este banner aparece quando você compartilha seu link nas redes sociais."
        }
        targetWidth={activeUploadType === "favicon" ? 64 : activeUploadType === "logo" ? 400 : 1200}
        targetHeight={activeUploadType === "favicon" ? 64 : activeUploadType === "logo" ? 200 : 630}
        minWidth={activeUploadType === "favicon" ? 64 : activeUploadType === "logo" ? 200 : 600}
        minHeight={activeUploadType === "favicon" ? 64 : activeUploadType === "logo" ? 100 : 315}
      />
    </div>
  );
}
