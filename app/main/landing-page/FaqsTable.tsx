"use client";

import { useState } from "react";
import { Plus, Edit2, Trash2, Loader2, X } from "lucide-react";
import { deleteFaq, upsertFaq } from "./actions";

type Faq = {
  id?: string;
  question: string;
  answer: string;
  display_order: number;
  is_active: boolean;
};

export function FaqsTable({ initialData }: { initialData: any[] }) {
  const [data, setData] = useState(initialData);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Faq | null>(null);
  const [loading, setLoading] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const defaultForm = { question: "", answer: "", display_order: 0, is_active: true };
  const [form, setForm] = useState<Faq>(defaultForm);

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
    if (!confirm("Tem certeza que deseja remover este FAQ?")) return;
    setDeletingId(id);
    const res = await deleteFaq(id);
    if (res.success) {
      setData(data.filter(d => d.id !== id));
    } else {
      alert(res.error);
    }
    setDeletingId(null);
  }

  async function handleSave() {
    setLoading(true);
    const res = await upsertFaq(form);
    if (res.success) {
      setIsModalOpen(false);
      window.location.reload();
    } else {
      alert(res.error);
    }
    setLoading(false);
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-[var(--dash-text-primary)]">Perguntas Frequentes (FAQ)</h2>
        <button 
          onClick={openNew}
          className="flex items-center gap-2 bg-emerald-500 text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-emerald-600 transition-colors"
        >
          <Plus size={16} /> Adicionar FAQ
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm text-[var(--dash-text-secondary)]">
          <thead className="bg-[var(--dash-surface-secondary)] text-[var(--dash-text-primary)] uppercase font-bold text-xs">
            <tr>
              <th className="px-4 py-3 rounded-l-lg w-16 text-center">Ordem</th>
              <th className="px-4 py-3">Pergunta</th>
              <th className="px-4 py-3">Resposta</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3 rounded-r-lg text-right">Ações</th>
            </tr>
          </thead>
          <tbody>
            {data.map((item) => (
              <tr key={item.id} className="border-b border-[var(--dash-border)] hover:bg-[var(--dash-hover-bg)]">
                <td className="px-4 py-3 text-center font-bold">{item.display_order}</td>
                <td className="px-4 py-3 font-medium text-[var(--dash-text-primary)] max-w-[250px] truncate" title={item.question}>{item.question}</td>
                <td className="px-4 py-3 truncate max-w-[300px]" title={item.answer}>{item.answer}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-1 rounded-full text-xs font-bold ${item.is_active ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'}`}>
                    {item.is_active ? "Ativo" : "Inativo"}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  <button onClick={() => openEdit(item)} className="p-2 text-blue-500 hover:bg-blue-500/10 rounded-lg">
                    <Edit2 size={16} />
                  </button>
                  <button onClick={() => item.id && handleDelete(item.id)} className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg ml-1">
                    {deletingId === item.id ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
                  </button>
                </td>
              </tr>
            ))}
            {data.length === 0 && (
              <tr>
                <td colSpan={5} className="text-center py-8 text-zinc-500">Nenhum FAQ cadastrado.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-[var(--dash-surface)] border border-[var(--dash-border)] rounded-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between p-4 border-b border-[var(--dash-border)] shrink-0">
              <h3 className="font-bold text-[var(--dash-text-primary)]">{editingItem ? "Editar FAQ" : "Novo FAQ"}</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-[var(--dash-text-secondary)] hover:text-white"><X size={20} /></button>
            </div>
            <div className="p-6 space-y-4 overflow-y-auto">
              <div>
                <label className="block text-xs font-bold text-[var(--dash-text-secondary)] mb-1 uppercase">Pergunta</label>
                <input 
                  type="text" value={form.question} onChange={e => setForm({...form, question: e.target.value})}
                  className="w-full bg-transparent border border-[var(--dash-border)] rounded-xl px-3 py-2 text-sm text-[var(--dash-text-primary)] outline-none focus:border-emerald-500"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-[var(--dash-text-secondary)] mb-1 uppercase">Resposta</label>
                <textarea 
                  rows={4} value={form.answer} onChange={e => setForm({...form, answer: e.target.value})}
                  className="w-full bg-transparent border border-[var(--dash-border)] rounded-xl px-3 py-2 text-sm text-[var(--dash-text-primary)] outline-none focus:border-emerald-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
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
                  <label className="text-sm text-[var(--dash-text-primary)]">Ativo (Visível)</label>
                </div>
              </div>
            </div>
            <div className="p-4 border-t border-[var(--dash-border)] bg-[var(--dash-surface-secondary)] flex justify-end shrink-0">
              <button 
                onClick={handleSave} disabled={loading}
                className="bg-emerald-500 text-white px-6 py-2 rounded-xl text-sm font-bold hover:bg-emerald-600 transition-colors flex items-center justify-center min-w-[120px]"
              >
                {loading ? <Loader2 size={16} className="animate-spin" /> : "Salvar"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
