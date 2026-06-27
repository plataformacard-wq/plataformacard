"use client";

import { useEffect, useState, useRef } from "react";
import { getFullPlatformConfig, updateGlobalBranding } from "@/lib/admin-actions";
import { uploadStorageFile } from "@/lib/dashboard/sellerActions";
import { createClient } from "@/lib/supabase/client";
import { Save, Image as ImageIcon, Upload, Paintbrush, Loader2 } from "lucide-react";
import { motion } from "framer-motion";

export default function GlobalBrandingPage() {
  const supabase = createClient();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{text: string, type: "success"|"error"} | null>(null);

  const [formData, setFormData] = useState({
    global_primary_color_light: "#10b981",
    global_primary_color_dark: "#25D366",
    global_sidebar_color_light: "#0f172a",
    global_sidebar_color_dark: "#0a0a0a",
    global_logo_url: "",
    global_icon_url: "",
  });

  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [iconFile, setIconFile] = useState<File | null>(null);

  useEffect(() => {
    async function loadData() {
      const config = await getFullPlatformConfig();
      setFormData({
        global_primary_color_light: config.global_primary_color_light || "#10b981",
        global_primary_color_dark: config.global_primary_color_dark || "#25D366",
        global_sidebar_color_light: config.global_sidebar_color_light || "#0f172a",
        global_sidebar_color_dark: config.global_sidebar_color_dark || "#0a0a0a",
        global_logo_url: config.global_logo_url || "",
        global_icon_url: config.global_icon_url || "",
      });
      setLoading(false);
    }
    loadData();
  }, []);

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setLogoFile(file);
      setFormData({ ...formData, global_logo_url: URL.createObjectURL(file) });
    }
  };

  const handleIconUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setIconFile(file);
      setFormData({ ...formData, global_icon_url: URL.createObjectURL(file) });
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage(null);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Usuário não autenticado");

      let finalLogoUrl = formData.global_logo_url;
      if (logoFile) {
        const fileExt = logoFile.name.split(".").pop();
        const filePath = `branding/logo_global_${Date.now()}.${fileExt}`;
        const uploadForm = new FormData();
        uploadForm.append("file", logoFile);
        uploadForm.append("bucket", "avatars");
        uploadForm.append("path", filePath);
        
        const res = await uploadStorageFile(uploadForm);
        if (res.error || !res.publicUrl) throw new Error(res.error || "Erro ao subir Logo");
        finalLogoUrl = res.publicUrl;
      }

      let finalIconUrl = formData.global_icon_url;
      if (iconFile) {
        const fileExt = iconFile.name.split(".").pop();
        const filePath = `branding/icon_global_${Date.now()}.${fileExt}`;
        const uploadForm = new FormData();
        uploadForm.append("file", iconFile);
        uploadForm.append("bucket", "avatars");
        uploadForm.append("path", filePath);
        
        const res = await uploadStorageFile(uploadForm);
        if (res.error || !res.publicUrl) throw new Error(res.error || "Erro ao subir Ícone");
        finalIconUrl = res.publicUrl;
      }

      const getFinalUrl = (url: string | null) => {
        if (!url || url.startsWith("blob:")) return url;
        const baseUrl = url.split('?')[0];
        return `${baseUrl}?t=${Date.now()}`;
      };

      const brandingPayload = {
        global_primary_color_light: formData.global_primary_color_light,
        global_primary_color_dark: formData.global_primary_color_dark,
        global_sidebar_color_light: formData.global_sidebar_color_light,
        global_sidebar_color_dark: formData.global_sidebar_color_dark,
        global_logo_url: finalLogoUrl,
        global_icon_url: finalIconUrl,
      };

      const result = await updateGlobalBranding(brandingPayload);
      if (!result.success) throw new Error(result.error);

      setMessage({ text: "Branding atualizado com sucesso! (Recarregue a página para ver todas as cores)", type: "success" });
      setLogoFile(null);
      setIconFile(null);
      setFormData({
        ...formData,
        global_logo_url: getFinalUrl(finalLogoUrl) || "",
        global_icon_url: getFinalUrl(finalIconUrl) || "",
      });

    } catch (e: any) {
      setMessage({ text: e.message || "Erro desconhecido", type: "error" });
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-8 flex items-center gap-2"><Loader2 className="animate-spin" /> Carregando...</div>;

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[var(--dash-text-primary)] flex items-center gap-2">
          <Paintbrush className="text-primary" />
          Marca e Cores (White-Label)
        </h1>
        <p className="text-[var(--dash-text-secondary)] mt-1">
          Configure a identidade visual que será aplicada globalmente em toda a plataforma.
        </p>
      </div>

      {message && (
        <div className={`mb-6 p-4 rounded-xl ${message.type === 'success' ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-500' : 'bg-red-500/10 border border-red-500/20 text-red-500'}`}>
          {message.text}
        </div>
      )}

      <div className="space-y-6">
        {/* Colors */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* TEMA CLARO */}
          <div className="bg-[var(--dash-surface)] border border-[var(--dash-border)] rounded-2xl p-6 shadow-sm">
            <h2 className="text-lg font-bold text-[var(--dash-text-primary)] mb-4 flex items-center gap-2">
              <span className="w-4 h-4 rounded-full bg-white border border-gray-300 shadow-inner block"></span>
              Tema Claro
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-[var(--dash-text-secondary)] mb-2">Cor Principal</label>
                <div className="flex items-center gap-3">
                  <input 
                    type="color" 
                    value={formData.global_primary_color_light}
                    onChange={(e) => setFormData({...formData, global_primary_color_light: e.target.value})}
                    className="w-10 h-10 rounded cursor-pointer border-0 p-0"
                  />
                  <input 
                    type="text" 
                    value={formData.global_primary_color_light}
                    onChange={(e) => setFormData({...formData, global_primary_color_light: e.target.value})}
                    className="bg-[var(--dash-input-bg)] border border-[var(--dash-border)] rounded-lg px-3 py-2 flex-1 text-[var(--dash-text-primary)] text-sm"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-bold text-[var(--dash-text-secondary)] mb-2">Fundo da Sidebar</label>
                <div className="flex items-center gap-3">
                  <input 
                    type="color" 
                    value={formData.global_sidebar_color_light}
                    onChange={(e) => setFormData({...formData, global_sidebar_color_light: e.target.value})}
                    className="w-10 h-10 rounded cursor-pointer border-0 p-0"
                  />
                  <input 
                    type="text" 
                    value={formData.global_sidebar_color_light}
                    onChange={(e) => setFormData({...formData, global_sidebar_color_light: e.target.value})}
                    className="bg-[var(--dash-input-bg)] border border-[var(--dash-border)] rounded-lg px-3 py-2 flex-1 text-[var(--dash-text-primary)] text-sm"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* TEMA ESCURO */}
          <div className="bg-[var(--dash-surface)] border border-[var(--dash-border)] rounded-2xl p-6 shadow-sm">
            <h2 className="text-lg font-bold text-[var(--dash-text-primary)] mb-4 flex items-center gap-2">
              <span className="w-4 h-4 rounded-full bg-zinc-900 border border-zinc-700 shadow-inner block"></span>
              Tema Escuro
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-[var(--dash-text-secondary)] mb-2">Cor Principal</label>
                <div className="flex items-center gap-3">
                  <input 
                    type="color" 
                    value={formData.global_primary_color_dark}
                    onChange={(e) => setFormData({...formData, global_primary_color_dark: e.target.value})}
                    className="w-10 h-10 rounded cursor-pointer border-0 p-0"
                  />
                  <input 
                    type="text" 
                    value={formData.global_primary_color_dark}
                    onChange={(e) => setFormData({...formData, global_primary_color_dark: e.target.value})}
                    className="bg-[var(--dash-input-bg)] border border-[var(--dash-border)] rounded-lg px-3 py-2 flex-1 text-[var(--dash-text-primary)] text-sm"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-bold text-[var(--dash-text-secondary)] mb-2">Fundo da Sidebar</label>
                <div className="flex items-center gap-3">
                  <input 
                    type="color" 
                    value={formData.global_sidebar_color_dark}
                    onChange={(e) => setFormData({...formData, global_sidebar_color_dark: e.target.value})}
                    className="w-10 h-10 rounded cursor-pointer border-0 p-0"
                  />
                  <input 
                    type="text" 
                    value={formData.global_sidebar_color_dark}
                    onChange={(e) => setFormData({...formData, global_sidebar_color_dark: e.target.value})}
                    className="bg-[var(--dash-input-bg)] border border-[var(--dash-border)] rounded-lg px-3 py-2 flex-1 text-[var(--dash-text-primary)] text-sm"
                  />
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* Logos */}
        <div className="bg-[var(--dash-surface)] border border-[var(--dash-border)] rounded-2xl p-6 shadow-sm">
          <h2 className="text-lg font-bold text-[var(--dash-text-primary)] mb-4">Logotipos do Sistema</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Logo Completo */}
            <div>
              <label className="block text-sm font-bold text-[var(--dash-text-secondary)] mb-2">Logo Principal (Extenso)</label>
              <div className="border-2 border-dashed border-[var(--dash-border)] rounded-xl p-6 text-center hover:bg-[var(--dash-hover-bg)] transition-colors relative">
                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={handleLogoUpload}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                {formData.global_logo_url ? (
                  <div className="flex flex-col items-center gap-3">
                    <img src={formData.global_logo_url} alt="Logo" className="h-12 object-contain" />
                    <span className="text-xs text-[var(--dash-text-muted)]">Clique para trocar</span>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-2 text-[var(--dash-text-muted)]">
                    <Upload size={24} />
                    <span className="text-sm">Upload do Logotipo</span>
                  </div>
                )}
              </div>
              <p className="text-[10px] text-[var(--dash-text-muted)] mt-2 text-center">
                Tamanho recomendado: <strong>400x120 pixels</strong>. Formato: PNG (fundo transparente).
              </p>
            </div>

            {/* Icone Reduzido */}
            <div>
              <label className="block text-sm font-bold text-[var(--dash-text-secondary)] mb-2">Ícone (Símbolo reduzido)</label>
              <div className="border-2 border-dashed border-[var(--dash-border)] rounded-xl p-6 text-center hover:bg-[var(--dash-hover-bg)] transition-colors relative">
                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={handleIconUpload}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                {formData.global_icon_url ? (
                  <div className="flex flex-col items-center gap-3">
                    <img src={formData.global_icon_url} alt="Icone" className="w-12 h-12 object-contain" />
                    <span className="text-xs text-[var(--dash-text-muted)]">Clique para trocar</span>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-2 text-[var(--dash-text-muted)]">
                    <ImageIcon size={24} />
                    <span className="text-sm">Upload do Ícone (Quadrado)</span>
                  </div>
                )}
              </div>
              <p className="text-[10px] text-[var(--dash-text-muted)] mt-2 text-center">
                Tamanho recomendado: <strong>256x256 pixels</strong>. Formato: PNG (fundo transparente) ou SVG.
              </p>
            </div>

          </div>
        </div>

        <div className="flex justify-end">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-xl font-bold hover:brightness-110 transition-all shadow-lg shadow-primary/30 disabled:opacity-50"
          >
            {saving ? <Loader2 size={20} className="animate-spin" /> : <Save size={20} />}
            {saving ? "Salvando..." : "Salvar Configurações"}
          </motion.button>
        </div>

      </div>
    </div>
  );
}
