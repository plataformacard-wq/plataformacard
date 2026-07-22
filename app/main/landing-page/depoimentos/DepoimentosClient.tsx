"use client";

import { useState } from "react";
import { Loader2, BarChart } from "lucide-react";
import { updateLandingSettings } from "../actions";
import { TestimonialsTable } from "../TestimonialsTable";

export function DepoimentosClient({ initialTestimonials, initialSettings }: { initialTestimonials: any[]; initialSettings: any }) {
  const [savingMetrics, setSavingMetrics] = useState(false);
  const [settingsForm, setSettingsForm] = useState(initialSettings || {
    hero_headline: initialSettings?.hero_headline || "",
    hero_subtitle: initialSettings?.hero_subtitle || "",
    seo_title: initialSettings?.seo_title || "",
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

  async function handleSaveMetrics() {
    setSavingMetrics(true);
    try {
      const res = await updateLandingSettings(settingsForm);
      if (res?.error) {
        alert("Erro: " + res.error);
      } else {
        alert("Métricas base atualizadas com sucesso!");
      }
    } catch (e) {
      alert("Erro ao salvar.");
    } finally {
      setSavingMetrics(false);
    }
  }

  return (
    <div className="space-y-8">
      {/* Bloco de Métricas Base */}
      <div className="bg-[var(--dash-surface)] border border-[var(--dash-border)] rounded-2xl p-6 sm:p-8 shadow-sm">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 rounded-xl bg-blue-500/10 text-blue-500">
            <BarChart size={20} />
          </div>
          <div>
            <h3 className="text-base font-bold text-[var(--dash-text-primary)]">Métricas & Números Base</h3>
            <p className="text-xs text-[var(--dash-text-secondary)]">Estes números serão somados aos dados reais da plataforma na seção de prova social.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-xl">
          <div>
            <label className="block text-xs font-bold text-[var(--dash-text-primary)] mb-1">Usuários Base</label>
            <input 
              type="number" 
              value={settingsForm.base_users}
              onChange={(e) => setSettingsForm({...settingsForm, base_users: Number(e.target.value)})}
              className="w-full bg-[var(--dash-input-bg)] border border-[var(--dash-border)] rounded-xl px-4 py-2.5 text-sm text-[var(--dash-text-primary)] focus:border-emerald-500 outline-none transition-colors"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-[var(--dash-text-primary)] mb-1">Catálogos Base</label>
            <input 
              type="number" 
              value={settingsForm.base_catalogs}
              onChange={(e) => setSettingsForm({...settingsForm, base_catalogs: Number(e.target.value)})}
              className="w-full bg-[var(--dash-input-bg)] border border-[var(--dash-border)] rounded-xl px-4 py-2.5 text-sm text-[var(--dash-text-primary)] focus:border-emerald-500 outline-none transition-colors"
            />
          </div>
        </div>

        <button 
          onClick={handleSaveMetrics}
          disabled={savingMetrics}
          className="mt-4 px-5 py-2.5 bg-emerald-500 text-white text-xs font-bold rounded-xl hover:bg-emerald-600 transition-colors flex items-center justify-center min-w-[140px]"
        >
          {savingMetrics ? <Loader2 size={16} className="animate-spin" /> : "Salvar Métricas"}
        </button>
      </div>

      {/* Tabela de Depoimentos */}
      <div className="bg-[var(--dash-surface)] border border-[var(--dash-border)] rounded-2xl p-6 sm:p-8 shadow-sm">
        <h3 className="text-base font-bold text-[var(--dash-text-primary)] mb-4">Depoimentos de Clientes</h3>
        <TestimonialsTable initialData={initialTestimonials} />
      </div>
    </div>
  );
}
