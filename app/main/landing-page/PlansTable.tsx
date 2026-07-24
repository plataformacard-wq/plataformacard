"use client";

import { useState } from "react";
import { Plus, Edit2, Trash2, Loader2, X, GripVertical } from "lucide-react";
import { Reorder, AnimatePresence } from "framer-motion";
import { deletePlan, upsertPlan, reorderPlans } from "./actions";
import { PLANS } from "@/lib/plans/feature-matrix";

import { PricingCard } from "@/components/landing-page/PricingCard";

type Plan = {
  id?: string;
  slug?: string;
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
  const [data, setData] = useState<Plan[]>(initialData);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Plan | null>(null);
  const [loading, setLoading] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isReordering, setIsReordering] = useState(false);
  const [isAnnualView, setIsAnnualView] = useState(true);

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

  async function handleReorder(newOrder: Plan[]) {
    setData(newOrder);
    setIsReordering(true);
    const validIds = newOrder.map(item => item.id).filter(Boolean) as string[];
    if (validIds.length > 0) {
      await reorderPlans(validIds);
    }
    setIsReordering(false);
  }

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

  // Identifica o plano oficial (Starter, PRO, Sales Team ou Franqueador/All Service) dinamicamente pelo slug, id ou nome
  const normFormSlug = (form.slug || form.id || '').toLowerCase();
  const normFormName = (form.name || '').toLowerCase();
  const combinedForm = `${normFormSlug} ${normFormName}`;

  const formOfficialPlan = (combinedForm.includes('franqueador') || combinedForm.includes('all_service') || combinedForm.includes('hibrida') || combinedForm.includes('enterprise'))
    ? PLANS.all_service
    : (combinedForm.includes('sales') || combinedForm.includes('team') || combinedForm.includes('premium') || combinedForm.includes('corporativo'))
      ? PLANS.sales_team 
      : combinedForm.includes('pro') 
        ? PLANS.pro 
        : PLANS.starter;

  const realMonthly = formOfficialPlan.monthlyPrice;
  const realAnnual = formOfficialPlan.annualPrice;

  return (
    <div>
      {/* 🔝 CABEÇALHO DO CMS COM CONTROLE DE CICLO (MENSAL/ANUAL) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-xl font-bold text-[var(--dash-text-primary)]">Planos</h2>
          <p className="text-xs text-[var(--dash-text-secondary)] mt-0.5 flex items-center gap-1.5 font-medium">
            <span>✋</span> Arraste os cards para alterar a ordem na Landing Page em tempo real.
            {isReordering && <span className="text-emerald-400 font-bold animate-pulse">(Salvando ordem...)</span>}
          </p>
        </div>

        {/* 🔄 Suíte de Alternância de Ciclo no CMS (Mensal vs Anual) */}
        <div className="flex items-center gap-2 bg-[var(--dash-surface-secondary)] border border-[var(--dash-border)] p-1 rounded-full shadow-sm">
          <button
            type="button"
            onClick={() => setIsAnnualView(false)}
            className={`px-4 py-1.5 text-xs font-bold rounded-full transition-all ${!isAnnualView ? 'bg-emerald-500 text-white shadow-md' : 'text-[var(--dash-text-secondary)] hover:text-white'}`}
          >
            📅 Mensal
          </button>
          <button
            type="button"
            onClick={() => setIsAnnualView(true)}
            className={`px-4 py-1.5 text-xs font-bold rounded-full transition-all ${isAnnualView ? 'bg-emerald-500 text-white shadow-md' : 'text-[var(--dash-text-secondary)] hover:text-white'}`}
          >
            🚀 Anual
          </button>
        </div>

        <button 
          onClick={openNew}
          className="flex items-center gap-2 bg-emerald-500 text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-emerald-600 transition-colors shadow-md active:scale-95 shrink-0"
        >
          <Plus size={16} /> Adicionar Plano
        </button>
      </div>

      {/* 📊 CANVAS ESCURO DO SITE (#0a0a0a) PARA RENDERIZAÇÃO AUTÊNTICA DOS CARDS */}
      <div className="p-6 sm:p-8 rounded-[28px] bg-[#0a0a0a] border border-zinc-800 shadow-2xl overflow-x-auto text-white">
        <Reorder.Group 
          axis="x" 
          values={data} 
          onReorder={handleReorder}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-stretch max-w-[1600px] min-w-[1000px] xl:min-w-0"
        >
          {data.map((item) => (
            <Reorder.Item
              key={item.id || item.name}
              value={item}
              className="relative flex flex-col h-full cursor-grab active:cursor-grabbing select-none group"
            >
              {/* 🛠️ Barra de Ações Superior do CMS (Arraste + Editar + Deletar) */}
              <div className="flex items-center justify-between px-4 py-2 bg-[#1c1c1e] border border-zinc-700/60 rounded-2xl mb-3 shadow-lg z-20 transition-all group-hover:border-emerald-500/50">
                <div className="flex items-center gap-1.5 text-zinc-300 group-hover:text-emerald-400 transition-colors">
                  <GripVertical size={16} />
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-zinc-300 group-hover:text-emerald-400">Arraste</span>
                </div>
                
                <div className="flex items-center gap-1">
                  {!item.is_active && (
                    <span className="text-[10px] font-bold text-red-400 bg-red-500/10 px-2 py-0.5 rounded border border-red-500/20 mr-1">
                      Inativo
                    </span>
                  )}
                  <button 
                    type="button"
                    onClick={(e) => { e.stopPropagation(); openEdit(item); }} 
                    className="p-1.5 text-blue-400 hover:bg-blue-500/20 rounded-lg transition-colors"
                    title="Editar Plano"
                  >
                    <Edit2 size={15} />
                  </button>
                  <button 
                    type="button"
                    onClick={(e) => { e.stopPropagation(); item.id && handleDelete(item.id); }} 
                    className="p-1.5 text-red-400 hover:bg-red-500/20 rounded-lg transition-colors"
                    title="Excluir Plano"
                  >
                    {deletingId === item.id ? <Loader2 size={15} className="animate-spin" /> : <Trash2 size={15} />}
                  </button>
                </div>
              </div>

              {/* 💎 Card Renderizado Exatamente Igual ao Site no Canvas Escuro #0a0a0a */}
              <div className="flex-1 flex flex-col">
                <PricingCard plan={item} isAnnual={isAnnualView} isInteractive={false} />
              </div>
            </Reorder.Item>
          ))}
          {data.length === 0 && (
            <div className="col-span-full text-center py-8 text-zinc-500">Nenhum plano cadastrado.</div>
          )}
        </Reorder.Group>
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
                
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-bold text-emerald-400 mb-1 uppercase tracking-wider flex items-center gap-1.5">
                      <span>⚡</span> Vincular Produto Kiwify
                    </label>
                    <select
                      value={form.slug || formOfficialPlan.slug}
                      onChange={(e) => {
                        const selectedSlug = e.target.value as keyof typeof PLANS;
                        const selectedPlan = PLANS[selectedSlug];
                        if (selectedPlan) {
                          setForm({
                            ...form,
                            slug: selectedPlan.slug,
                            name: selectedPlan.name,
                            badge_text: selectedPlan.badgeText || "",
                            price_monthly: `R$ ${selectedPlan.monthlyAnchor.toFixed(2).replace('.', ',')}`,
                            original_price: `R$ ${selectedPlan.monthlyPrice.toFixed(2).replace('.', ',')}`,
                            button_url: `/checkout?plan=${selectedPlan.slug}`,
                            subtitle: selectedPlan.slug === "starter"
                              ? "Para autônomos e pequenos negócios"
                              : selectedPlan.slug === "pro"
                              ? "O plano mais completo para acelerar vendas"
                              : selectedPlan.slug === "sales_team"
                              ? "Para equipes e médias empresas"
                              : "Para marcas, redes de franquias e catálogos matriz",
                          });
                        }
                      }}
                      className="dash-select w-full bg-[var(--dash-input-bg)] border border-[var(--dash-border)] rounded-xl pl-3 py-2 text-sm text-[var(--dash-text-primary)] outline-none focus:border-emerald-500 transition-colors font-medium"
                    >
                      <option value="starter" className="bg-[#1c1c1e] text-white">📦 Starter (Kiwify: R$ 59,90 | Anual R$ 39,90)</option>
                      <option value="pro" className="bg-[#1c1c1e] text-white">🚀 PRO (Kiwify: R$ 149,90 | Anual R$ 99,90)</option>
                      <option value="sales_team" className="bg-[#1c1c1e] text-white">💎 Sales Team / Premium (Kiwify: R$ 299,90 | Anual R$ 199,90)</option>
                      <option value="all_service" className="bg-[#1c1c1e] text-white">🏢 Franqueador / All Service (Kiwify: R$ 499,90 | Anual R$ 349,90)</option>
                    </select>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-[var(--dash-text-secondary)] mb-1 uppercase tracking-wider">Nome Exibido no Site</label>
                      <input 
                        type="text" value={form.name} onChange={e => setForm({...form, name: e.target.value})}
                        className="w-full bg-[var(--dash-input-bg)] border border-[var(--dash-border)] rounded-xl px-3 py-2 text-sm text-[var(--dash-text-primary)] outline-none focus:border-emerald-500 transition-colors"
                        placeholder="Ex: Franqueador"
                      />
                    </div>
                    <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex flex-col justify-center">
                      <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider block">🔒 Kiwify Protegido</span>
                      <span className="text-xs font-black text-[var(--dash-text-primary)] mt-0.5">
                        Mensal: R$ {realMonthly.toFixed(2).replace('.', ',')} | Anual: R$ {realAnnual.toFixed(2).replace('.', ',')}
                      </span>
                    </div>
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
                    <label className="block text-xs font-bold text-[var(--dash-text-secondary)] uppercase tracking-wider flex items-center gap-1.5">
                      Funcionalidades (Features)
                      <span className="text-[10px] text-[var(--dash-text-muted)] font-normal">(Arraste para reordenar)</span>
                    </label>
                    <button type="button" onClick={addFeature} className="text-xs text-emerald-500 hover:text-emerald-400 font-bold flex items-center gap-1">
                      <Plus size={14} /> Adicionar
                    </button>
                  </div>
                  
                  <Reorder.Group 
                    axis="y" 
                    values={form.features} 
                    onReorder={(newFeatures) => setForm({ ...form, features: newFeatures })}
                    className="space-y-2 max-h-56 overflow-y-auto pr-1"
                  >
                    <AnimatePresence>
                      {form.features.map((feat, idx) => (
                        <Reorder.Item
                          key={`feat-${idx}-${feat.slice(0, 10)}`}
                          value={feat}
                          initial={{ opacity: 0, y: -5 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -5 }}
                          className="flex items-center gap-2 bg-[var(--dash-surface-secondary)] border border-[var(--dash-border)] rounded-xl p-1.5 group cursor-grab active:cursor-grabbing hover:border-emerald-500/50 transition-colors shadow-sm"
                        >
                          <div className="text-[var(--dash-text-muted)] group-hover:text-emerald-500 transition-colors pl-1 shrink-0">
                            <GripVertical size={16} />
                          </div>
                          <input 
                            type="text" 
                            value={feat} 
                            onChange={e => updateFeature(idx, e.target.value)}
                            placeholder={`Feature ${idx + 1}`}
                            className="flex-1 bg-[var(--dash-input-bg)] border border-[var(--dash-border)] rounded-lg px-3 py-1.5 text-sm text-[var(--dash-text-primary)] outline-none focus:border-emerald-500 transition-colors"
                          />
                          <button 
                            type="button"
                            onClick={() => removeFeature(idx)} 
                            className="p-1.5 text-red-500 hover:bg-red-500/10 rounded-lg shrink-0 transition-colors"
                          >
                            <Trash2 size={16} />
                          </button>
                        </Reorder.Item>
                      ))}
                    </AnimatePresence>
                  </Reorder.Group>

                  {form.features.length === 0 && (
                    <p className="text-sm text-zinc-500 italic text-center py-2">Nenhuma funcionalidade adicionada.</p>
                  )}
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
                  <PricingCard plan={form} isAnnual={false} isInteractive={false} officialPlan={formOfficialPlan} />
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
                  <PricingCard plan={form} isAnnual={true} isInteractive={false} officialPlan={formOfficialPlan} />
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

