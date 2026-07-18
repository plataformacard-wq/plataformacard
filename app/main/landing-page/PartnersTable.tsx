"use client";

import { useState } from "react";
import { Plus, Edit2, Trash2, Loader2, X, Upload } from "lucide-react";
import { deletePartner, upsertPartner } from "./actions";
import { createClient } from "@/lib/supabase/client";

type Partner = {
  id?: string;
  name: string;
  image_url: string;
  is_active: boolean;
};

export function PartnersTable({ initialData }: { initialData: any[] }) {
  const [data, setData] = useState(initialData);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Partner | null>(null);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const defaultForm = { name: "", image_url: "", is_active: true };
  const [form, setForm] = useState<Partner>(defaultForm);

  const supabase = createClient();

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
    if (!confirm("Tem certeza que deseja remover este parceiro?")) return;
    setDeletingId(id);
    const res = await deletePartner(id);
    if (res.success) {
      setData(data.filter(d => d.id !== id));
    } else {
      alert(res.error);
    }
    setDeletingId(null);
  }

  async function handleSave() {
    setLoading(true);
    const res = await upsertPartner(form);
    if (res.success) {
      setIsModalOpen(false);
      window.location.reload();
    } else {
      alert(res.error);
    }
    setLoading(false);
  }

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2)}_${Date.now()}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('landing_assets')
        .upload(fileName, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: publicUrlData } = supabase.storage
        .from('landing_assets')
        .getPublicUrl(fileName);

      setForm({ ...form, image_url: publicUrlData.publicUrl });
    } catch (error) {
      console.error(error);
      alert("Erro no upload da imagem");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-[var(--dash-text-primary)]">Marcas Parceiras</h2>
        <button 
          onClick={openNew}
          className="flex items-center gap-2 bg-emerald-500 text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-emerald-600 transition-colors"
        >
          <Plus size={16} /> Adicionar Logo
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm text-[var(--dash-text-secondary)]">
          <thead className="bg-[var(--dash-surface-secondary)] text-[var(--dash-text-primary)] uppercase font-bold text-xs">
            <tr>
              <th className="px-4 py-3 rounded-l-lg">Logo</th>
              <th className="px-4 py-3">Nome</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3 rounded-r-lg text-right">Ações</th>
            </tr>
          </thead>
          <tbody>
            {data.map((item) => (
              <tr key={item.id} className="border-b border-[var(--dash-border)] hover:bg-[var(--dash-hover-bg)]">
                <td className="px-4 py-3">
                  <div className="h-10 w-20 bg-white/10 rounded flex items-center justify-center overflow-hidden p-1">
                    <img src={item.image_url} alt={item.name} className="max-h-full max-w-full object-contain filter invert opacity-80" />
                  </div>
                </td>
                <td className="px-4 py-3 font-medium text-[var(--dash-text-primary)]">{item.name}</td>
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
                <td colSpan={4} className="text-center py-8 text-zinc-500">Nenhuma logomarca cadastrada.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-[var(--dash-surface)] border border-[var(--dash-border)] rounded-2xl w-full max-w-md overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-[var(--dash-border)]">
              <h3 className="font-bold text-[var(--dash-text-primary)]">{editingItem ? "Editar Marca" : "Nova Marca"}</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-[var(--dash-text-secondary)] hover:text-white"><X size={20} /></button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-[var(--dash-text-secondary)] mb-1 uppercase">Nome da Empresa</label>
                <input 
                  type="text" value={form.name} onChange={e => setForm({...form, name: e.target.value})}
                  className="w-full bg-transparent border border-[var(--dash-border)] rounded-xl px-3 py-2 text-sm text-[var(--dash-text-primary)] outline-none focus:border-emerald-500"
                />
              </div>
              
              <div>
                <label className="block text-xs font-bold text-[var(--dash-text-secondary)] mb-2 uppercase">Logomarca</label>
                
                <div className="flex items-center gap-4">
                  {form.image_url ? (
                    <div className="h-16 w-32 bg-white/5 border border-[var(--dash-border)] rounded-lg flex items-center justify-center p-2 relative group">
                      <img src={form.image_url} alt="Preview" className="max-h-full max-w-full object-contain filter invert opacity-80" />
                      <button onClick={() => setForm({...form, image_url: ""})} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <X size={12} />
                      </button>
                    </div>
                  ) : (
                    <div className="h-16 w-32 bg-[var(--dash-surface-secondary)] border border-dashed border-[var(--dash-border)] rounded-lg flex items-center justify-center text-[var(--dash-text-secondary)] text-xs">
                      Sem imagem
                    </div>
                  )}

                  <div className="flex-1">
                    <label className="flex items-center justify-center gap-2 w-full bg-[var(--dash-surface-secondary)] border border-[var(--dash-border)] hover:bg-[var(--dash-hover-bg)] text-[var(--dash-text-primary)] px-4 py-2 rounded-xl text-sm font-medium cursor-pointer transition-colors">
                      {uploading ? <Loader2 size={16} className="animate-spin" /> : <><Upload size={16} /> Fazer Upload</>}
                      <input type="file" accept="image/*" className="hidden" onChange={handleFileUpload} disabled={uploading} />
                    </label>
                    <p className="text-[10px] text-[var(--dash-text-secondary)] mt-1 text-center">SVG ou PNG fundo transparente.</p>
                  </div>
                </div>
              </div>

              <div className="flex items-center mt-2 gap-2">
                <input 
                  type="checkbox" checked={form.is_active} onChange={e => setForm({...form, is_active: e.target.checked})}
                  className="w-4 h-4 rounded border-[var(--dash-border)] text-emerald-500 focus:ring-emerald-500 bg-transparent"
                />
                <label className="text-sm text-[var(--dash-text-primary)]">Ativo (Exibir na esteira)</label>
              </div>
            </div>
            <div className="p-4 border-t border-[var(--dash-border)] bg-[var(--dash-surface-secondary)] flex justify-end">
              <button 
                onClick={handleSave} disabled={loading || uploading}
                className="bg-emerald-500 text-white px-6 py-2 rounded-xl text-sm font-bold hover:bg-emerald-600 transition-colors flex items-center justify-center min-w-[120px] disabled:opacity-50"
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
