"use client";

import { useState } from "react";
import { Loader2, Settings, BarChart, Users, MessageSquare, Layout, Upload, Moon, Sun } from "lucide-react";
import { updateLandingSettings, uploadHeaderLogo } from "./actions";
import { TestimonialsTable } from "./TestimonialsTable";
import { PartnersTable } from "./PartnersTable";
import { FaqsTable } from "./FaqsTable";
import { PlansTable } from "./PlansTable";

type Props = {
  initialSettings: any;
  initialTestimonials: any[];
  initialPartners: any[];
  initialFaqs: any[];
  initialPlans: any[];
};

export function LandingPageClient({ initialSettings, initialTestimonials, initialPartners, initialFaqs, initialPlans }: Props) {
  const [activeTab, setActiveTab] = useState("header");
  const [savingSettings, setSavingSettings] = useState(false);
  const [uploadingLogoDark, setUploadingLogoDark] = useState(false);
  const [uploadingLogoLight, setUploadingLogoLight] = useState(false);

  const [settingsForm, setSettingsForm] = useState(initialSettings || {
    hero_headline: "Venda mais com o catálogo digital perfeito",
    hero_subtitle: "Crie uma vitrine premium para sua empresa, distribuidora ou força de vendas em minutos.",
    seo_title: "PlataformaShop | Catálogo Digital Premium",
    base_users: 1500,
    base_catalogs: 3200,
    hero_mockup_url: "",
    logo_url_dark: "",
    logo_url_light: "",
    social_instagram: "",
    social_facebook: "",
    social_linkedin: "",
    social_youtube: "",
    social_tiktok: "",
    social_x: "",
  });

  const tabs = [
    { id: "header", label: "Header & Logos", icon: Layout },
    { id: "geral", label: "Hero & SEO", icon: Settings },
    { id: "metricas", label: "Métricas Base", icon: BarChart },
    { id: "planos", label: "Planos", icon: BarChart },
    { id: "faq", label: "Perguntas (FAQ)", icon: MessageSquare },
    { id: "depoimentos", label: "Depoimentos", icon: MessageSquare },
    { id: "marcas", label: "Marcas Parceiras", icon: Users },
  ];

  async function handleUploadLogo(e: React.ChangeEvent<HTMLInputElement>, themeType: 'dark' | 'light') {
    const file = e.target.files?.[0];
    if (!file) return;
    const formData = new FormData();
    formData.append("file", file);

    if (themeType === 'dark') setUploadingLogoDark(true);
    else setUploadingLogoLight(true);

    try {
      const res = await uploadHeaderLogo(formData, themeType);
      if (res.success && res.publicUrl) {
        setSettingsForm((prev: any) => ({
          ...prev,
          [themeType === 'dark' ? 'logo_url_dark' : 'logo_url_light']: res.publicUrl
        }));
        alert(`Logo (${themeType === 'dark' ? 'Tema Escuro' : 'Tema Claro'}) enviada com sucesso! Clique em "Salvar Configurações" para publicar.`);
      } else {
        alert(res.error || "Erro ao fazer upload da logo.");
      }
    } catch (err) {
      alert("Erro ao enviar imagem.");
    } finally {
      if (themeType === 'dark') setUploadingLogoDark(false);
      else setUploadingLogoLight(false);
    }
  }

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
        {activeTab === "header" && (
          <div className="space-y-8 max-w-3xl">
            <div>
              <h3 className="text-lg font-bold text-[var(--dash-text-primary)] mb-1 flex items-center gap-2">
                <Layout size={20} className="text-emerald-500" />
                Logos do Header (Tema Escuro & Tema Claro)
              </h3>
              <p className="text-xs text-[var(--dash-text-secondary)]">
                Envie as logos oficiais da marca para cada modo de exibição. Se não for especificada uma logo para o tema claro, a logo do tema escuro será usada automaticamente.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Box Logo Tema Escuro */}
              <div className="border border-[var(--dash-border)] rounded-2xl p-5 bg-[#0a0a0a] text-white shadow-md">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm font-bold flex items-center gap-2 text-zinc-200">
                    <Moon size={16} className="text-emerald-400" /> Logo Tema Escuro
                  </span>
                  <span className="text-[10px] uppercase font-semibold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400">Modo Escuro</span>
                </div>
                
                {/* Preview Box */}
                <div className="h-24 rounded-xl bg-black border border-white/10 flex items-center justify-center p-4 mb-4 relative overflow-hidden">
                  <img 
                    src={settingsForm.logo_url_dark || "/logo_fundo_escuro_ps.png"} 
                    alt="Logo Tema Escuro" 
                    className="max-h-12 object-contain"
                  />
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-medium text-zinc-400 mb-1">URL da Imagem</label>
                    <input 
                      type="text" 
                      placeholder="https://..."
                      value={settingsForm.logo_url_dark || ""}
                      onChange={(e) => setSettingsForm({...settingsForm, logo_url_dark: e.target.value})}
                      className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-xs text-white outline-none focus:border-emerald-500"
                    />
                  </div>
                  <label className="flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-xs font-bold cursor-pointer transition-colors shadow-sm">
                    {uploadingLogoDark ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />}
                    {uploadingLogoDark ? "Enviando..." : "Upload Logo Escura"}
                    <input 
                      type="file" 
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => handleUploadLogo(e, 'dark')}
                      disabled={uploadingLogoDark}
                    />
                  </label>
                </div>
              </div>

              {/* Box Logo Tema Claro */}
              <div className="border border-[var(--dash-border)] rounded-2xl p-5 bg-zinc-50 text-zinc-900 shadow-md">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm font-bold flex items-center gap-2 text-zinc-800">
                    <Sun size={16} className="text-amber-500" /> Logo Tema Claro
                  </span>
                  <span className="text-[10px] uppercase font-semibold px-2 py-0.5 rounded bg-amber-500/20 text-amber-600">Modo Claro</span>
                </div>
                
                {/* Preview Box */}
                <div className="h-24 rounded-xl bg-white border border-zinc-200 flex items-center justify-center p-4 mb-4 relative overflow-hidden shadow-sm">
                  <img 
                    src={settingsForm.logo_url_light || settingsForm.logo_url_dark || "/logo_fundo_escuro_ps.png"} 
                    alt="Logo Tema Claro" 
                    className={`max-h-12 object-contain ${!settingsForm.logo_url_light && !settingsForm.logo_url_dark ? "invert brightness-0" : ""}`}
                  />
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-medium text-zinc-600 mb-1">URL da Imagem</label>
                    <input 
                      type="text" 
                      placeholder="https://..."
                      value={settingsForm.logo_url_light || ""}
                      onChange={(e) => setSettingsForm({...settingsForm, logo_url_light: e.target.value})}
                      className="w-full bg-white border border-zinc-300 rounded-lg px-3 py-2 text-xs text-zinc-900 outline-none focus:border-emerald-500"
                    />
                  </div>
                  <label className="flex items-center justify-center gap-2 px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-xs font-bold cursor-pointer transition-colors shadow-sm">
                    {uploadingLogoLight ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />}
                    {uploadingLogoLight ? "Enviando..." : "Upload Logo Clara"}
                    <input 
                      type="file" 
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => handleUploadLogo(e, 'light')}
                      disabled={uploadingLogoLight}
                    />
                  </label>
                </div>
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
            <div>
              <label className="block text-sm font-medium text-[var(--dash-text-primary)] mb-2">URL da Imagem Mockup (Hero)</label>
              <input 
                type="text" 
                placeholder="Deixe em branco para usar a imagem padrão"
                value={settingsForm.hero_mockup_url || ""}
                onChange={(e) => setSettingsForm({...settingsForm, hero_mockup_url: e.target.value})}
                className="w-full bg-transparent border border-[var(--dash-border)] rounded-xl px-4 py-2.5 text-[var(--dash-text-primary)] focus:border-emerald-500 outline-none transition-colors"
              />
            </div>

            <hr className="border-[var(--dash-border)] my-6" />
            <h3 className="text-lg font-bold text-[var(--dash-text-primary)] mb-4">Redes Sociais (Rodapé)</h3>
            <div className="grid grid-cols-2 gap-4">
              {['instagram', 'facebook', 'linkedin', 'youtube', 'tiktok', 'x'].map(social => (
                <div key={social}>
                  <label className="block text-xs font-medium text-[var(--dash-text-secondary)] mb-1 capitalize">{social}</label>
                  <input 
                    type="text" 
                    placeholder="URL completa..."
                    value={settingsForm[`social_${social}`] || ""}
                    onChange={(e) => setSettingsForm({...settingsForm, [`social_${social}`]: e.target.value})}
                    className="w-full bg-transparent border border-[var(--dash-border)] rounded-lg px-3 py-2 text-sm text-[var(--dash-text-primary)] focus:border-emerald-500 outline-none transition-colors"
                  />
                </div>
              ))}
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

        {activeTab === "faq" && (
          <FaqsTable initialData={initialFaqs} />
        )}

        {activeTab === "planos" && (
          <PlansTable initialData={initialPlans} />
        )}

        {activeTab === "marcas" && (
          <PartnersTable initialData={initialPartners} />
        )}
      </div>
    </div>
  );
}
