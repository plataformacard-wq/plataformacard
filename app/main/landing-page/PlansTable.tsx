"use client";

import { useState } from "react";
import { Plus, Edit2, Trash2, Loader2, X } from "lucide-react";
import { deletePlan, upsertPlan } from "./actions";

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

  // Preview Math for Realtime Modal
  const parsePricePreview = (str: string | undefined | null) => {
    if (!str) return 0;
    const numericStr = str.replace(/[^0-9,]/g, '').replace(',', '.');
    return parseFloat(numericStr) || 0;
  };

  const previewBasePrice = parsePricePreview(form.price_monthly || form.price_text);
  let previewAnnualPrice = 0;
  const discountType = form.annual_discount_type || 'fixed';
  const discountValue = Number(form.annual_discount_value) || 0;

  if (discountType === 'percentage') {
    previewAnnualPrice = previewBasePrice * (1 - (discountValue / 100));
  } else {
    previewAnnualPrice = previewBasePrice - discountValue;
  }
  if (previewAnnualPrice <= 0 && previewBasePrice > 0) {
    previewAnnualPrice = previewBasePrice;
  }
  const previewActiveDiscount = previewBasePrice - previewAnnualPrice;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-[var(--dash-text-primary)]">Planos</h2>
        <button 
          onClick={openNew}
          className="flex items-center gap-2 bg-emerald-500 text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-emerald-600 transition-colors"
        >
          <Plus size={16} /> Adicionar Plano
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {data.map((item) => (
          <div key={item.id} className="bg-[var(--dash-surface-secondary)] border border-[var(--dash-border)] rounded-2xl p-6 relative flex flex-col">
            <div className="absolute top-4 right-4 flex gap-2">
              <button onClick={() => openEdit(item)} className="p-2 text-blue-500 hover:bg-blue-500/10 rounded-lg">
                <Edit2 size={16} />
              </button>
              <button onClick={() => item.id && handleDelete(item.id)} className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg">
                {deletingId === item.id ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
              </button>
            </div>
            
            {!item.is_active && (
              <span className="absolute top-4 left-4 px-2 py-1 bg-red-500/10 text-red-500 text-xs font-bold rounded-full">Inativo</span>
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
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-[var(--dash-surface)] border border-[var(--dash-border)] rounded-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between p-4 border-b border-[var(--dash-border)] shrink-0">
              <h3 className="font-bold text-[var(--dash-text-primary)]">{editingItem ? "Editar Plano" : "Novo Plano"}</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-[var(--dash-text-secondary)] hover:text-white"><X size={20} /></button>
            </div>
            <div className="p-6 space-y-6 overflow-y-auto">
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[var(--dash-text-secondary)] mb-1 uppercase">Nome do Plano</label>
                  <input 
                    type="text" value={form.name} onChange={e => setForm({...form, name: e.target.value})}
                    className="w-full bg-transparent border border-[var(--dash-border)] rounded-xl px-3 py-2 text-sm text-[var(--dash-text-primary)] outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[var(--dash-text-secondary)] mb-1 uppercase">Preço Mensal (Base)</label>
                  <input 
                    type="text" value={form.price_monthly || ""} onChange={e => setForm({...form, price_monthly: e.target.value})}
                    placeholder="Ex: R$ 59,90/mês"
                    className="w-full bg-transparent border border-[var(--dash-border)] rounded-xl px-3 py-2 text-sm text-[var(--dash-text-primary)] outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-2">
                  <label className="block text-xs font-bold text-[var(--dash-text-secondary)] uppercase">Tipo de Desconto Anual</label>
                  <select
                    value={form.annual_discount_type || "fixed"}
                    onChange={e => setForm({...form, annual_discount_type: e.target.value as any})}
                    className="dash-select w-full bg-transparent border border-[var(--dash-border)] rounded-xl px-3 py-2 text-sm text-[var(--dash-text-primary)] outline-none focus:border-emerald-500"
                  >
                    <option value="fixed" className="bg-[#1c1c1e]">Fixo (Desconto em R$)</option>
                    <option value="percentage" className="bg-[#1c1c1e]">Porcentagem (Desconto em %)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-[var(--dash-text-secondary)] mb-1 uppercase">
                    Valor do Desconto mensal {form.annual_discount_type === 'percentage' ? '(%)' : '(R$)'}
                  </label>
                  <input 
                    type="number" step="0.01" value={form.annual_discount_value || 0} onChange={e => setForm({...form, annual_discount_value: Number(e.target.value)})}
                    placeholder={form.annual_discount_type === 'percentage' ? "Ex: 20 (para 20%)" : "Ex: 50.00 (para R$ 50 OFF)"}
                    className="w-full bg-transparent border border-[var(--dash-border)] rounded-xl px-3 py-2 text-sm text-[var(--dash-text-primary)] outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[var(--dash-text-secondary)] mb-1 uppercase">Subtítulo</label>
                <input 
                  type="text" value={form.subtitle} onChange={e => setForm({...form, subtitle: e.target.value})}
                  className="w-full bg-transparent border border-[var(--dash-border)] rounded-xl px-3 py-2 text-sm text-[var(--dash-text-primary)] outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[var(--dash-text-secondary)] mb-1 uppercase">Badge (Opcional)</label>
                  <input 
                    type="text" value={form.badge_text || ""} onChange={e => setForm({...form, badge_text: e.target.value})}
                    placeholder="Ex: Mais Popular"
                    className="w-full bg-transparent border border-[var(--dash-border)] rounded-xl px-3 py-2 text-sm text-[var(--dash-text-primary)] outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[var(--dash-text-secondary)] mb-1 uppercase">Tema Visual</label>
                  <select 
                    value={form.theme} onChange={e => setForm({...form, theme: e.target.value})}
                    className="dash-select w-full bg-transparent border border-[var(--dash-border)] rounded-xl px-3 py-2 text-sm text-[var(--dash-text-primary)] outline-none focus:border-emerald-500"
                  >
                    <option value="dark" className="bg-[#1c1c1e]">Dark (Padrão)</option>
                    <option value="green" className="bg-[#1c1c1e]">Green (Destaque)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[var(--dash-text-secondary)] mb-1 uppercase">Texto do Botão</label>
                  <input 
                    type="text" value={form.button_text} onChange={e => setForm({...form, button_text: e.target.value})}
                    className="w-full bg-transparent border border-[var(--dash-border)] rounded-xl px-3 py-2 text-sm text-[var(--dash-text-primary)] outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[var(--dash-text-secondary)] mb-1 uppercase">Link do Botão</label>
                  <input 
                    type="text" value={form.button_url} onChange={e => setForm({...form, button_url: e.target.value})}
                    className="w-full bg-transparent border border-[var(--dash-border)] rounded-xl px-3 py-2 text-sm text-[var(--dash-text-primary)] outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <hr className="border-[var(--dash-border)]" />

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-xs font-bold text-[var(--dash-text-secondary)] uppercase">Funcionalidades (Features)</label>
                  <button onClick={addFeature} className="text-xs text-emerald-500 hover:text-emerald-400 font-bold flex items-center gap-1">
                    <Plus size={12} /> Adicionar
                  </button>
                </div>
                <div className="space-y-2">
                  {form.features.map((feat, idx) => (
                    <div key={idx} className="flex gap-2">
                      <input 
                        type="text" value={feat} onChange={e => updateFeature(idx, e.target.value)}
                        placeholder={`Feature ${idx + 1}`}
                        className="flex-1 bg-transparent border border-[var(--dash-border)] rounded-xl px-3 py-2 text-sm text-[var(--dash-text-primary)] outline-none focus:border-emerald-500"
                      />
                      <button onClick={() => removeFeature(idx)} className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg shrink-0">
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
                  <label className="block text-xs font-bold text-[var(--dash-text-secondary)] mb-1 uppercase">Ordem de Exibição</label>
                  <input 
                    type="number" value={form.display_order} onChange={e => setForm({...form, display_order: Number(e.target.value)})}
                    className="w-full bg-transparent border border-[var(--dash-border)] rounded-xl px-3 py-2 text-sm text-[var(--dash-text-primary)] outline-none focus:border-emerald-500"
                  />
                </div>
                <div className="flex items-center mt-6 gap-2">
                  <input 
                    type="checkbox" checked={form.is_active} onChange={e => setForm({...form, is_active: e.target.checked})}
                    className="w-4 h-4 rounded border-[var(--dash-border)] text-emerald-500 focus:ring-emerald-500 bg-transparent"
                  />
                  <label className="text-sm text-[var(--dash-text-primary)]">Ativo (Visível na página)</label>
                </div>
              </div>

              <div className="mt-6 border border-[var(--dash-border)] rounded-xl bg-black/5 dark:bg-white/5 overflow-hidden">
                <div className="bg-black/10 dark:bg-white/10 px-4 py-2 text-xs font-bold text-[var(--dash-text-secondary)] uppercase tracking-wider">
                  Preview Matemático (Tempo Real)
                </div>
                <div className="p-4 grid grid-cols-2 gap-6 divide-x divide-[var(--dash-border)]">
                  {/* Mensal */}
                  <div className="flex flex-col">
                    <span className="text-[10px] font-bold text-zinc-500 mb-2 uppercase">Cliente Vê (Modo Mensal)</span>
                    <div className="text-2xl font-black text-[var(--dash-text-primary)]">
                      R$ {previewBasePrice.toFixed(2).replace('.', ',')}/mês
                    </div>
                    <div className="text-[10px] text-zinc-500 mt-1">
                      Total de R$ {(previewBasePrice * 12).toFixed(2).replace('.', ',')}
                    </div>
                    <div className="text-[10px] text-zinc-600 mt-1">Preço puro. Sem ancoragem.</div>
                  </div>
                  {/* Anual */}
                  <div className="flex flex-col pl-6 relative">
                    <span className="text-[10px] font-bold text-emerald-500 mb-2 uppercase">Cliente Vê (Modo Anual)</span>
                    {previewActiveDiscount > 0 && (
                       <div className="absolute top-0 right-0 px-1.5 py-0.5 rounded text-[9px] uppercase font-bold bg-[#FFB800] text-black shadow-sm">
                         R$ {previewActiveDiscount.toFixed(2).replace('.', ',')} OFF/mês
                       </div>
                    )}
                    <div className="text-xs font-bold text-zinc-500 line-through">
                      R$ {previewBasePrice.toFixed(2).replace('.', ',')}
                    </div>
                    <div className="text-2xl font-black text-[var(--dash-text-primary)]">
                      R$ {previewAnnualPrice.toFixed(2).replace('.', ',')}<span className="text-sm font-normal text-zinc-400">/mês</span>
                    </div>
                    {previewActiveDiscount > 0 && (
                      <div className="text-[9px] font-bold text-emerald-500 mt-1 uppercase">
                        economize R$ {(previewActiveDiscount * 12).toFixed(2).replace('.', ',')} por ano
                      </div>
                    )}
                    <div className="text-[10px] text-zinc-500 mt-2 leading-tight">
                      Fatura total: R$ {(previewAnnualPrice * 12).toFixed(2).replace('.', ',')}/ano
                    </div>
                  </div>
                </div>
              </div>

            </div>

            <div className="p-4 border-t border-[var(--dash-border)] bg-[var(--dash-surface-secondary)] flex justify-end shrink-0">
              <button 
                onClick={handleSave} disabled={loading}
                className="bg-emerald-500 text-white px-6 py-2 rounded-xl text-sm font-bold hover:bg-emerald-600 transition-colors flex items-center justify-center min-w-[120px]"
              >
                {loading ? <Loader2 size={16} className="animate-spin" /> : "Salvar Plano"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
