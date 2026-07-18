"use client";

import { useState } from "react";
import { Plus, Edit2, Trash2, Loader2, X } from "lucide-react";
import { deleteTestimonial, upsertTestimonial } from "./actions";

type Testimonial = {
  id?: string;
  name: string;
  initials: string;
  color: string;
  text: string;
  stars: number;
  is_active: boolean;
};

export function TestimonialsTable({ initialData }: { initialData: any[] }) {
  const [data, setData] = useState(initialData);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Testimonial | null>(null);
  const [loading, setLoading] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const defaultForm = { name: "", initials: "", color: "bg-blue-500", text: "", stars: 5, is_active: true };
  const [form, setForm] = useState<Testimonial>(defaultForm);

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
    if (!confirm("Tem certeza que deseja remover este depoimento?")) return;
    setDeletingId(id);
    const res = await deleteTestimonial(id);
    if (res.success) {
      setData(data.filter(d => d.id !== id));
    } else {
      alert(res.error);
    }
    setDeletingId(null);
  }

  async function handleSave() {
    setLoading(true);
    const res = await upsertTestimonial(form);
    if (res.success) {
      setIsModalOpen(false);
      // For simplicity, we just reload the page to get fresh data
      window.location.reload();
    } else {
      alert(res.error);
    }
    setLoading(false);
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-[var(--dash-text-primary)]">Depoimentos</h2>
        <button 
          onClick={openNew}
          className="flex items-center gap-2 bg-emerald-500 text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-emerald-600 transition-colors"
        >
          <Plus size={16} /> Adicionar
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm text-[var(--dash-text-secondary)]">
          <thead className="bg-[var(--dash-surface-secondary)] text-[var(--dash-text-primary)] uppercase font-bold text-xs">
            <tr>
              <th className="px-4 py-3 rounded-l-lg">Nome</th>
              <th className="px-4 py-3">Texto</th>
              <th className="px-4 py-3">Estrelas</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3 rounded-r-lg text-right">Ações</th>
            </tr>
          </thead>
          <tbody>
            {data.map((item) => (
              <tr key={item.id} className="border-b border-[var(--dash-border)] hover:bg-[var(--dash-hover-bg)]">
                <td className="px-4 py-3 font-medium text-[var(--dash-text-primary)]">
                  <div className="flex items-center gap-3">
                    <div className={`h-8 w-8 rounded-full flex items-center justify-center text-white text-xs font-bold ${item.color}`}>
                      {item.initials}
                    </div>
                    {item.name}
                  </div>
                </td>
                <td className="px-4 py-3 truncate max-w-[200px]" title={item.text}>{item.text}</td>
                <td className="px-4 py-3 text-amber-400">{"★".repeat(item.stars)}</td>
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
                <td colSpan={5} className="text-center py-8 text-zinc-500">Nenhum depoimento cadastrado.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-[var(--dash-surface)] border border-[var(--dash-border)] rounded-2xl w-full max-w-md overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-[var(--dash-border)]">
              <h3 className="font-bold text-[var(--dash-text-primary)]">{editingItem ? "Editar Depoimento" : "Novo Depoimento"}</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-[var(--dash-text-secondary)] hover:text-white"><X size={20} /></button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-[var(--dash-text-secondary)] mb-1 uppercase">Nome</label>
                <input 
                  type="text" value={form.name} onChange={e => setForm({...form, name: e.target.value})}
                  className="w-full bg-transparent border border-[var(--dash-border)] rounded-xl px-3 py-2 text-sm text-[var(--dash-text-primary)] outline-none focus:border-emerald-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[var(--dash-text-secondary)] mb-1 uppercase">Iniciais</label>
                  <input 
                    type="text" value={form.initials} onChange={e => setForm({...form, initials: e.target.value})} maxLength={3}
                    className="w-full bg-transparent border border-[var(--dash-border)] rounded-xl px-3 py-2 text-sm text-[var(--dash-text-primary)] outline-none focus:border-emerald-500 uppercase"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[var(--dash-text-secondary)] mb-1 uppercase">Cor (Tailwind)</label>
                  <input 
                    type="text" value={form.color} onChange={e => setForm({...form, color: e.target.value})}
                    placeholder="bg-red-500"
                    className="w-full bg-transparent border border-[var(--dash-border)] rounded-xl px-3 py-2 text-sm text-[var(--dash-text-primary)] outline-none focus:border-emerald-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-[var(--dash-text-secondary)] mb-1 uppercase">Texto</label>
                <textarea 
                  rows={3} value={form.text} onChange={e => setForm({...form, text: e.target.value})}
                  className="w-full bg-transparent border border-[var(--dash-border)] rounded-xl px-3 py-2 text-sm text-[var(--dash-text-primary)] outline-none focus:border-emerald-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[var(--dash-text-secondary)] mb-1 uppercase">Estrelas (1-5)</label>
                  <input 
                    type="number" min="1" max="5" value={form.stars} onChange={e => setForm({...form, stars: Number(e.target.value)})}
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
            <div className="p-4 border-t border-[var(--dash-border)] bg-[var(--dash-surface-secondary)] flex justify-end">
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
