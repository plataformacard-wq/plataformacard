"use client";

import { useState, useRef } from "react";
import { Loader2, Sparkles, UploadCloud, Image as ImageIcon, Trash2, CheckCircle2, Link as LinkIcon, Maximize2, Cpu, Moon, Sun, Layout, Download } from "lucide-react";
import imageCompression from "browser-image-compression";
import { updateLandingSettings, uploadHeroMockup, uploadHeaderLogo } from "../actions";

export function HeroClient({ initialSettings }: { initialSettings: any }) {
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadingLogoDark, setUploadingLogoDark] = useState(false);
  const [uploadingLogoLight, setUploadingLogoLight] = useState(false);
  const [uploadingMockupDark, setUploadingMockupDark] = useState(false);
  const [uploadingMockupLight, setUploadingMockupLight] = useState(false);
  const darkLogoInputRef = useRef<HTMLInputElement>(null);
  const lightLogoInputRef = useRef<HTMLInputElement>(null);
  const darkMockupInputRef = useRef<HTMLInputElement>(null);
  const lightMockupInputRef = useRef<HTMLInputElement>(null);

  function handleDownloadImage(url: string, filename: string) {
    if (!url) {
      alert("Nenhuma imagem disponível para download.");
      return;
    }
    fetch(url)
      .then((response) => response.blob())
      .then((blob) => {
        const blobUrl = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = blobUrl;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(blobUrl);
      })
      .catch(() => {
        window.open(url, "_blank");
      });
  }

  const [form, setForm] = useState(initialSettings || {
    hero_headline: "Venda mais com o catálogo digital perfeito",
    hero_subtitle: "Crie uma vitrine premium para sua empresa, distribuidora ou força de vendas em minutos.",
    seo_title: "PlataformaShop | Catálogo Digital Premium",
    hero_mockup_url: initialSettings?.hero_mockup_url || "",
    hero_mockup_url_light: initialSettings?.hero_mockup_url_light || "",
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
        alert("Configurações do Hero & SEO salvas com sucesso!");
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

  async function processMockupUpload(file: File, themeType: 'dark' | 'light') {
    if (!file.type.startsWith("image/")) {
      alert("Selecione um arquivo de imagem válido.");
      return;
    }

    if (themeType === 'dark') setUploadingMockupDark(true);
    else setUploadingMockupLight(true);

    try {
      let fileToUpload = file;
      try {
        const compressedBlob = await imageCompression(file, {
          maxSizeMB: 0.8,
          maxWidthOrHeight: 1400,
          useWebWorker: true,
          fileType: "image/webp"
        });
        fileToUpload = new File([compressedBlob], `hero_mockup_${themeType}_${Date.now()}.webp`, { type: "image/webp" });
      } catch (err) {
        console.warn("Compressão de mockup falhou, usando original:", err);
      }

      const formData = new FormData();
      formData.append("file", fileToUpload);
      const res = await uploadHeroMockup(formData, themeType);

      if (res.success && res.publicUrl) {
        setForm((prev: any) => ({
          ...prev,
          [themeType === 'dark' ? 'hero_mockup_url' : 'hero_mockup_url_light']: res.publicUrl
        }));
        alert(`Mockup Hero (${themeType === 'dark' ? 'Tema Escuro' : 'Tema Claro'}) enviado com sucesso! Clique em "Salvar Alterações" para publicar.`);
      } else {
        alert(res.error || "Erro ao fazer upload do mockup.");
      }
    } catch (e) {
      alert("Erro ao enviar imagem.");
    } finally {
      if (themeType === 'dark') setUploadingMockupDark(false);
      else setUploadingMockupLight(false);
    }
  }

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

            <div className="mt-4 pt-3 border-t border-zinc-800 flex items-center gap-2">
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
                className="flex-1 py-2.5 px-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors shadow-sm"
              >
                {uploadingLogoDark ? <Loader2 size={14} className="animate-spin" /> : <UploadCloud size={15} />}
                {uploadingLogoDark ? "Enviando..." : "Upload Logo Escura"}
              </button>
              <button
                type="button"
                onClick={() => handleDownloadImage(form.logo_url_dark || "/logo_fundo_escuro_ps.png", "logo_tema_escuro.png")}
                className="py-2.5 px-3 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors shadow-sm"
                title="Baixar Logo Tema Escuro"
              >
                <Download size={15} />
                <span>Baixar</span>
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

            <div className="mt-4 pt-3 border-t border-zinc-200 flex items-center gap-2">
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
                className="flex-1 py-2.5 px-3 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors shadow-sm"
              >
                {uploadingLogoLight ? <Loader2 size={14} className="animate-spin" /> : <UploadCloud size={15} />}
                {uploadingLogoLight ? "Enviando..." : "Upload Logo Clara"}
              </button>
              <button
                type="button"
                onClick={() => handleDownloadImage(form.logo_url_light || form.logo_url_dark || "/logo_fundo_escuro_ps.png", "logo_tema_claro.png")}
                className="py-2.5 px-3 bg-white hover:bg-zinc-100 text-zinc-700 border border-zinc-300 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors shadow-sm"
                title="Baixar Logo Tema Claro"
              >
                <Download size={15} />
                <span>Baixar</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 📱 CARD 2: UPLOAD DUPLO DE MOCKUPS DO HERO (TEMA CLARO & ESCURO) */}
      <div className="bg-[var(--dash-surface)] border border-[var(--dash-border)] rounded-2xl p-6 sm:p-8 shadow-sm">
        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-[var(--dash-border)]">
          <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-500">
            <ImageIcon size={22} />
          </div>
          <div>
            <h2 className="text-lg font-bold text-[var(--dash-text-primary)]">Mockups Oficiais do Hero (Tema Escuro & Claro)</h2>
            <p className="text-xs text-[var(--dash-text-secondary)]">Envie as imagens de mockup do Hero para alternância dinâmica conforme o tema ativo da Landing Page.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Mockup Tema Escuro */}
          <div className="border border-[var(--dash-border)] rounded-2xl p-5 bg-[#0a0a0a] text-white shadow-md flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 text-zinc-200">
                  <Moon size={14} className="text-emerald-400" /> Mockup Tema Escuro
                </span>
                <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400">Modo Escuro</span>
              </div>
              
              <div className="h-44 rounded-xl bg-black border border-white/10 flex items-center justify-center p-3 mb-4 relative overflow-hidden">
                <img 
                  src={form.hero_mockup_url || "/hero_mockup.png"} 
                  alt="Mockup Tema Escuro" 
                  className="max-h-36 w-auto object-contain drop-shadow-xl"
                  onError={(e) => { (e.target as HTMLImageElement).src = "/hero_mockup.png"; }}
                />
              </div>

              <div className="space-y-2">
                <label className="block text-[11px] font-medium text-zinc-400">URL Direta da Imagem (Opcional)</label>
                <input 
                  type="text" 
                  placeholder="https://..."
                  value={form.hero_mockup_url || ""}
                  onChange={(e) => setForm({...form, hero_mockup_url: e.target.value})}
                  className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-xs text-white outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-zinc-800 flex items-center gap-2">
              <input 
                ref={darkMockupInputRef} 
                type="file" 
                accept="image/*" 
                className="hidden" 
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) processMockupUpload(f, 'dark');
                }}
              />
              <button 
                type="button"
                onClick={() => darkMockupInputRef.current?.click()}
                disabled={uploadingMockupDark}
                className="flex-1 py-2.5 px-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors shadow-sm"
              >
                {uploadingMockupDark ? <Loader2 size={14} className="animate-spin" /> : <UploadCloud size={15} />}
                {uploadingMockupDark ? "Enviando..." : "Upload Mockup Escuro"}
              </button>
              <button
                type="button"
                onClick={() => handleDownloadImage(form.hero_mockup_url || "/hero_mockup.png", "mockup_hero_dark.png")}
                className="py-2.5 px-3 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors shadow-sm"
                title="Baixar Mockup Tema Escuro"
              >
                <Download size={15} />
                <span>Baixar</span>
              </button>
            </div>
          </div>

          {/* Mockup Tema Claro */}
          <div className="border border-[var(--dash-border)] rounded-2xl p-5 bg-zinc-50 text-zinc-900 shadow-md flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 text-zinc-800">
                  <Sun size={14} className="text-amber-500" /> Mockup Tema Claro
                </span>
                <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-amber-500/20 text-amber-600">Modo Claro</span>
              </div>
              
              <div className="h-44 rounded-xl bg-white border border-zinc-200 flex items-center justify-center p-3 mb-4 relative overflow-hidden shadow-sm">
                <img 
                  src={form.hero_mockup_url_light || form.hero_mockup_url || "/hero_mockup.png"} 
                  alt="Mockup Tema Claro" 
                  className="max-h-36 w-auto object-contain drop-shadow-md"
                  onError={(e) => { (e.target as HTMLImageElement).src = "/hero_mockup.png"; }}
                />
              </div>

              <div className="space-y-2">
                <label className="block text-[11px] font-medium text-zinc-600">URL Direta da Imagem (Opcional)</label>
                <input 
                  type="text" 
                  placeholder="https://..."
                  value={form.hero_mockup_url_light || ""}
                  onChange={(e) => setForm({...form, hero_mockup_url_light: e.target.value})}
                  className="w-full bg-white border border-zinc-300 rounded-lg px-3 py-2 text-xs text-zinc-900 outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-zinc-200 flex items-center gap-2">
              <input 
                ref={lightMockupInputRef} 
                type="file" 
                accept="image/*" 
                className="hidden" 
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) processMockupUpload(f, 'light');
                }}
              />
              <button 
                type="button"
                onClick={() => lightMockupInputRef.current?.click()}
                disabled={uploadingMockupLight}
                className="flex-1 py-2.5 px-3 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors shadow-sm"
              >
                {uploadingMockupLight ? <Loader2 size={14} className="animate-spin" /> : <UploadCloud size={15} />}
                {uploadingMockupLight ? "Enviando..." : "Upload Mockup Claro"}
              </button>
              <button
                type="button"
                onClick={() => handleDownloadImage(form.hero_mockup_url_light || form.hero_mockup_url || "/hero_mockup.png", "mockup_hero_light.png")}
                className="py-2.5 px-3 bg-white hover:bg-zinc-100 text-zinc-700 border border-zinc-300 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors shadow-sm"
                title="Baixar Mockup Tema Claro"
              >
                <Download size={15} />
                <span>Baixar</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 🚀 CARD 3: PERSONALIZAÇÃO DE TEXTOS & SEO DO HERO */}
      <div className="bg-[var(--dash-surface)] border border-[var(--dash-border)] rounded-2xl p-6 sm:p-8 shadow-sm">
        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-[var(--dash-border)]">
          <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-500">
            <Sparkles size={22} />
          </div>
          <div>
            <h2 className="text-lg font-bold text-[var(--dash-text-primary)]">Textos & SEO da Chamada Principal (Hero)</h2>
            <p className="text-xs text-[var(--dash-text-secondary)]">Edite a mensagem de impacto, subtítulo persuasivo e título otimizado para buscadores (Google).</p>
          </div>
        </div>

        <div className="space-y-6">
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
              rows={3}
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

          <div className="pt-4 border-t border-[var(--dash-border)] flex items-center justify-end">
            <button 
              onClick={handleSave}
              disabled={saving}
              className="w-full sm:w-auto px-8 py-3.5 bg-emerald-500 text-white font-bold rounded-xl hover:bg-emerald-600 transition-colors flex items-center justify-center min-w-[200px] shadow-md active:scale-95 text-sm"
            >
              {saving ? <Loader2 size={18} className="animate-spin" /> : "Salvar Alterações"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
