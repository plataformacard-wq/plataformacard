"use client";

import { Loader2, Sparkles } from "lucide-react";

interface HeroTextsSectionProps {
  form: any;
  setForm: React.Dispatch<React.SetStateAction<any>>;
  saving: boolean;
  handleSave: () => Promise<void>;
}

export function HeroTextsSection({
  form,
  setForm,
  saving,
  handleSave,
}: HeroTextsSectionProps) {
  return (
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

        {/* Configurações do Carrossel de Métricas */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-[var(--dash-border)]">
          <div>
            <label className="block text-xs font-bold text-[var(--dash-text-secondary)] mb-2 uppercase tracking-wider">
              Tempo de Rotação das Métricas
            </label>
            <select 
              value={form.stats_carousel_interval || 5000}
              onChange={(e) => setForm({...form, stats_carousel_interval: Number(e.target.value)})}
              className="dash-select w-full bg-[var(--dash-input-bg)] border border-[var(--dash-border)] rounded-xl pl-4 py-3 text-sm text-[var(--dash-text-primary)] font-bold outline-none cursor-pointer"
            >
              <option value={3000}>3 segundos (Rápido)</option>
              <option value={4000}>4 segundos</option>
              <option value={5000}>5 segundos (Recomendado)</option>
              <option value={6000}>6 segundos</option>
              <option value={8000}>8 segundos (Calmo)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-[var(--dash-text-secondary)] mb-2 uppercase tracking-wider">
              Modo de Exibição das Métricas
            </label>
            <select 
              value={form.use_real_stats ? "real" : "ethical"}
              onChange={(e) => setForm({...form, use_real_stats: e.target.value === "real"})}
              className="dash-select w-full bg-[var(--dash-input-bg)] border border-[var(--dash-border)] rounded-xl pl-4 py-3 text-sm text-[var(--dash-text-primary)] font-bold outline-none cursor-pointer"
            >
              <option value="ethical">Garantias & Diferenciais (Modo Lançamento)</option>
              <option value="real">Métricas Reais da Plataforma (Modo Escala)</option>
            </select>
          </div>
        </div>

        <div className="pt-4 border-t border-[var(--dash-border)] flex items-center justify-end">
          <button 
            onClick={handleSave}
            disabled={saving}
            className="w-full sm:w-auto px-8 py-3.5 bg-emerald-500 text-white font-bold rounded-xl hover:bg-emerald-600 transition-colors flex items-center justify-center min-w-[200px] shadow-md active:scale-95 text-sm cursor-pointer"
          >
            {saving ? <Loader2 size={18} className="animate-spin" /> : "Salvar Alterações"}
          </button>
        </div>
      </div>
    </div>
  );
}
