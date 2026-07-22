"use client";

import { useState } from "react";
import { Loader2, Globe, Mail, Phone } from "lucide-react";
import { updateLandingSettings } from "../actions";

export function RodapeClient({ initialSettings }: { initialSettings: any }) {
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    hero_headline: initialSettings?.hero_headline || "Venda mais com o catálogo digital perfeito",
    hero_subtitle: initialSettings?.hero_subtitle || "Crie uma vitrine premium para sua empresa...",
    seo_title: initialSettings?.seo_title || "PlataformaShop | Catálogo Digital Premium",
    hero_mockup_url: initialSettings?.hero_mockup_url || "",
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
        alert("Rodapé & Redes Sociais salvos com sucesso!");
      }
    } catch (e) {
      alert("Erro ao salvar.");
    } finally {
      setSaving(false);
    }
  }

  const socialPlatforms = [
    { key: "instagram", label: "Instagram", placeholder: "https://instagram.com/suaempresa" },
    { key: "facebook", label: "Facebook", placeholder: "https://facebook.com/suaempresa" },
    { key: "linkedin", label: "LinkedIn", placeholder: "https://linkedin.com/company/suaempresa" },
    { key: "youtube", label: "YouTube", placeholder: "https://youtube.com/@suaempresa" },
    { key: "tiktok", label: "TikTok", placeholder: "https://tiktok.com/@suaempresa" },
    { key: "x", label: "X (antigo Twitter)", placeholder: "https://x.com/suaempresa" },
  ];

  return (
    <div className="bg-[var(--dash-surface)] border border-[var(--dash-border)] rounded-2xl p-6 sm:p-8 shadow-sm space-y-8">
      <div className="flex items-center gap-3 pb-4 border-b border-[var(--dash-border)]">
        <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-500">
          <Globe size={22} />
        </div>
        <div>
          <h2 className="text-lg font-bold text-[var(--dash-text-primary)]">Gestão do Rodapé & Redes Sociais</h2>
          <p className="text-xs text-[var(--dash-text-secondary)]">Configure os canais de contato, e-mail de suporte e perfis sociais exibidos no rodapé oficial.</p>
        </div>
      </div>

      <div className="space-y-6 max-w-3xl">
        {/* Canais de Suporte */}
        <div className="space-y-4">
          <h3 className="text-sm font-bold text-[var(--dash-text-primary)] uppercase tracking-wider flex items-center gap-2">
            <Mail size={16} className="text-emerald-500" /> Contato de Atendimento (Rodapé)
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-[var(--dash-text-secondary)] mb-1">E-mail de Suporte</label>
              <input 
                type="email" 
                placeholder="suporte@plataformashop.com.br"
                value={form.support_email}
                onChange={(e) => setForm({...form, support_email: e.target.value})}
                className="w-full bg-[var(--dash-input-bg)] border border-[var(--dash-border)] rounded-xl px-4 py-2.5 text-sm text-[var(--dash-text-primary)] focus:border-emerald-500 outline-none transition-colors"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[var(--dash-text-secondary)] mb-1">Telefone / WhatsApp de Atendimento</label>
              <input 
                type="text" 
                placeholder="(27) 99999-9999"
                value={form.support_phone}
                onChange={(e) => setForm({...form, support_phone: e.target.value})}
                className="w-full bg-[var(--dash-input-bg)] border border-[var(--dash-border)] rounded-xl px-4 py-2.5 text-sm text-[var(--dash-text-primary)] focus:border-emerald-500 outline-none transition-colors"
              />
            </div>
          </div>
        </div>

        <hr className="border-[var(--dash-border)]" />

        {/* Links de Redes Sociais */}
        <div className="space-y-4">
          <h3 className="text-sm font-bold text-[var(--dash-text-primary)] uppercase tracking-wider flex items-center gap-2">
            <Phone size={16} className="text-blue-500" /> Perfis em Redes Sociais
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {socialPlatforms.map(platform => (
              <div key={platform.key}>
                <label className="block text-xs font-bold text-[var(--dash-text-secondary)] mb-1">{platform.label}</label>
                <input 
                  type="text" 
                  placeholder={platform.placeholder}
                  value={(form as any)[`social_${platform.key}`] || ""}
                  onChange={(e) => setForm({...form, [`social_${platform.key}`]: e.target.value})}
                  className="w-full bg-[var(--dash-input-bg)] border border-[var(--dash-border)] rounded-xl px-4 py-2.5 text-sm text-[var(--dash-text-primary)] focus:border-emerald-500 outline-none transition-colors"
                />
              </div>
            ))}
          </div>
        </div>

        <div className="pt-4 border-t border-[var(--dash-border)]">
          <button 
            onClick={handleSave}
            disabled={saving}
            className="px-6 py-3 bg-emerald-500 text-white font-bold rounded-xl hover:bg-emerald-600 transition-colors flex items-center justify-center min-w-[160px] shadow-md active:scale-95"
          >
            {saving ? <Loader2 size={18} className="animate-spin" /> : "Salvar Configurações"}
          </button>
        </div>
      </div>
    </div>
  );
}
