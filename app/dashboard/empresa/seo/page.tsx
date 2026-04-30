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
  Loader2
} from "lucide-react";
import { motion } from "framer-motion";
import { generateSEOWithAI } from "@/lib/ai-actions";
import ImageEditorModal from "@/components/dashboard/ImageEditorModal";

export default function SEOPage() {
  const supabase = createClient();
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
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
    accent_color: "#25D366"
  });
  const [faviconFile, setFaviconFile] = useState<File | null>(null);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [activeUploadType, setActiveUploadType] = useState<"favicon" | "logo">("favicon");
  const [showImageEditor, setShowImageEditor] = useState(false);

  useEffect(() => {
    async function loadData() {
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
            accent_color: org.accent_color || "#25D366"
          });
        }
      }
      setLoading(false);
    }
    loadData();
  }, [supabase]);

  async function handleGenerateAI() {
    if (!orgName) return;
    setGenerating(true);
    setMessage("");

    const result = await generateSEOWithAI(orgName);

    if (result.error) {
      setMessage(result.error);
    } else if (result.data) {
      setFormData({
        ...formData,
        meta_title: result.data.title,
        meta_description: result.data.description,
        meta_keywords: result.data.keywords
      });
      setMessage("IA gerou sugestões com sucesso!");
    }
    setGenerating(false);
  }

  async function handleSave() {
    if (!orgId) return;
    setSaving(true);
    setMessage("");

    let newFaviconUrl = formData.favicon_url;

    if (faviconFile) {
      const fileExt = faviconFile.name.split(".").pop();
      const filePath = `orgs/${orgId}/favicon.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(filePath, faviconFile, { upsert: true });

      if (uploadError) {
        setMessage("Erro ao fazer upload do favicon. Tente novamente.");
        setSaving(false);
        return;
      }

      const { data: urlData } = supabase.storage
        .from("avatars")
        .getPublicUrl(filePath);

      newFaviconUrl = urlData.publicUrl;
    }

    let newLogoUrl = formData.logo_url;

    if (logoFile) {
      const fileExt = logoFile.name.split(".").pop();
      const filePath = `orgs/${orgId}/logo.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(filePath, logoFile, { upsert: true });

      if (uploadError) {
        setMessage("Erro ao fazer upload do logotipo. Tente novamente.");
        setSaving(false);
        return;
      }

      const { data: urlData } = supabase.storage
        .from("avatars")
        .getPublicUrl(filePath);

      newLogoUrl = urlData.publicUrl;
    }

    const { error } = await supabase
      .from("organizations")
      .update({
        meta_title: formData.meta_title,
        meta_description: formData.meta_description,
        meta_keywords: formData.meta_keywords,
        favicon_url: newFaviconUrl,
        logo_url: newLogoUrl,
        accent_color: formData.accent_color
      })
      .eq("id", orgId);

    if (error) {
      setMessage("Erro ao salvar informações.");
    } else {
      setFormData({ ...formData, favicon_url: newFaviconUrl, logo_url: newLogoUrl });
      setFaviconFile(null);
      setLogoFile(null);
      setMessage("Configurações salvas com sucesso!");
      setTimeout(() => setMessage(""), 3000);
    }
    setSaving(false);
  }

  function onImageEditorConfirm(file: File) {
    if (activeUploadType === "favicon") {
      setFaviconFile(file);
      setFormData({ ...formData, favicon_url: URL.createObjectURL(file) });
    } else {
      setLogoFile(file);
      setFormData({ ...formData, logo_url: URL.createObjectURL(file) });
    }
  }

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto bg-white rounded-3xl shadow-sm border overflow-hidden">
      {/* Header Modal Style */}
      <div className="px-6 py-4 border-b flex items-center justify-between">
        <h1 className="text-lg font-bold text-zinc-900">Informações e SEO</h1>
        <button className="p-1 hover:bg-zinc-100 rounded-full transition-colors">
          <X size={20} className="text-zinc-400" />
        </button>
      </div>

      <div className="p-6 space-y-8">
        {/* IA Generator Section */}
        <div className="bg-zinc-50/50 border rounded-2xl p-4 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Sparkles size={20} className="text-zinc-900" />
              <div className="flex items-center gap-1">
                <span className="text-sm font-medium text-zinc-900">Gerar SEO automaticamente com IA</span>
                <Info size={14} className="text-zinc-300" />
              </div>
            </div>
            <button 
              onClick={handleGenerateAI}
              disabled={generating}
              className="px-6 py-2 bg-zinc-900 text-white rounded-xl text-sm font-bold hover:bg-black transition-all flex items-center gap-2 disabled:opacity-50"
            >
              {generating ? <Loader2 size={16} className="animate-spin" /> : "Gerar"}
            </button>
          </div>
          

        </div>

        {/* Favicon Section */}
        <div className="space-y-4">
          <h2 className="text-sm font-bold text-zinc-900">Favicon</h2>
          <div className="flex items-start gap-6">
            <div className="w-48 h-28 bg-zinc-50 border rounded-xl relative overflow-hidden flex items-center justify-center">
              {/* Mockup do Browser */}
              <div className="absolute top-0 left-0 right-0 h-8 bg-zinc-100/50 border-b flex items-center px-3 gap-2">
                <div className="h-2 w-2 rounded-full bg-red-300" />
                <div className="h-2 w-2 rounded-full bg-amber-300" />
                <div className="h-2 w-2 rounded-full bg-emerald-300" />
                <div className="ml-2 h-5 w-20 bg-white rounded-t-md border-x border-t flex items-center px-2 gap-1.5">
                   <div className="h-3 w-3 bg-zinc-100 rounded-sm overflow-hidden">
                      {formData.favicon_url && <img src={formData.favicon_url} className="h-full w-full object-cover" />}
                   </div>
                   <div className="h-1 w-8 bg-zinc-100 rounded-full" />
                </div>
              </div>
              <div className="mt-4">
                <div className="h-8 w-8 bg-white border-2 border-dashed rounded-lg flex items-center justify-center text-zinc-300">
                   {formData.favicon_url ? <img src={formData.favicon_url} className="h-full w-full object-cover" /> : <Globe size={16} />}
                </div>
              </div>
            </div>

            <div className="flex-1 space-y-3">
              <p className="text-xs text-zinc-500 font-medium">
                Tamanho recomendado <br />
                <span className="font-bold text-zinc-900">(64 × 64 pixels) .PNG .JPEG</span>
              </p>
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => {
                    setActiveUploadType("favicon");
                    setShowImageEditor(true);
                  }}
                  className="flex items-center gap-2 px-4 py-2 border rounded-xl text-sm font-bold text-zinc-700 hover:bg-zinc-50 transition-all"
                >
                  <Upload size={16} /> Alterar favicon
                </button>
                <button 
                  onClick={() => {
                    setFaviconFile(null);
                    setFormData({ ...formData, favicon_url: "" });
                  }}
                  className="p-2.5 text-zinc-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Logotipo Section */}
        <div className="space-y-4">
          <h2 className="text-sm font-bold text-zinc-900">Logotipo</h2>
          <div className="flex items-start gap-6">
            <div className="w-48 h-28 bg-zinc-50 border rounded-xl relative overflow-hidden flex items-center justify-center p-4">
               {formData.logo_url ? (
                 <img src={formData.logo_url} className="max-w-full max-h-full object-contain" />
               ) : (
                 <div className="flex flex-col items-center gap-2 text-zinc-300">
                   <Upload size={24} />
                   <span className="text-[10px] font-bold">SEM LOGO</span>
                 </div>
               )}
            </div>

            <div className="flex-1 space-y-3">
              <p className="text-xs text-zinc-500 font-medium">
                Logotipo da sua marca <br />
                <span className="font-bold text-zinc-900">(Horizontal recomendado) .PNG .JPEG</span>
              </p>
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => {
                    setActiveUploadType("logo");
                    setShowImageEditor(true);
                  }}
                  className="flex items-center gap-2 px-4 py-2 border rounded-xl text-sm font-bold text-zinc-700 hover:bg-zinc-50 transition-all"
                >
                  <Upload size={16} /> Alterar logo
                </button>
                <button 
                  onClick={() => {
                    setLogoFile(null);
                    setFormData({ ...formData, logo_url: "" });
                  }}
                  className="p-2.5 text-zinc-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Cores e Identidade Section */}
        <div className="space-y-4">
          <h2 className="text-sm font-bold text-zinc-900">Identidade Visual</h2>
          <div className="bg-zinc-50/50 border rounded-2xl p-6 space-y-6">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-sm font-bold text-zinc-900">Cor de Destaque</p>
                  <p className="text-xs text-zinc-500">Esta cor será aplicada em botões, badges e detalhes do catálogo.</p>
                </div>
                <input 
                  type="color" 
                  value={formData.accent_color}
                  onChange={(e) => setFormData({ ...formData, accent_color: e.target.value })}
                  className="w-12 h-12 rounded-xl border-4 border-white shadow-sm cursor-pointer"
                />
              </div>

              <div className="flex flex-wrap gap-3">
                {[
                  { name: "Maj Orange", color: "#F37021" },
                  { name: "Standard Green", color: "#25D366" },
                  { name: "Deep Blue", color: "#2563EB" },
                  { name: "Royal Purple", color: "#8B5CF6" },
                  { name: "Classic Black", color: "#000000" }
                ].map((preset) => (
                  <button
                    key={preset.color}
                    onClick={() => setFormData({ ...formData, accent_color: preset.color })}
                    className={`group flex items-center gap-2 px-3 py-2 rounded-xl border transition-all ${
                      formData.accent_color === preset.color 
                        ? "border-zinc-900 bg-zinc-900 text-white" 
                        : "border-zinc-200 bg-white hover:border-zinc-300"
                    }`}
                  >
                    <div className="w-4 h-4 rounded-full border border-white/20" style={{ backgroundColor: preset.color }} />
                    <span className="text-[10px] font-bold uppercase tracking-wider">{preset.name}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="h-px bg-zinc-100 w-full" />

        {/* Informações Gerais */}
        <div className="space-y-6">
          <h2 className="text-sm font-bold text-zinc-900">Informações gerais</h2>
          
          <div className="space-y-4">
            <div>
              <label className="text-xs font-medium text-zinc-500 mb-1.5 flex items-center gap-1.5">
                Título da página <span className="text-red-500">*</span>
                <Info size={14} className="text-zinc-300" />
              </label>
              <input 
                type="text" 
                value={formData.meta_title}
                onChange={e => setFormData({ ...formData, meta_title: e.target.value })}
                placeholder="Ex: Maj Mobilidade - Atacado"
                className="w-full px-4 py-3 rounded-xl border border-zinc-200 outline-none text-sm focus:border-zinc-400 transition-all"
              />
            </div>

            <div>
              <label className="text-xs font-medium text-zinc-500 mb-1.5 flex items-center gap-1.5">
                Descrição da página
                <Info size={14} className="text-zinc-300" />
              </label>
              <textarea 
                value={formData.meta_description}
                onChange={e => setFormData({ ...formData, meta_description: e.target.value.slice(0, 320) })}
                placeholder="Descreva seu negócio para o Google..."
                rows={4}
                className="w-full px-4 py-3 rounded-xl border border-zinc-200 outline-none text-sm focus:border-zinc-400 transition-all resize-none"
              />
              <div className="flex justify-end mt-1">
                <span className="text-[10px] font-medium text-zinc-400">{formData.meta_description.length}/320</span>
              </div>
            </div>

            <div>
              <label className="text-xs font-medium text-zinc-500 mb-1.5 flex items-center gap-1.5">
                Palavras-chave da página
                <Info size={14} className="text-zinc-300" />
              </label>
              <input 
                type="text" 
                value={formData.meta_keywords}
                onChange={e => setFormData({ ...formData, meta_keywords: e.target.value })}
                placeholder="#atacadão #bike #bikeeletrica"
                className="w-full px-4 py-3 rounded-xl border border-zinc-200 outline-none text-sm focus:border-zinc-400 transition-all"
              />
            </div>
          </div>
        </div>

        {/* Google Preview */}
        <div className="space-y-4">
          <h2 className="text-xs font-medium text-zinc-500 uppercase tracking-wider">Pré-visualização do Google</h2>
          <div className="bg-zinc-50/50 rounded-2xl p-6 space-y-2 border border-transparent hover:border-zinc-100 transition-all">
            <p className="text-xs text-zinc-400">{orgSlug}.com</p>
            <h3 className="text-lg font-medium text-blue-700 leading-tight">
              {formData.meta_title || "Maj Mobilidade - Atacado"}
            </h3>
            <p className="text-sm text-zinc-600 leading-relaxed line-clamp-3">
              {formData.meta_description || "A Maj Mobilidade - Atacado é especializada na venda no atacado de bicicletas e scooters elétricas para pessoas físicas e jurídicas. Compra mínima de 3 unidades com preços direto da importadora..."}
            </p>
          </div>
        </div>
      </div>

      {/* Footer Buttons */}
      <div className="p-6 border-t bg-zinc-50/30 flex items-center justify-between">
        <button className="px-6 py-2.5 border bg-white rounded-xl text-sm font-bold text-zinc-700 hover:bg-zinc-50 transition-all">
          Cancelar
        </button>
        <div className="flex items-center gap-4">
          {message && (
             <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-xs font-bold text-emerald-600 flex items-center gap-1">
                <CheckCircle2 size={14} /> {message}
             </motion.div>
          )}
          <button 
            onClick={handleSave}
            disabled={saving}
            className="px-8 py-2.5 bg-zinc-500 text-white rounded-xl text-sm font-bold hover:bg-zinc-600 transition-all disabled:opacity-50"
          >
            {saving ? "Salvando..." : "Salvar"}
          </button>
        </div>
      </div>

      <ImageEditorModal
        isOpen={showImageEditor}
        onClose={() => setShowImageEditor(false)}
        onConfirm={onImageEditorConfirm}
        aspectRatio={1}
        minWidth={64}
        minHeight={64}
      />
    </div>
  );
}
