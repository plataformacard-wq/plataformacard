"use client";

import { useRef } from "react";
import { Loader2, UploadCloud, Layout, Moon, Sun, Download } from "lucide-react";

interface HeaderLogosSectionProps {
  form: any;
  setForm: React.Dispatch<React.SetStateAction<any>>;
  uploadingLogoDark: boolean;
  uploadingLogoLight: boolean;
  processLogoUpload: (file: File, themeType: 'dark' | 'light') => Promise<void>;
  handleDownloadImage: (url: string, filename: string) => void;
}

export function HeaderLogosSection({
  form,
  setForm,
  uploadingLogoDark,
  uploadingLogoLight,
  processLogoUpload,
  handleDownloadImage,
}: HeaderLogosSectionProps) {
  const darkLogoInputRef = useRef<HTMLInputElement>(null);
  const lightLogoInputRef = useRef<HTMLInputElement>(null);

  return (
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
  );
}
