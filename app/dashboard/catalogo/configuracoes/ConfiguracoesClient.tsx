"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Save,
  Loader2,
  CheckCircle2,
  BookOpen,
  FileText,
  Layout,
  Palette
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";

interface Catalog {
  id: string;
  name: string;
  description: string | null;
  [key: string]: any;
}

interface ConfiguracoesClientProps {
  catalog: Catalog;
}

export default function ConfiguracoesClient({ catalog: initialCatalog }: ConfiguracoesClientProps) {
  const [catalog, setCatalog] = useState(initialCatalog);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const supabase = createClient();

  const handleSave = async () => {
    setSaving(true);
    setSaved(false);

    try {
      // 1. Update Catalog Basic Info
      const { error: catError } = await supabase
        .from("catalogs")
        .update({
          name: catalog.name,
          description: catalog.description,
        })
        .eq("id", catalog.id);

      if (catError) throw catError;

      // 2. Update Organization Branding (CaaS Focus)
      if (catalog.organization_id) {
        const { error: orgError } = await supabase
          .from("organizations")
          .update({
            accent_color: catalog.accent_color,
            secondary_color: catalog.secondary_color,
            business_model: catalog.business_model,
          })
          .eq("id", catalog.organization_id);

        if (orgError) throw orgError;
      }

      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err: any) {
      alert("Erro ao salvar: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-20">
      <div>
        <h1 className="text-3xl font-black text-[var(--dash-text-primary)]">Configurações do Catálogo</h1>
        <p className="text-[var(--dash-text-muted)] mt-2">Ajuste a identidade visual e informações básicas da sua vitrine digital.</p>
      </div>

      <div className="grid gap-8">
        {/* Sessão: Identidade do Catálogo */}
        <section className="bg-[var(--dash-surface)] border border-[var(--dash-border)] rounded-[32px] p-8 shadow-sm space-y-6">
          <div className="flex items-center gap-3 border-b border-[var(--dash-border)] pb-6 mb-6">
            <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
              <BookOpen size={24} />
            </div>
            <div>
              <h3 className="text-xl font-bold">Informações Básicas</h3>
              <p className="text-sm text-[var(--dash-text-muted)]">Como seu catálogo aparece para os clientes.</p>
            </div>
          </div>

          <div className="grid gap-6">
            <div className="space-y-2">
              <label className="text-sm font-bold flex items-center gap-2">
                <Layout size={16} className="text-primary" /> Título do Catálogo
              </label>
              <input
                value={catalog.name}
                onChange={(e) => setCatalog({ ...catalog, name: e.target.value })}
                className="w-full p-4 bg-[var(--dash-hover-bg)] border border-[var(--dash-border)] rounded-2xl focus:ring-2 focus:ring-primary outline-none transition-all font-medium"
                placeholder="Ex: Coleção Outono/Inverno"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold flex items-center gap-2">
                <FileText size={16} className="text-primary" /> Descrição do Catálogo
              </label>
              <textarea
                value={catalog.description || ""}
                onChange={(e) => setCatalog({ ...catalog, description: e.target.value })}
                rows={4}
                className="w-full p-4 bg-[var(--dash-hover-bg)] border border-[var(--dash-border)] rounded-2xl focus:ring-2 focus:ring-primary outline-none transition-all resize-none leading-relaxed"
                placeholder="Uma breve apresentação sobre sua empresa ou esta coleção..."
              />
            </div>
          </div>
        </section>

        {/* Sessão: Branding do Catálogo (CaaS Focus) */}
        <section className="bg-[var(--dash-surface)] border border-[var(--dash-border)] rounded-[32px] p-8 shadow-sm space-y-6">
          <div className="flex items-center gap-3 border-b border-[var(--dash-border)] pb-6 mb-6">
            <div className="h-12 w-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-500">
              <Palette size={24} />
            </div>
            <div>
              <h3 className="text-xl font-bold">Identidade Visual (CaaS)</h3>
              <p className="text-sm text-[var(--dash-text-muted)]">Configure cores e logo para sua vitrine digital pura.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <label className="text-sm font-bold block flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-emerald-500" /> Cor Predominante (Primária)
              </label>
              <div className="flex items-center gap-4 p-4 bg-[var(--dash-hover-bg)] border border-[var(--dash-border)] rounded-2xl">
                <input
                  type="color"
                  value={catalog.accent_color || "#0f172a"}
                  onChange={(e) => setCatalog({ ...catalog, accent_color: e.target.value })}
                  className="w-12 h-12 rounded-xl cursor-pointer border-none bg-transparent"
                />
                <div className="flex-1">
                  <p className="text-xs font-bold uppercase tracking-widest">{catalog.accent_color || "#0f172a"}</p>
                  <p className="text-[10px] text-[var(--dash-text-muted)]">Usada na faixa de categorias e títulos.</p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <label className="text-sm font-bold block flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-emerald-500" /> Cor de Acento (Secundária)
              </label>
              <div className="flex items-center gap-4 p-4 bg-[var(--dash-hover-bg)] border border-[var(--dash-border)] rounded-2xl">
                <input
                  type="color"
                  value={catalog.secondary_color || "#25D366"}
                  onChange={(e) => setCatalog({ ...catalog, secondary_color: e.target.value })}
                  className="w-12 h-12 rounded-xl cursor-pointer border-none bg-transparent"
                />
                <div className="flex-1">
                  <p className="text-xs font-bold uppercase tracking-widest">{catalog.secondary_color || "#25D366"}</p>
                  <p className="text-[10px] text-[var(--dash-text-muted)]">Usada em botões e stickers.</p>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <label className="text-sm font-bold block">Modelo de Negócio</label>
            <div className="flex gap-2">
              {[
                { id: 'B2B', label: 'Venda Atacado' },
                { id: 'B2C', label: 'Venda Varejo' },
                { id: 'CaaS', label: 'Catálogo Digital' }
              ].map((model) => (
                <button
                  key={model.id}
                  onClick={() => setCatalog({ ...catalog, business_model: model.id })}
                  className={`flex-1 py-3 rounded-xl text-xs font-bold transition-all border ${catalog.business_model === model.id
                      ? 'bg-primary text-white border-primary shadow-lg shadow-primary/20'
                      : 'bg-[var(--dash-hover-bg)] border-[var(--dash-border)] text-[var(--dash-text-muted)] hover:border-primary/50'
                    }`}
                >
                  {model.label}
                </button>
              ))}
            </div>
            <p className="text-[10px] text-[var(--dash-text-muted)] px-1">
              {catalog.business_model === 'CaaS'
                ? "✓ Modo Vitrine Pura: Foco total nos produtos, sem links externos."
                : "✓ Modo Padrão: Inclui informações do vendedor e links sociais."}
            </p>
          </div>
        </section>

        {/* Botão de Salvar Flutuante/Fixo */ }
  <div className="flex justify-end pt-4">
    <button
      onClick={handleSave}
      disabled={saving}
      className={`
              flex items-center gap-3 px-10 py-4 rounded-2xl font-black text-lg transition-all shadow-xl
              ${saved ? 'bg-green-500 text-white shadow-green-500/20' : 'bg-primary text-white shadow-primary/20 hover:scale-105 active:scale-95'}
              disabled:opacity-50
            `}
    >
      {saving ? (
        <Loader2 size={24} className="animate-spin" />
      ) : saved ? (
        <CheckCircle2 size={24} />
      ) : (
        <Save size={24} />
      )}
      {saved ? 'Salvo com Sucesso!' : saving ? 'Salvando...' : 'Salvar Alterações'}
    </button>
  </div>
      </div >
    </div >
  );
}
