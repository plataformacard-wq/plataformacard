"use client";

import { useState } from "react";
import { Loader2, Sparkles } from "lucide-react";
import { updateLandingSettings } from "../actions";

export function HeroClient({ initialSettings }: { initialSettings: any }) {
  const [saving, setSaving] = useState(false);
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

  return (
    <div className="bg-[var(--dash-surface)] border border-[var(--dash-border)] rounded-2xl p-6 sm:p-8 shadow-sm">
      <div className="flex items-center gap-3 mb-6 pb-4 border-b border-[var(--dash-border)]">
        <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-500">
          <Sparkles size={22} />
        </div>
        <div>
          <h2 className="text-lg font-bold text-[var(--dash-text-primary)]">Personalização do Hero & SEO</h2>
          <p className="text-xs text-[var(--dash-text-secondary)]">Gerencie a chamada principal da Landing Page e os metadados de busca.</p>
        </div>
      </div>

      <div className="space-y-6 max-w-3xl">
        <div>
          <label className="block text-sm font-bold text-[var(--dash-text-primary)] mb-2">
            Título Principal (Headline do Hero)
          </label>
          <input 
            type="text" 
            value={form.hero_headline}
            onChange={(e) => setForm({...form, hero_headline: e.target.value})}
            className="w-full bg-[var(--dash-input-bg)] border border-[var(--dash-border)] rounded-xl px-4 py-3 text-sm text-[var(--dash-text-primary)] focus:border-emerald-500 outline-none transition-colors"
            placeholder="Ex: Chega de catálogos PDFs desatualizados..."
          />
        </div>

        <div>
          <label className="block text-sm font-bold text-[var(--dash-text-primary)] mb-2">
            Subtítulo (Descrição do Hero)
          </label>
          <textarea 
            rows={3}
            value={form.hero_subtitle}
            onChange={(e) => setForm({...form, hero_subtitle: e.target.value})}
            className="w-full bg-[var(--dash-input-bg)] border border-[var(--dash-border)] rounded-xl px-4 py-3 text-sm text-[var(--dash-text-primary)] focus:border-emerald-500 outline-none transition-colors"
            placeholder="Ex: Crie uma vitrine premium para sua empresa..."
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-bold text-[var(--dash-text-primary)] mb-2">
              Meta Title (Título para SEO no Google)
            </label>
            <input 
              type="text" 
              value={form.seo_title}
              onChange={(e) => setForm({...form, seo_title: e.target.value})}
              className="w-full bg-[var(--dash-input-bg)] border border-[var(--dash-border)] rounded-xl px-4 py-3 text-sm text-[var(--dash-text-primary)] focus:border-emerald-500 outline-none transition-colors"
              placeholder="Ex: PlataformaShop | Cartão e Catálogo Digital Premium"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-[var(--dash-text-primary)] mb-2">
              URL da Imagem Mockup (Hero)
            </label>
            <input 
              type="text" 
              placeholder="Deixe em branco para usar a imagem padrão"
              value={form.hero_mockup_url || ""}
              onChange={(e) => setForm({...form, hero_mockup_url: e.target.value})}
              className="w-full bg-[var(--dash-input-bg)] border border-[var(--dash-border)] rounded-xl px-4 py-3 text-sm text-[var(--dash-text-primary)] focus:border-emerald-500 outline-none transition-colors"
            />
          </div>
        </div>

        <div className="pt-4 border-t border-[var(--dash-border)]">
          <button 
            onClick={handleSave}
            disabled={saving}
            className="px-6 py-3 bg-emerald-500 text-white font-bold rounded-xl hover:bg-emerald-600 transition-colors flex items-center justify-center min-w-[160px] shadow-md active:scale-95"
          >
            {saving ? <Loader2 size={18} className="animate-spin" /> : "Salvar Alterações"}
          </button>
        </div>
      </div>
    </div>
  );
}
