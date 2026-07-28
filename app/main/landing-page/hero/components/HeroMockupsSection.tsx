"use client";

import { useRef } from "react";
import { Loader2, UploadCloud, Image as ImageIcon, Moon, Sun, Download } from "lucide-react";

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

  return (
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
  );
}
