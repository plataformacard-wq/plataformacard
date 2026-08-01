"use client";

import { Loader2, BarChart3, Clock, ShieldCheck } from "lucide-react";

interface StatsCarouselSectionProps {
  form: any;
  setForm: React.Dispatch<React.SetStateAction<any>>;
  saving: boolean;
  handleSave: () => Promise<void>;
}

export function StatsCarouselSection({
  form,
  setForm,
  saving,
  handleSave,
}: StatsCarouselSectionProps) {
  return (
    <div className="bg-[var(--dash-surface)] border border-[var(--dash-border)] rounded-2xl p-6 sm:p-8 shadow-sm">
      <div className="flex items-center gap-3 mb-6 pb-4 border-b border-[var(--dash-border)]">
        <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-500">
          <BarChart3 size={22} />
        </div>
        <div>
          <h2 className="text-lg font-bold text-[var(--dash-text-primary)]">
            Carrossel de Métricas & Vantagens (Por Que Escolher a PlataformaShop)
          </h2>
          <p className="text-xs text-[var(--dash-text-secondary)]">
            Ajuste a velocidade de rotação e alterne entre o Modo Lançamento (Garantias e Diferenciais) e o Modo Escala (Métricas Reais da Plataforma).
          </p>
        </div>
      </div>

      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Controle do Tempo de Rotação */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-[var(--dash-text-secondary)] uppercase tracking-wider flex items-center gap-1.5">
              <Clock size={14} className="text-purple-500" />
              Tempo de Rotação do Carrossel
            </label>
            <select 
              value={form.stats_carousel_interval || 5000}
              onChange={(e) => setForm({...form, stats_carousel_interval: Number(e.target.value)})}
              className="dash-select w-full bg-[var(--dash-input-bg)] border border-[var(--dash-border)] rounded-xl pl-4 py-3 text-sm text-[var(--dash-text-primary)] font-bold outline-none cursor-pointer"
            >
              <option value={3000}>⚡ 3 segundos (Rotação Rápida)</option>
              <option value={4000}>⏱️ 4 segundos</option>
              <option value={5000}>⭐ 5 segundos (Recomendado)</option>
              <option value={6000}>⏳ 6 segundos</option>
              <option value={8000}>📖 8 segundos (Leitura Calma)</option>
            </select>
            <p className="text-[11px] text-[var(--dash-text-secondary)]">
              Intervalo de tempo até os 4 cards transicionarem para o próximo grupo.
            </p>
          </div>

          {/* Controle do Modo de Exibição */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-[var(--dash-text-secondary)] uppercase tracking-wider flex items-center gap-1.5">
              <ShieldCheck size={14} className="text-[#2CCB68]" />
              Modo de Exibição dos Dados
            </label>
            <select 
              value={form.use_real_stats ? "real" : "ethical"}
              onChange={(e) => setForm({...form, use_real_stats: e.target.value === "real"})}
              className="dash-select w-full bg-[var(--dash-input-bg)] border border-[var(--dash-border)] rounded-xl pl-4 py-3 text-sm text-[var(--dash-text-primary)] font-bold outline-none cursor-pointer"
            >
              <option value="ethical">🟢 Garantias & Diferenciais (Modo Lançamento - Sem dados fictícios)</option>
              <option value="real">🚀 Métricas Reais da Plataforma (Modo Escala)</option>
            </select>
            <p className="text-[11px] text-[var(--dash-text-secondary)]">
              {form.use_real_stats 
                ? "Exibindo os números totais agregados da plataforma (Catálogos, Empresas e Volume)." 
                : "Exibindo o carrossel rotativo ético com Garantias Técnicas, Fim dos PDFs e Experiência B2B."}
            </p>
          </div>
        </div>

        <div className="pt-4 border-t border-[var(--dash-border)] flex items-center justify-end">
          <button 
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="w-full sm:w-auto px-8 py-3.5 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl transition-colors flex items-center justify-center min-w-[220px] shadow-md active:scale-95 text-sm cursor-pointer"
          >
            {saving ? <Loader2 size={18} className="animate-spin" /> : "Salvar Configurações de Métricas"}
          </button>
        </div>
      </div>
    </div>
  );
}
