"use client";

import { useState, useRef } from "react";
import { Loader2, Sparkles, UploadCloud, Image as ImageIcon, Trash2, CheckCircle2, Link as LinkIcon, Maximize2, Cpu, Moon, Sun, Layout } from "lucide-react";
import imageCompression from "browser-image-compression";
import { updateLandingSettings, uploadHeroMockup, uploadHeaderLogo } from "../actions";

export function HeroClient({ initialSettings }: { initialSettings: any }) {
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadingLogoDark, setUploadingLogoDark] = useState(false);
  const [uploadingLogoLight, setUploadingLogoLight] = useState(false);
  const [uploadStatus, setUploadStatus] = useState("");
  const [uploadError, setUploadError] = useState("");
  const [fileDimensions, setFileDimensions] = useState<{ width: number; height: number } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const darkLogoInputRef = useRef<HTMLInputElement>(null);
  const lightLogoInputRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState(initialSettings || {
    hero_headline: "Venda mais com o catálogo digital perfeito",
    hero_subtitle: "Crie uma vitrine premium para sua empresa, distribuidora ou força de vendas em minutos.",
    seo_title: "PlataformaShop | Catálogo Digital Premium",
    hero_mockup_url: "",
    logo_url_dark: initialSettings?.logo_url_dark || "",
    logo_url_light: initialSettings?.logo_url_light || "",
    base_users: initialSettings?.base_users || 1500,
    base_catalogs: initialSettings?.base_catalogs || 3200,
    social_instagram: initialSettings?.social_instagram || "",
    social_facebook: initialSettings?.social_facebook || "",
    social_linkedin: initialSettings?.social_linkedin || "",
    social_youtube: initialSettings?.social_youtube || "",
    social_tiktok: initialSettings?.social_tiktok || "",
    social_x: initialSettings?.social_x || "",
    support_email: initialSettings?.support_email || "",
    support_phone: initialSettings?.support_phone || "",
  });

  async function handleSave() {
    setSaving(true);
    try {
      const res = await updateLandingSettings(form);
      if (res?.error) {
        alert("Erro: " + res.error);
      } else {
        alert("Hero & SEO atualizados com sucesso!");
      }
    } catch (e) {
      alert("Erro ao salvar.");
    } finally {
      setSaving(false);
    }
  }

  async function processLogoUpload(file: File, themeType: 'dark' | 'light') {
    if (!file.type.startsWith("image/")) {
      alert("Selecione um arquivo de imagem válido.");
      return;
    }

    if (themeType === 'dark') setUploadingLogoDark(true);
    else setUploadingLogoLight(true);

    try {
      let fileToUpload = file;
      try {
        const compressedBlob = await imageCompression(file, {
          maxSizeMB: 0.5,
          maxWidthOrHeight: 800,
          useWebWorker: true,
          fileType: "image/webp"
        });
        fileToUpload = new File([compressedBlob], `logo_${themeType}_${Date.now()}.webp`, { type: "image/webp" });
      } catch (err) {
        console.warn("Compressão de logo falhou, usando original:", err);
      }

      const formData = new FormData();
      formData.append("file", fileToUpload);
      const res = await uploadHeaderLogo(formData, themeType);

      if (res.success && res.publicUrl) {
        setForm((prev: any) => ({
          ...prev,
          [themeType === 'dark' ? 'logo_url_dark' : 'logo_url_light']: res.publicUrl
        }));
        alert(`Logo (${themeType === 'dark' ? 'Tema Escuro' : 'Tema Claro'}) enviada com sucesso! Clique em "Salvar Alterações" para publicar.`);
      } else {
        alert(res.error || "Erro ao fazer upload da logo.");
      }
    } catch (e) {
      alert("Erro ao enviar imagem.");
    } finally {
      if (themeType === 'dark') setUploadingLogoDark(false);
      else setUploadingLogoLight(false);
    }
  }

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    await processFileUpload(file);
  }

  async function handleDrop(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) {
      await processFileUpload(file);
    }
  }

  async function processFileUpload(file: File) {
    if (!file.type.startsWith("image/")) {
      setUploadError("Selecione um arquivo de imagem válido (PNG, JPG, WebP).");
      return;
    }

    setUploading(true);
    setUploadError("");
    setUploadStatus("Lendo dimensões da imagem em pixels...");

    try {
      // 1. Obter dimensões exatas em pixels da imagem original
      const dimensions = await new Promise<{ width: number; height: number }>((resolve) => {
        const img = new Image();
        img.onload = () => resolve({ width: img.width, height: img.height });
        img.onerror = () => resolve({ width: 0, height: 0 });
        img.src = URL.createObjectURL(file);
      });

      setFileDimensions(dimensions);

      // 2. Compressão e Conversão Automática para WebP (Padrão da Plataforma)
      setUploadStatus("Otimizando e convertendo para WebP...");
      const compressionOptions = {
        maxSizeMB: 0.8,
        maxWidthOrHeight: 1400,
        useWebWorker: true,
        fileType: "image/webp"
      };

      let fileToUpload = file;
      try {
        const compressedBlob = await imageCompression(file, compressionOptions);
        fileToUpload = new File([compressedBlob], `hero_mockup_${Date.now()}.webp`, { type: "image/webp" });
      } catch (compressErr) {
        console.warn("Compressão client-side falhou, usando arquivo original:", compressErr);
      }

      // 3. Upload para o Supabase Storage via Server Action
      setUploadStatus("Enviando arquivo otimizado para o servidor...");
      const formData = new FormData();
      formData.append("file", fileToUpload);

      const res = await uploadHeroMockup(formData);
      if (res.success && res.publicUrl) {
        setForm((prev: any) => ({ ...prev, hero_mockup_url: res.publicUrl }));
      } else {
        setUploadError(res.error || "Erro ao salvar a imagem no servidor.");
      }
    } catch (err: any) {
      console.error("Upload error:", err);
      setUploadError("Ocorreu uma falha no processamento do arquivo.");
    } finally {
      setUploading(false);
      setUploadStatus("");
    }
  }

  const currentMockupUrl = form.hero_mockup_url || "/hero_mockup.png";

  return (
    <div className="space-y-8">
      {/* 🖼️ CARD 1: UPLOAD DUPLO DE LOGOS DO HEADER (TEMA CLARO & ESCURO) */}
      <div className="bg-[var(--dash-surface)] border border-[var(--dash-border)] rounded-2xl p-6 sm:p-8 shadow-sm">
        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-[var(--dash-border)]">
          <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-500">
            <Layout size={22} />
          </div>
          <div>
            <h2 className="text-lg font-bold text-[var(--dash-text-primary)]">Logos Oficiais do Header (Tema Escuro & Claro)</h2>
            <p className="text-xs text-[var(--dash-text-secondary)]">Envie as logos da marca para cada modo de exibição. O sistema comprimirá e aplicará WebP automaticamente.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Logo Tema Escuro */}
          <div className="border border-[var(--dash-border)] rounded-2xl p-5 bg-[#0a0a0a] text-white shadow-md flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 text-zinc-200">
                  <Moon size={14} className="text-emerald-400" /> Logo Tema Escuro
                </span>
                <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400">Modo Escuro</span>
              </div>
              <div className="h-24 rounded-xl bg-black border border-white/10 flex items-center justify-center p-3 mb-4 relative overflow-hidden">
                <img 
                  src={form.logo_url_dark || "/logo_fundo_escuro_ps.png"} 
                  alt="Logo Tema Escuro" 
                  className="max-h-12 object-contain"
                />
              </div>
              <div className="space-y-2">
                <label className="block text-[11px] font-medium text-zinc-400">URL Direta da Imagem (Opcional)</label>
                <input 
                  type="text" 
                  placeholder="https://..."
                  value={form.logo_url_dark || ""}
                  onChange={(e) => setForm({...form, logo_url_dark: e.target.value})}
                  className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-xs text-white outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-zinc-800">
              <input 
                ref={darkLogoInputRef} 
                type="file" 
                accept="image/*" 
                className="hidden" 
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) processLogoUpload(f, 'dark');
                }}
              />
              <button 
                type="button"
                onClick={() => darkLogoInputRef.current?.click()}
                disabled={uploadingLogoDark}
                className="w-full py-2.5 px-4 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-colors shadow-sm"
              >
                {uploadingLogoDark ? <Loader2 size={14} className="animate-spin" /> : <UploadCloud size={16} />}
                {uploadingLogoDark ? "Enviando..." : "Upload Logo Tema Escuro"}
              </button>
            </div>
          </div>

          {/* Logo Tema Claro */}
          <div className="border border-[var(--dash-border)] rounded-2xl p-5 bg-zinc-50 text-zinc-900 shadow-md flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 text-zinc-800">
                  <Sun size={14} className="text-amber-500" /> Logo Tema Claro
                </span>
                <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-amber-500/20 text-amber-600">Modo Claro</span>
              </div>
              <div className="h-24 rounded-xl bg-white border border-zinc-200 flex items-center justify-center p-3 mb-4 relative overflow-hidden shadow-sm">
                <img 
                  src={form.logo_url_light || form.logo_url_dark || "/logo_fundo_escuro_ps.png"} 
                  alt="Logo Tema Claro" 
                  className={`max-h-12 object-contain ${!form.logo_url_light && !form.logo_url_dark ? "invert brightness-0" : ""}`}
                />
              </div>
              <div className="space-y-2">
                <label className="block text-[11px] font-medium text-zinc-600">URL Direta da Imagem (Opcional)</label>
                <input 
                  type="text" 
                  placeholder="https://..."
                  value={form.logo_url_light || ""}
                  onChange={(e) => setForm({...form, logo_url_light: e.target.value})}
                  className="w-full bg-white border border-zinc-300 rounded-lg px-3 py-2 text-xs text-zinc-900 outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-zinc-200">
              <input 
                ref={lightLogoInputRef} 
                type="file" 
                accept="image/*" 
                className="hidden" 
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) processLogoUpload(f, 'light');
                }}
              />
              <button 
                type="button"
                onClick={() => lightLogoInputRef.current?.click()}
                disabled={uploadingLogoLight}
                className="w-full py-2.5 px-4 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-colors shadow-sm"
              >
                {uploadingLogoLight ? <Loader2 size={14} className="animate-spin" /> : <UploadCloud size={16} />}
                {uploadingLogoLight ? "Enviando..." : "Upload Logo Tema Claro"}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 🚀 CARD 2: PERSONALIZAÇÃO DO HERO & SEO */}
      <div className="bg-[var(--dash-surface)] border border-[var(--dash-border)] rounded-2xl p-6 sm:p-8 shadow-sm">
        {/* Header do Card */}
        <div className="flex items-center gap-3 mb-8 pb-4 border-b border-[var(--dash-border)]">
          <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-500">
            <Sparkles size={22} />
          </div>
          <div>
            <h2 className="text-lg font-bold text-[var(--dash-text-primary)]">Personalização do Hero & SEO</h2>
            <p className="text-xs text-[var(--dash-text-secondary)]">Edite a chamada principal na esquerda e gerencie a imagem do Mockup com compressão e conversão WebP na direita.</p>
          </div>
        </div>

      {/* Grid de 2 Colunas */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* 👈 COLUNA 1 (Esquerda - 7 Colunas): Formulário de Textos & SEO */}
        <div className="lg:col-span-7 space-y-6">
          <div>
            <label className="block text-xs font-bold text-[var(--dash-text-secondary)] mb-2 uppercase tracking-wider">
              Título Principal (Headline do Hero)
            </label>
            <input 
              type="text" 
              value={form.hero_headline}
              onChange={(e) => setForm({...form, hero_headline: e.target.value})}
              className="w-full bg-[var(--dash-input-bg)] border border-[var(--dash-border)] rounded-xl px-4 py-3 text-sm text-[var(--dash-text-primary)] focus:border-emerald-500 outline-none transition-colors font-medium"
              placeholder="Ex: Chega de catálogos PDFs desatualizados..."
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[var(--dash-text-secondary)] mb-2 uppercase tracking-wider">
              Subtítulo (Descrição do Hero)
            </label>
            <textarea 
              rows={4}
              value={form.hero_subtitle}
              onChange={(e) => setForm({...form, hero_subtitle: e.target.value})}
              className="w-full bg-[var(--dash-input-bg)] border border-[var(--dash-border)] rounded-xl px-4 py-3 text-sm text-[var(--dash-text-primary)] focus:border-emerald-500 outline-none transition-colors leading-relaxed font-medium"
              placeholder="Ex: Crie uma vitrine premium para sua empresa..."
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[var(--dash-text-secondary)] mb-2 uppercase tracking-wider">
              Meta Title (Título para SEO no Google)
            </label>
            <input 
              type="text" 
              value={form.seo_title}
              onChange={(e) => setForm({...form, seo_title: e.target.value})}
              className="w-full bg-[var(--dash-input-bg)] border border-[var(--dash-border)] rounded-xl px-4 py-3 text-sm text-[var(--dash-text-primary)] focus:border-emerald-500 outline-none transition-colors font-medium"
              placeholder="Ex: PlataformaShop | Cartão e Catálogo Digital Premium"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[var(--dash-text-secondary)] mb-2 uppercase tracking-wider flex items-center gap-1.5">
              <LinkIcon size={14} className="text-emerald-500" />
              URL Direta da Imagem Mockup (Opcional)
            </label>
            <input 
              type="text" 
              placeholder="https://..."
              value={form.hero_mockup_url || ""}
              onChange={(e) => setForm({...form, hero_mockup_url: e.target.value})}
              className="w-full bg-[var(--dash-input-bg)] border border-[var(--dash-border)] rounded-xl px-4 py-2.5 text-xs text-[var(--dash-text-primary)] focus:border-emerald-500 outline-none transition-colors"
            />
            <span className="text-[10px] text-[var(--dash-text-muted)] mt-1 block">
              Se deixado em branco ou se enviar um arquivo ao lado, o sistema usará a imagem otimizada.
            </span>
          </div>

          <div className="pt-4 border-t border-[var(--dash-border)]">
            <button 
              onClick={handleSave}
              disabled={saving}
              className="w-full sm:w-auto px-8 py-3 bg-emerald-500 text-white font-bold rounded-xl hover:bg-emerald-600 transition-colors flex items-center justify-center min-w-[180px] shadow-md active:scale-95 text-sm"
            >
              {saving ? <Loader2 size={18} className="animate-spin" /> : "Salvar Alterações"}
            </button>
          </div>
        </div>

        {/* 👉 COLUNA 2 (Direita - 5 Colunas): Upload & Otimização do Mockup */}
        <div className="lg:col-span-5 flex flex-col space-y-4">
          <div className="flex items-center justify-between px-1">
            <span className="text-xs font-bold text-[var(--dash-text-secondary)] uppercase tracking-wider flex items-center gap-1.5">
              <ImageIcon size={16} className="text-emerald-500" />
              Mockup Principal (Hero)
            </span>
            {form.hero_mockup_url ? (
              <span className="text-[10px] text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20 flex items-center gap-1">
                <CheckCircle2 size={12} /> Customizado WebP
              </span>
            ) : (
              <span className="text-[10px] text-zinc-400 font-bold bg-zinc-800 px-2 py-0.5 rounded border border-zinc-700">
                Padrão do Sistema
              </span>
            )}
          </div>

          {/* Especificação Exata de Dimensões (Alto Contraste) */}
          <div className="bg-[#0A0A0A] border border-emerald-500/40 rounded-xl p-3 flex items-center justify-between text-xs shadow-md">
            <div className="flex items-center gap-2 text-emerald-400 font-bold">
              <Maximize2 size={14} className="shrink-0 text-emerald-400" />
              <span>Resolução Recomendada:</span>
            </div>
            <span className="font-black text-emerald-400 bg-emerald-500/20 px-2.5 py-1 rounded-lg border border-emerald-500/50 text-xs tracking-wide shadow-sm">
              1200 x 900 px
            </span>
          </div>

          {/* Área Interativa de Upload / Dropzone */}
          <div 
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className="relative border-2 border-dashed border-emerald-500/30 bg-emerald-500/5 hover:border-emerald-500 hover:bg-emerald-500/10 transition-all rounded-2xl p-6 flex flex-col items-center text-center cursor-pointer group shadow-sm min-h-[200px] justify-center"
          >
            <input 
              ref={fileInputRef} 
              type="file" 
              accept="image/*" 
              onChange={handleFileChange} 
              className="hidden" 
            />

            {uploading ? (
              <div className="flex flex-col items-center gap-3 py-4">
                <Cpu size={32} className="animate-spin text-emerald-500" />
                <span className="text-xs font-bold text-emerald-400 animate-pulse">{uploadStatus || "Processando imagem..."}</span>
                <span className="text-[10px] text-zinc-400">Comprimindo & convertendo em WebP de alta fidelidade...</span>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2">
                <div className="p-3 rounded-full bg-emerald-500/10 text-emerald-500 group-hover:scale-110 transition-transform">
                  <UploadCloud size={28} />
                </div>
                <span className="text-sm font-bold text-[var(--dash-text-primary)]">
                  Arraste ou clique para enviar foto
                </span>
                <span className="text-xs text-[var(--dash-text-muted)]">
                  Aceita PNG, JPG ou WebP (Conversão e Compressão Automática)
                </span>
              </div>
            )}
          </div>

          {uploadError && (
            <p className="text-xs font-bold text-red-400 text-center bg-red-500/10 p-2 rounded-lg border border-red-500/20">
              {uploadError}
            </p>
          )}

          {/* Preview ao Vivo com Indicador Exato em Pixels */}
          <div className="bg-[#0A0A0A] border border-zinc-800 rounded-2xl p-4 shadow-xl flex flex-col items-center justify-center">
            <div className="w-full flex items-center justify-between mb-3 px-1">
              <span className="text-[10px] font-extrabold uppercase text-zinc-500 tracking-wider">
                Preview da Imagem do Hero
              </span>
              {fileDimensions && (
                <span className="text-[10px] font-bold text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/20 flex items-center gap-1">
                  📐 Mídia Real: {fileDimensions.width} x {fileDimensions.height} px
                </span>
              )}
            </div>
            
            <div className="relative w-full max-h-56 flex items-center justify-center overflow-hidden rounded-xl bg-black/40 border border-zinc-800/80 p-2">
              <img 
                src={currentMockupUrl} 
                alt="Mockup Hero"
                className="max-h-48 w-auto object-contain drop-shadow-2xl transition-all hover:scale-105"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = "/hero_mockup.png";
                }}
              />
            </div>

            {form.hero_mockup_url && (
              <button 
                type="button"
                onClick={() => {
                  setForm({ ...form, hero_mockup_url: "" });
                  setFileDimensions(null);
                }}
                className="mt-3 text-xs text-red-400 hover:text-red-300 font-bold flex items-center gap-1 px-3 py-1.5 rounded-lg hover:bg-red-500/10 transition-colors"
              >
                <Trash2 size={14} /> Restaurar Imagem Padrão
              </button>
            )}
          </div>

        </div>

      </div>
    </div>
  </div>
);
}
