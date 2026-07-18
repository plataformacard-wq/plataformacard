"use client";

import { useState } from "react";
import { Loader2, Settings, BarChart, Users, MessageSquare } from "lucide-react";
import { updateLandingSettings } from "./actions";
import { TestimonialsTable } from "./TestimonialsTable";
import { PartnersTable } from "./PartnersTable";

type Props = {
  initialSettings: any;
  initialTestimonials: any[];
  initialPartners: any[];
};

export function LandingPageClient({ initialSettings, initialTestimonials, initialPartners }: Props) {
  const [activeTab, setActiveTab] = useState("geral");
  const [savingSettings, setSavingSettings] = useState(false);
  const [settingsForm, setSettingsForm] = useState(initialSettings || {
    hero_headline: "Venda mais com o catálogo digital perfeito",
    hero_subtitle: "Crie uma vitrine premium para sua empresa, distribuidora ou força de vendas em minutos.",
    seo_title: "PlataformaShop | Catálogo Digital Premium",
    base_users: 1500,
    base_catalogs: 3200,
  });

  const tabs = [
    { id: "geral", label: "Hero & SEO", icon: Settings },
    { id: "metricas", label: "Métricas Base", icon: BarChart },
    { id: "depoimentos", label: "Depoimentos", icon: MessageSquare },
    { id: "marcas", label: "Marcas Parceiras", icon: Users },
  ];

  async function handleSaveSettings() {
    setSavingSettings(true);
    try {
      const res = await updateLandingSettings(settingsForm);
      if (res?.error) {
        alert("Erro: " + res.error);
      } else {
        alert("Configurações salvas com sucesso!");
      }
    } catch (e) {
      alert("Erro ao salvar.");
    } finally {
      setSavingSettings(false);
    }
  }

  return (
    <div className="bg-[var(--dash-surface)] border border-[var(--dash-border)] rounded-2xl overflow-hidden shadow-sm">
      <div className="flex border-b border-[var(--dash-border)] overflow-x-auto">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-6 py-4 text-sm font-medium transition-colors border-b-2 whitespace-nowrap ${
              activeTab === tab.id 
                ? "border-emerald-500 text-emerald-500 bg-emerald-500/5" 
                : "border-transparent text-[var(--dash-text-secondary)] hover:bg-[var(--dash-hover-bg)]"
            }`}
          >
            <tab.icon size={18} />
            {tab.label}
          </button>
        ))}
      </div>

      <div className="p-6 md:p-8 min-h-[400px]">
        {activeTab === "geral" && (
          <div className="space-y-6 max-w-2xl">
            <div>
              <label className="block text-sm font-medium text-[var(--dash-text-primary)] mb-2">Título Principal (Hero)</label>
              <input 
                type="text" 
                value={settingsForm.hero_headline}
                onChange={(e) => setSettingsForm({...settingsForm, hero_headline: e.target.value})}
                className="w-full bg-transparent border border-[var(--dash-border)] rounded-xl px-4 py-2.5 text-[var(--dash-text-primary)] focus:border-emerald-500 outline-none transition-colors"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[var(--dash-text-primary)] mb-2">Subtítulo (Hero)</label>
              <textarea 
                rows={3}
                value={settingsForm.hero_subtitle}
                onChange={(e) => setSettingsForm({...settingsForm, hero_subtitle: e.target.value})}
                className="w-full bg-transparent border border-[var(--dash-border)] rounded-xl px-4 py-2.5 text-[var(--dash-text-primary)] focus:border-emerald-500 outline-none transition-colors"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[var(--dash-text-primary)] mb-2">Meta Title (SEO)</label>
              <input 
                type="text" 
                value={settingsForm.seo_title}
                onChange={(e) => setSettingsForm({...settingsForm, seo_title: e.target.value})}
                className="w-full bg-transparent border border-[var(--dash-border)] rounded-xl px-4 py-2.5 text-[var(--dash-text-primary)] focus:border-emerald-500 outline-none transition-colors"
              />
            </div>
            <button 
              onClick={handleSaveSettings}
              disabled={savingSettings}
              className="px-6 py-2.5 bg-emerald-500 text-white font-bold rounded-xl hover:bg-emerald-600 transition-colors flex items-center justify-center min-w-[140px]"
            >
              {savingSettings ? <Loader2 size={18} className="animate-spin" /> : "Salvar Configurações"}
            </button>
          </div>
        )}

        {activeTab === "metricas" && (
          <div className="space-y-6 max-w-2xl">
            <div className="bg-amber-500/10 border border-amber-500/20 text-amber-500 rounded-xl p-4 text-sm">
              Estes "Números Base" serão somados aos números reais do banco (se houver) para gerar o total exibido na Landing Page.
            </div>
            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-[var(--dash-text-primary)] mb-2">Usuários Base</label>
                <input 
                  type="number" 
                  value={settingsForm.base_users}
                  onChange={(e) => setSettingsForm({...settingsForm, base_users: Number(e.target.value)})}
                  className="w-full bg-transparent border border-[var(--dash-border)] rounded-xl px-4 py-2.5 text-[var(--dash-text-primary)] focus:border-emerald-500 outline-none transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--dash-text-primary)] mb-2">Catálogos Base</label>
                <input 
                  type="number" 
                  value={settingsForm.base_catalogs}
                  onChange={(e) => setSettingsForm({...settingsForm, base_catalogs: Number(e.target.value)})}
                  className="w-full bg-transparent border border-[var(--dash-border)] rounded-xl px-4 py-2.5 text-[var(--dash-text-primary)] focus:border-emerald-500 outline-none transition-colors"
                />
              </div>
            </div>
            <button 
              onClick={handleSaveSettings}
              disabled={savingSettings}
              className="px-6 py-2.5 bg-emerald-500 text-white font-bold rounded-xl hover:bg-emerald-600 transition-colors flex items-center justify-center min-w-[140px]"
            >
              {savingSettings ? <Loader2 size={18} className="animate-spin" /> : "Salvar Configurações"}
            </button>
          </div>
        )}

        {activeTab === "depoimentos" && (
          <TestimonialsTable initialData={initialTestimonials} />
        )}

        {activeTab === "marcas" && (
          <PartnersTable initialData={initialPartners} />
        )}
      </div>
    </div>
  );
}
