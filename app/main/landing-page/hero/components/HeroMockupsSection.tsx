"use client";

import { useRef } from "react";
import { Loader2, UploadCloud, Image as ImageIcon, Moon, Sun, Download, Trash2, Clock } from "lucide-react";
import { updateLandingSettings } from "../../actions";

interface HeroMockupsSectionProps {
  form: any;
  setForm: React.Dispatch<React.SetStateAction<any>>;
  uploadingMockupDark: boolean;
  uploadingMockupLight: boolean;
  processMockupUpload: (file: File, themeType: 'dark' | 'light') => Promise<void>;
  handleDownloadImage: (url: string, filename: string) => void;
}

export function HeroMockupsSection({
  form,
  setForm,
  uploadingMockupDark,
  uploadingMockupLight,
  processMockupUpload,
  handleDownloadImage,
}: HeroMockupsSectionProps) {
  const darkMockupInputRef = useRef<HTMLInputElement>(null);
  const lightMockupInputRef = useRef<HTMLInputElement>(null);

  const darkImages: string[] = Array.isArray(form.hero_mockups_dark) && form.hero_mockups_dark.length > 0
    ? form.hero_mockups_dark
    : (form.hero_mockup_url ? [form.hero_mockup_url] : []);

  const lightImages: string[] = Array.isArray(form.hero_mockups_light) && form.hero_mockups_light.length > 0
    ? form.hero_mockups_light
    : (form.hero_mockup_url_light ? [form.hero_mockup_url_light] : []);

  async function handleRemoveImage(indexToRemove: number, themeType: 'dark' | 'light') {
    const fieldKey = themeType === 'dark' ? 'hero_mockups_dark' : 'hero_mockups_light';
    const currentList: string[] = themeType === 'dark' ? darkImages : lightImages;
    const updatedList = currentList.filter((_, idx) => idx !== indexToRemove);

    const updatedForm = {
      ...form,
      [fieldKey]: updatedList,
      [themeType === 'dark' ? 'hero_mockup_url' : 'hero_mockup_url_light']: updatedList[0] || null
    };

    setForm(updatedForm);
    const res = await updateLandingSettings(updatedForm);
    if (res?.error) {
      alert("Erro ao excluir imagem: " + res.error);
    }
  }

  async function handleIntervalChange(newIntervalMs: number) {
    const updatedForm = {
      ...form,
      hero_carousel_interval: newIntervalMs
    };
    setForm(updatedForm);
    await updateLandingSettings(updatedForm);
  }

  return (
    <div className="bg-[var(--dash-surface)] border border-[var(--dash-border)] rounded-2xl p-6 sm:p-8 shadow-sm space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[var(--dash-border)]">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-500">
            <ImageIcon size={22} />
          </div>
          <div>
            <h2 className="text-lg font-bold text-[var(--dash-text-primary)]">Carrossel de Mockups do Hero (Modo Escuro & Claro)</h2>
            <p className="text-xs text-[var(--dash-text-secondary)]">Gerencie as imagens que irão rotacionar automaticamente no topo da Landing Page.</p>
          </div>
        </div>

        {/* Configuração do Tempo de Rotação */}
        <div className="flex items-center gap-2 bg-[var(--dash-input-bg)] border border-[var(--dash-border)] rounded-xl px-3 py-2 text-xs">
          <Clock size={16} className="text-emerald-500" />
          <span className="font-semibold text-[var(--dash-text-secondary)]">Tempo de Rotação:</span>
          <select 
            value={form.hero_carousel_interval || 4000}
            onChange={(e) => handleIntervalChange(Number(e.target.value))}
            className="dash-select bg-transparent font-bold text-emerald-500 outline-none cursor-pointer pl-1 py-0.5"
          >
            <option value={3000}>3 segundos</option>
            <option value={4000}>4 segundos (Padrão)</option>
            <option value={5000}>5 segundos</option>
            <option value={6000}>6 segundos</option>
            <option value={8000}>8 segundos</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* GALERIA TEMA ESCURO */}
        <div className="border border-[var(--dash-border)] rounded-2xl p-5 bg-[#0a0a0a] text-white shadow-md flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 text-zinc-200">
                <Moon size={14} className="text-emerald-400" /> Carrossel Tema Escuro ({darkImages.length})
              </span>
              <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400">Modo Escuro</span>
            </div>

            {/* Grid de Thumbnails */}
            {darkImages.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-4">
                {darkImages.map((imgUrl, idx) => (
                  <div key={idx} className="relative group rounded-xl bg-black border border-white/10 overflow-hidden aspect-square flex items-center justify-center p-2">
                    <img 
                      src={imgUrl} 
                      alt={`Mockup Escuro ${idx + 1}`} 
                      className="max-h-full max-w-full object-contain" 
                      onError={(e) => { (e.target as HTMLImageElement).src = "/hero_mockup.png"; }}
                    />
                    <span className="absolute top-1 left-1 bg-black/80 text-[10px] text-zinc-300 font-bold px-1.5 py-0.5 rounded">
                      #{idx + 1}
                    </span>
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleDownloadImage(imgUrl, `mockup_dark_${idx + 1}.png`)}
                        className="p-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded-lg text-xs"
                        title="Baixar"
                      >
                        <Download size={14} />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleRemoveImage(idx, 'dark')}
                        className="p-1.5 bg-rose-500/80 hover:bg-rose-600 text-white rounded-lg text-xs"
                        title="Excluir da Galeria"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="h-36 rounded-xl bg-black/50 border border-dashed border-white/10 flex flex-col items-center justify-center p-4 text-center text-xs text-zinc-500 mb-4">
                <ImageIcon size={24} className="mb-2 text-zinc-600" />
                Nenhum mockup adicionado. O sistema exibirá a imagem padrão.
              </div>
            )}
          </div>

          <div className="pt-3 border-t border-zinc-800 flex items-center gap-2">
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
              className="w-full py-2.5 px-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors shadow-sm"
            >
              {uploadingMockupDark ? <Loader2 size={14} className="animate-spin" /> : <UploadCloud size={15} />}
              {uploadingMockupDark ? "Enviando Imagem..." : "+ Adicionar Mockup Escuro"}
            </button>
          </div>
        </div>

        {/* GALERIA TEMA CLARO */}
        <div className="border border-[var(--dash-border)] rounded-2xl p-5 bg-zinc-50 text-zinc-900 shadow-md flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 text-zinc-800">
                <Sun size={14} className="text-amber-500" /> Carrossel Tema Claro ({lightImages.length})
              </span>
              <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-amber-500/20 text-amber-600">Modo Claro</span>
            </div>

            {/* Grid de Thumbnails */}
            {lightImages.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-4">
                {lightImages.map((imgUrl, idx) => (
                  <div key={idx} className="relative group rounded-xl bg-white border border-zinc-200 shadow-sm overflow-hidden aspect-square flex items-center justify-center p-2">
                    <img 
                      src={imgUrl} 
                      alt={`Mockup Claro ${idx + 1}`} 
                      className="max-h-full max-w-full object-contain" 
                      onError={(e) => { (e.target as HTMLImageElement).src = "/hero_mockup.png"; }}
                    />
                    <span className="absolute top-1 left-1 bg-white/90 text-[10px] text-zinc-800 font-bold px-1.5 py-0.5 rounded shadow-sm border border-zinc-200">
                      #{idx + 1}
                    </span>
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleDownloadImage(imgUrl, `mockup_light_${idx + 1}.png`)}
                        className="p-1.5 bg-white text-zinc-800 hover:bg-zinc-100 rounded-lg text-xs"
                        title="Baixar"
                      >
                        <Download size={14} />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleRemoveImage(idx, 'light')}
                        className="p-1.5 bg-rose-500 hover:bg-rose-600 text-white rounded-lg text-xs"
                        title="Excluir da Galeria"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="h-36 rounded-xl bg-white border border-dashed border-zinc-300 flex flex-col items-center justify-center p-4 text-center text-xs text-zinc-400 mb-4">
                <ImageIcon size={24} className="mb-2 text-zinc-400" />
                Nenhum mockup adicionado. O sistema exibirá o tema escuro/padrão.
              </div>
            )}
          </div>

          <div className="pt-3 border-t border-zinc-200 flex items-center gap-2">
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
              className="w-full py-2.5 px-3 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors shadow-sm"
            >
              {uploadingMockupLight ? <Loader2 size={14} className="animate-spin" /> : <UploadCloud size={15} />}
              {uploadingMockupLight ? "Enviando Imagem..." : "+ Adicionar Mockup Claro"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
