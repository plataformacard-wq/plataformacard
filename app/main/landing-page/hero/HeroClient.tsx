"use client";

import { useState, useRef } from "react";
import { Loader2, Sparkles, UploadCloud, Image as ImageIcon, Trash2, CheckCircle2, Link as LinkIcon } from "lucide-react";
import { updateLandingSettings, uploadHeroMockup } from "../actions";

export function HeroClient({ initialSettings }: { initialSettings: any }) {
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState(initialSettings || {
    hero_headline: "Venda mais com o catálogo digital perfeito",
    hero_subtitle: "Crie uma vitrine premium para sua empresa, distribuidora ou força de vendas em minutos.",
    seo_title: "PlataformaShop | Catálogo Digital Premium",
    hero_mockup_url: "",
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

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await uploadHeroMockup(formData);
      if (res.success && res.publicUrl) {
        setForm((prev: any) => ({ ...prev, hero_mockup_url: res.publicUrl }));
      } else {
        setUploadError(res.error || "Erro ao fazer upload da imagem.");
      }
    } catch (err: any) {
      setUploadError("Falha na transmissão do arquivo.");
    } finally {
      setUploading(false);
    }
  }

  const currentMockupUrl = form.hero_mockup_url || "/hero_mockup.png";

  return (
    <div className="bg-[var(--dash-surface)] border border-[var(--dash-border)] rounded-2xl p-6 sm:p-8 shadow-sm">
      
      {/* Header do Card */}
      <div className="flex items-center gap-3 mb-8 pb-4 border-b border-[var(--dash-border)]">
        <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-500">
          <Sparkles size={22} />
        </div>
        <div>
          <h2 className="text-lg font-bold text-[var(--dash-text-primary)]">Personalização do Hero & SEO</h2>
          <p className="text-xs text-[var(--dash-text-secondary)]">Edite a chamada principal na esquerda e gerencie a imagem do Mockup na direita.</p>
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
              Se deixado em branco ou se enviar um arquivo ao lado, o sistema usará a imagem carregada.
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

        {/* 👉 COLUNA 2 (Direita - 5 Colunas): Upload & Preview do Mockup */}
        <div className="lg:col-span-5 flex flex-col space-y-4">
          <div className="flex items-center justify-between px-1">
            <span className="text-xs font-bold text-[var(--dash-text-secondary)] uppercase tracking-wider flex items-center gap-1.5">
              <ImageIcon size={16} className="text-emerald-500" />
              Mockup Principal (Hero)
            </span>
            {form.hero_mockup_url ? (
              <span className="text-[10px] text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20 flex items-center gap-1">
                <CheckCircle2 size={12} /> Customizado
              </span>
            ) : (
              <span className="text-[10px] text-zinc-400 font-bold bg-zinc-800 px-2 py-0.5 rounded border border-zinc-700">
                Padrão do Sistema
              </span>
            )}
          </div>

          {/* Área Interativa de Upload / Dropzone */}
          <div 
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className="relative border-2 border-dashed border-emerald-500/30 bg-emerald-500/5 hover:border-emerald-500 hover:bg-emerald-500/10 transition-all rounded-2xl p-6 flex flex-col items-center text-center cursor-pointer group shadow-sm min-h-[220px] justify-center"
          >
            <input 
              ref={fileInputRef} 
              type="file" 
              accept="image/*" 
              onChange={handleFileChange} 
              className="hidden" 
            />

            {uploading ? (
              <div className="flex flex-col items-center gap-3 py-6">
                <Loader2 size={32} className="animate-spin text-emerald-500" />
                <span className="text-xs font-bold text-emerald-400">Enviando imagem...</span>
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
                  Recomendado: PNG ou WebP com fundo transparente (Até 5MB)
                </span>
              </div>
            )}
          </div>

          {uploadError && (
            <p className="text-xs font-bold text-red-400 text-center bg-red-500/10 p-2 rounded-lg border border-red-500/20">
              {uploadError}
            </p>
          )}

          {/* Preview ao Vivo do Mockup */}
          <div className="bg-[#0A0A0A] border border-zinc-800 rounded-2xl p-4 shadow-xl flex flex-col items-center justify-center">
            <span className="text-[10px] font-extrabold uppercase text-zinc-500 tracking-wider mb-3">
              Preview da Imagem do Hero
            </span>
            
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
                onClick={() => setForm({ ...form, hero_mockup_url: "" })}
                className="mt-3 text-xs text-red-400 hover:text-red-300 font-bold flex items-center gap-1 px-3 py-1.5 rounded-lg hover:bg-red-500/10 transition-colors"
              >
                <Trash2 size={14} /> Restaurar Imagem Padrão
              </button>
            )}
          </div>

        </div>

      </div>
    </div>
  );
}
