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
      const { error } = await supabase
        .from("catalogs")
        .update({
          name: catalog.name,
          description: catalog.description,
        })
        .eq("id", catalog.id);

      if (error) throw error;
      
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

        {/* Botão de Salvar Flutuante/Fixo */}
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
      </div>
    </div>
  );
}
