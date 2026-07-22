"use client";

import { useState } from "react";
import { Plus, Edit2, Trash2, Loader2, X } from "lucide-react";
import { deletePlan, upsertPlan } from "./actions";
import { PLANS } from "@/lib/plans/feature-matrix";

import { PricingCard } from "@/components/landing-page/PricingCard";

type Plan = {
  id?: string;
  name: string;
  price_text?: string;
  price_monthly?: string;
  original_price?: string;
  annual_discount_type?: "fixed" | "percentage";
  annual_discount_value?: number;
  subtitle: string;
  badge_text: string;
  theme: string;
  features: string[];
  button_text: string;
  button_url: string;
  display_order: number;
  is_active: boolean;
};

export function PlansTable({ initialData }: { initialData: any[] }) {
  const [data, setData] = useState(initialData);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Plan | null>(null);
  const [loading, setLoading] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const defaultForm: Plan = { 
    name: "", 
    price_text: "", 
    price_monthly: "",
    original_price: "",
    annual_discount_type: "fixed",
    annual_discount_value: 0,
    subtitle: "", 
    badge_text: "", 
    theme: "dark", 
    features: [""], 
    button_text: "Criar Conta", 
    button_url: "/cadastro", 
    display_order: 0, 
    is_active: true 
  };
  const [form, setForm] = useState<Plan>(defaultForm);

  function openNew() {
    setEditingItem(null);
    setForm(defaultForm);
    setIsModalOpen(true);
  }

  function openEdit(item: any) {
    setEditingItem(item);
    setForm(item);
    setIsModalOpen(true);
  }

  async function handleDelete(id: string) {
    if (!confirm("Tem certeza que deseja remover este plano?")) return;
    setDeletingId(id);
    const res = await deletePlan(id);
    if (res.success) {
      setData(data.filter(d => d.id !== id));
    } else {
      alert(res.error);
    }
    setDeletingId(null);
  }

  async function handleSave() {
    // Filter empty features
    const cleanedForm = {
      ...form,
      features: form.features.filter(f => f.trim() !== ""),
      badge_text: form.badge_text?.trim() || null
    };

    setLoading(true);
    const res = await upsertPlan(cleanedForm);
    if (res.success) {
      setIsModalOpen(false);
      window.location.reload();
    } else {
      alert(res.error);
    }
    setLoading(false);
  }

  function addFeature() {
    setForm({ ...form, features: [...form.features, ""] });
  }

  function removeFeature(index: number) {
    const newFeatures = [...form.features];
    newFeatures.splice(index, 1);
    setForm({ ...form, features: newFeatures });
  }

  function updateFeature(index: number, value: string) {
    const newFeatures = [...form.features];
    newFeatures[index] = value;
    setForm({ ...form, features: newFeatures });
  }

  // Identifica o plano oficial (Starter, PRO ou Sales Team) dinamicamente pelo nome ou id
  const normFormName = (form.name || '').toLowerCase();
  const formOfficialPlan = normFormName.includes('pro') 
    ? PLANS.pro 
    : (normFormName.includes('sales') || normFormName.includes('premium') || normFormName.includes('team')) 
      ? PLANS.sales_team 
      : PLANS.starter;

  const realMonthly = formOfficialPlan.monthlyPrice;
  const realAnnual = formOfficialPlan.annualPrice;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-[var(--dash-text-primary)]">Planos</h2>
        <button 
          onClick={openNew}
          className="flex items-center gap-2 bg-emerald-500 text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-emerald-600 transition-colors shadow-md active:scale-95"
        >
          <Plus size={16} /> Adicionar Plano
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {data.map((item) => (
          <div key={item.id} className="bg-[var(--dash-surface-secondary)] border border-[var(--dash-border)] rounded-2xl p-6 relative flex flex-col shadow-sm hover:border-emerald-500/30 transition-all">
            <div className="absolute top-4 right-4 flex gap-2">
              <button onClick={() => openEdit(item)} className="p-2 text-blue-500 hover:bg-blue-500/10 rounded-lg transition-colors">
                <Edit2 size={16} />
              </button>
              <button onClick={() => item.id && handleDelete(item.id)} className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg transition-colors">
                {deletingId === item.id ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
              </button>
            </div>
            
            {!item.is_active && (
              <span className="absolute top-4 left-4 px-2.5 py-1 bg-red-500/10 text-red-500 text-xs font-bold rounded-full border border-red-500/20">Inativo</span>
            )}
            
            <div className="h-7 mt-8 mb-2">
              {item.badge_text && (
                <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${item.theme === 'green' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-black/10 dark:bg-white/10 text-zinc-600 dark:text-zinc-300'}`}>
                  {item.badge_text}
                </span>
              )}
            </div>

            <h3 className={`text-2xl font-bold ${item.theme === 'green' ? 'text-emerald-500' : 'text-[var(--dash-text-primary)]'}`}>
              {item.name}
            </h3>
            <div className="text-3xl font-bold text-[var(--dash-text-primary)] mt-2">{item.price_text}</div>
            <p className="text-[var(--dash-text-secondary)] mt-2 text-sm h-10">{item.subtitle}</p>

            <ul className="mt-6 space-y-3 flex-1 pb-4">
              {item.features.map((feat: string, idx: number) => (
                <li key={idx} className="flex items-center gap-2 text-sm text-[var(--dash-text-primary)]">
                  <span className="text-emerald-500">✓</span> {feat}
                </li>
              ))}
            </ul>
          </div>
        ))}
        {data.length === 0 && (
          <div className="col-span-full text-center py-8 text-zinc-500">Nenhum plano cadastrado.</div>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
          <div className="bg-[var(--dash-surface)] border border-[var(--dash-border)] rounded-[27px] w-full max-w-[95vw] xl:max-w-[1400px] overflow-hidden flex flex-col max-h-[92vh] shadow-2xl transition-all">
            
            {/* Header do Studio Modal */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--dash-border)] shrink-0 bg-[var(--dash-surface)]">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 flex items-center justify-center font-bold">
                  ⚡
                </div>
                <div>
                  <h3 className="font-extrabold text-base sm:text-lg text-[var(--dash-text-primary)]">
                    Studio de Planos: {editingItem ? `Editar "${editingItem.name}"` : "Criar Novo Plano"}
                  </h3>
                  <p className="text-xs text-[var(--dash-text-secondary)]">Edite as informações na esquerda e acompanhe a renderização exata da Landing Page ao vivo nas colunas de preview.</p>
                </div>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="text-[var(--dash-text-secondary)] hover:text-white p-2 rounded-xl hover:bg-white/5 transition-colors">
                <X size={20} />
              </button>
            </div>

            {/* Conteúdo em 3 Colunas */}
            <div className="p-6 overflow-y-auto grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              
              {/* 📝 COLUNA 1: FORMULÁRIO DE EDIÇÃO (4/12 de largura) */}
              <div className="lg:col-span-4 space-y-5 pr-2 lg:border-r border-[var(--dash-border)]">
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-[var(--dash-text-secondary)] mb-1 uppercase tracking-wider">Nome do Plano</label>
                    <input 
                      type="text" value={form.name} onChange={e => setForm({...form, name: e.target.value})}
                      className="w-full bg-[var(--dash-input-bg)] border border-[var(--dash-border)] rounded-xl px-3 py-2 text-sm text-[var(--dash-text-primary)] outline-none focus:border-emerald-500 transition-colors"
                      placeholder="Ex: PRO"
                    />
                  </div>
                  <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex flex-col justify-center">
                    <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider block">🔒 Cobrança Kiwify Protegida</span>
                    <span className="text-xs font-black text-[var(--dash-text-primary)] mt-0.5">
                      Mensal: R$ {realMonthly.toFixed(2).replace('.', ',')} | Anual: R$ {realAnnual.toFixed(2).replace('.', ',')}
                    </span>
                  </div>
                </div>

                {/* 🎯 Campos de Ancoragem Riscada (Mensal e Anual) */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-[var(--dash-text-secondary)] mb-1 uppercase tracking-wider">Âncora Mensal (R$)</label>
                    <input 
                      type="text" value={form.price_monthly || ""} onChange={e => setForm({...form, price_monthly: e.target.value})}
                      placeholder={`Ex: R$ ${formOfficialPlan.monthlyAnchor.toFixed(2).replace('.', ',')}`}
                      className="w-full bg-[var(--dash-input-bg)] border border-[var(--dash-border)] rounded-xl px-3 py-2 text-sm text-[var(--dash-text-primary)] outline-none focus:border-emerald-500 transition-colors font-medium"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[var(--dash-text-secondary)] mb-1 uppercase tracking-wider">Âncora Anual (R$)</label>
                    <input 
                      type="text" value={form.original_price || ""} onChange={e => setForm({...form, original_price: e.target.value})}
                      placeholder={`Ex: R$ ${formOfficialPlan.monthlyPrice.toFixed(2).replace('.', ',')}`}
                      className="w-full bg-[var(--dash-input-bg)] border border-[var(--dash-border)] rounded-xl px-3 py-2 text-sm text-[var(--dash-text-primary)] outline-none focus:border-emerald-500 transition-colors font-medium"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[var(--dash-text-secondary)] mb-1 uppercase tracking-wider">Subtítulo</label>
                  <input 
                    type="text" value={form.subtitle} onChange={e => setForm({...form, subtitle: e.target.value})}
                    placeholder="Ex: O plano mais completo para acelerar vendas"
                    className="w-full bg-[var(--dash-input-bg)] border border-[var(--dash-border)] rounded-xl px-3 py-2 text-sm text-[var(--dash-text-primary)] outline-none focus:border-emerald-500 transition-colors"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-[var(--dash-text-secondary)] mb-1 uppercase tracking-wider">Badge (Opcional)</label>
                    <input 
                      type="text" value={form.badge_text || ""} onChange={e => setForm({...form, badge_text: e.target.value})}
                      placeholder="Ex: Recomendado"
                      className="w-full bg-[var(--dash-input-bg)] border border-[var(--dash-border)] rounded-xl px-3 py-2 text-sm text-[var(--dash-text-primary)] outline-none focus:border-emerald-500 transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-[var(--dash-text-secondary)] mb-1 uppercase tracking-wider">Tema Visual</label>
                    <select 
                      value={form.theme} onChange={e => setForm({...form, theme: e.target.value})}
                      className="dash-select w-full bg-[var(--dash-input-bg)] border border-[var(--dash-border)] rounded-xl pl-3 py-2 text-sm text-[var(--dash-text-primary)] outline-none focus:border-emerald-500 transition-colors"
                    >
                      <option value="dark" className="bg-[#1c1c1e] text-white">Dark (Padrão)</option>
                      <option value="green" className="bg-[#1c1c1e] text-white">Green (Destaque Verde)</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-[var(--dash-text-secondary)] mb-1 uppercase tracking-wider">Texto do Botão</label>
                    <input 
                      type="text" value={form.button_text} onChange={e => setForm({...form, button_text: e.target.value})}
                      className="w-full bg-[var(--dash-input-bg)] border border-[var(--dash-border)] rounded-xl px-3 py-2 text-sm text-[var(--dash-text-primary)] outline-none focus:border-emerald-500 transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-[var(--dash-text-secondary)] mb-1 uppercase tracking-wider">Link do Botão</label>
                    <input 
                      type="text" value={form.button_url} onChange={e => setForm({...form, button_url: e.target.value})}
                      className="w-full bg-[var(--dash-input-bg)] border border-[var(--dash-border)] rounded-xl px-3 py-2 text-sm text-[var(--dash-text-primary)] outline-none focus:border-emerald-500 transition-colors"
                    />
                  </div>
                </div>

                <hr className="border-[var(--dash-border)]" />

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-xs font-bold text-[var(--dash-text-secondary)] uppercase tracking-wider">Funcionalidades (Features)</label>
                    <button onClick={addFeature} className="text-xs text-emerald-500 hover:text-emerald-400 font-bold flex items-center gap-1">
                      <Plus size={14} /> Adicionar
                    </button>
                  </div>
                  <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                    {form.features.map((feat, idx) => (
                      <div key={idx} className="flex gap-2">
                        <input 
                          type="text" value={feat} onChange={e => updateFeature(idx, e.target.value)}
                          placeholder={`Feature ${idx + 1}`}
                          className="flex-1 bg-[var(--dash-input-bg)] border border-[var(--dash-border)] rounded-xl px-3 py-2 text-sm text-[var(--dash-text-primary)] outline-none focus:border-emerald-500 transition-colors"
                        />
                        <button onClick={() => removeFeature(idx)} className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg shrink-0 transition-colors">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    ))}
                    {form.features.length === 0 && (
                      <p className="text-sm text-zinc-500 italic text-center py-2">Nenhuma funcionalidade adicionada.</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 border-t border-[var(--dash-border)] pt-4 mt-4">
                  <div>
                    <label className="block text-xs font-bold text-[var(--dash-text-secondary)] mb-1 uppercase tracking-wider">Ordem de Exibição</label>
                    <input 
                      type="number" value={form.display_order} onChange={e => setForm({...form, display_order: Number(e.target.value)})}
                      className="w-full bg-[var(--dash-input-bg)] border border-[var(--dash-border)] rounded-xl px-3 py-2 text-sm text-[var(--dash-text-primary)] outline-none focus:border-emerald-500 transition-colors"
                    />
                  </div>
                  <div className="flex items-center mt-6 gap-2">
                    <input 
                      type="checkbox" checked={form.is_active} onChange={e => setForm({...form, is_active: e.target.checked})}
                      className="w-4 h-4 rounded border-[var(--dash-border)] text-emerald-500 focus:ring-emerald-500 bg-transparent"
                    />
                    <label className="text-sm font-medium text-[var(--dash-text-primary)]">Ativo no site</label>
                  </div>
                </div>

              </div>

              {/* 📅 COLUNA 2: PREVIEW MENSAL AO VIVO (4/12 de largura) */}
              <div className="lg:col-span-4 flex flex-col h-full space-y-3">
                <div className="flex items-center justify-between px-4 py-2 rounded-xl bg-zinc-900 border border-zinc-800 shadow-sm">
                  <span className="text-xs font-bold text-zinc-200 uppercase tracking-wider flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse"></span> 📅 Preview Ciclo Mensal
                  </span>
                  <span className="text-[10px] font-extrabold text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/20">AO VIVO</span>
                </div>
                <div className="p-4 sm:p-5 rounded-[24px] bg-[#0A0A0A] border border-zinc-800 shadow-2xl flex-1 flex justify-center items-start">
                  <PricingCard plan={form} isAnnual={false} isInteractive={false} />
                </div>
              </div>

              {/* 🚀 COLUNA 3: PREVIEW ANUAL AO VIVO (4/12 de largura) */}
              <div className="lg:col-span-4 flex flex-col h-full space-y-3">
                <div className="flex items-center justify-between px-4 py-2 rounded-xl bg-zinc-900 border border-zinc-800 shadow-sm">
                  <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span> 🚀 Preview Ciclo Anual
                  </span>
                  <span className="text-[10px] font-extrabold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">AO VIVO</span>
                </div>
                <div className="p-4 sm:p-5 rounded-[24px] bg-[#0A0A0A] border border-zinc-800 shadow-2xl flex-1 flex justify-center items-start">
                  <PricingCard plan={form} isAnnual={true} isInteractive={false} />
                </div>
              </div>

            </div>

            {/* Footer do Modal */}
            <div className="p-4 border-t border-[var(--dash-border)] bg-[var(--dash-surface-secondary)] flex items-center justify-between shrink-0">
              <span className="text-xs text-[var(--dash-text-muted)] font-medium hidden sm:inline">
                💡 Qualquer alteração no formulário é refletida instantaneamente nos previews mensal e anual.
              </span>
              <div className="flex items-center gap-3 ml-auto">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl text-xs font-bold text-[var(--dash-text-secondary)] hover:bg-white/5 border border-[var(--dash-border)] transition-colors"
                >
                  Cancelar
                </button>
                <button 
                  type="button"
                  onClick={handleSave} disabled={loading}
                  className="bg-emerald-500 text-white px-6 py-2.5 rounded-xl text-xs font-bold hover:bg-emerald-600 transition-all shadow-md active:scale-95 flex items-center justify-center min-w-[130px] disabled:opacity-60"
                >
                  {loading ? <Loader2 size={16} className="animate-spin" /> : "Salvar Plano"}
                </button>
              </div>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}

